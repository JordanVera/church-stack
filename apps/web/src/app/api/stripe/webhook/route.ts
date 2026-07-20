import { prisma } from '@repo/database';
import { applyStripeSubscriptionToChurch, getStripe } from '@repo/api';
import type Stripe from 'stripe';

export const runtime = 'nodejs';

function priceIdFromSubscription(subscription: Stripe.Subscription): string | null {
  const item = subscription.items.data[0];
  const price = item?.price;
  if (!price) return null;
  return typeof price === 'string' ? price : price.id;
}

function churchIdFromMetadata(
  metadata: Stripe.Metadata | null | undefined
): string | null {
  const id = metadata?.churchId;
  return typeof id === 'string' && id.length > 0 ? id : null;
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return new Response('STRIPE_WEBHOOK_SECRET is not configured', { status: 500 });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return new Response('Missing stripe-signature', { status: 400 });
  }

  const body = await req.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature';
    return new Response(`Webhook Error: ${message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== 'subscription' || !session.subscription) break;

        const subscriptionId =
          typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription.id;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = priceIdFromSubscription(subscription);
        const tierFromMeta = session.metadata?.planTier;
        let priceFromTierEnv: string | null = null;
        if (tierFromMeta === 'SITE') priceFromTierEnv = process.env.STRIPE_PRICE_SITE ?? null;
        else if (tierFromMeta === 'GROWTH')
          priceFromTierEnv = process.env.STRIPE_PRICE_GROWTH ?? null;
        else if (tierFromMeta === 'CUSTOM')
          priceFromTierEnv = process.env.STRIPE_PRICE_CUSTOM ?? null;
        const resolvedPriceId = priceId ?? priceFromTierEnv;

        await applyStripeSubscriptionToChurch(prisma, {
          churchId: churchIdFromMetadata(session.metadata),
          customerId:
            typeof session.customer === 'string' ? session.customer : session.customer?.id,
          subscriptionId,
          priceId: resolvedPriceId,
          status: subscription.status,
        });
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await applyStripeSubscriptionToChurch(prisma, {
          churchId: churchIdFromMetadata(subscription.metadata),
          customerId:
            typeof subscription.customer === 'string'
              ? subscription.customer
              : subscription.customer.id,
          subscriptionId: subscription.id,
          priceId: priceIdFromSubscription(subscription),
          status: event.type === 'customer.subscription.deleted' ? 'canceled' : subscription.status,
        });
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error('[stripe webhook]', err);
    return new Response('Webhook handler failed', { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
