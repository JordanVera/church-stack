'use client';

import { useMemo, useState } from 'react';
import { useTheme } from 'next-themes';
import {
  BillingAddressElement,
  CheckoutElementsProvider,
  ContactDetailsElement,
  PaymentElement,
  useCheckoutElements,
} from '@stripe/react-stripe-js/checkout';
import { getStripePromise, isStripePublishableConfigured } from '@/lib/stripe-client';
import { Button } from '@/components/ui/button';

function CheckoutPaymentForm({ fallbackLabel }: { fallbackLabel: string }) {
  const checkoutState = useCheckoutElements();
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (checkoutState.type === 'loading') {
    return <p className="text-sm text-ink-600 dark:text-ink-300">Loading payment form…</p>;
  }

  if (checkoutState.type === 'error') {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">{checkoutState.error.message}</p>
    );
  }

  const { checkout } = checkoutState;
  const payAmount = checkout.total?.total?.amount ?? fallbackLabel;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

    const result = await checkout.confirm();

    if (result.type === 'error') {
      setMessage(result.error.message);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <ContactDetailsElement />
      <BillingAddressElement />
      <PaymentElement options={{ layout: 'tabs' }} />
      {message ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {message}
        </p>
      ) : null}
      <Button
        type="submit"
        className="h-11 w-full font-semibold"
        disabled={isSubmitting || checkout.canConfirm === false}
      >
        {isSubmitting ? 'Processing…' : `Subscribe — ${payAmount}`}
      </Button>
    </form>
  );
}

export function EmbeddedCheckoutForm({
  clientSecret,
  fallbackLabel,
}: {
  clientSecret: string;
  fallbackLabel: string;
}) {
  const { resolvedTheme } = useTheme();
  const stripePromise = getStripePromise();

  const appearance = useMemo(
    () => ({
      theme: (resolvedTheme === 'dark' ? 'night' : 'stripe') as 'night' | 'stripe',
      variables: {
        colorPrimary: '#1a8bbd',
        borderRadius: '12px',
        fontFamily: 'Inter, system-ui, sans-serif',
      },
    }),
    [resolvedTheme]
  );

  if (!isStripePublishableConfigured() || !stripePromise) {
    return (
      <p className="text-sm text-amber-700 dark:text-amber-300">
        Stripe publishable key is not configured. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.
      </p>
    );
  }

  return (
    <CheckoutElementsProvider
      stripe={stripePromise}
      options={{
        clientSecret,
        elementsOptions: { appearance },
      }}
    >
      <CheckoutPaymentForm fallbackLabel={fallbackLabel} />
    </CheckoutElementsProvider>
  );
}
