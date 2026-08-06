/**
 * Optional email notify via Resend HTTP API.
 * Requires RESEND_API_KEY. Without it, logs and no-ops (dashboard remains source of truth).
 */

export type NotifyEmail = {
  to: string[];
  subject: string;
  text: string;
  /** Reply-To header (e.g. support submitter's email). */
  replyTo?: string | string[];
};

export type NotifyEmailResult =
  | { sent: true }
  | { sent: false; reason: 'missing_api_key' | 'no_recipients' | 'resend_error'; detail?: string };

export async function notifyByEmail(message: NotifyEmail): Promise<NotifyEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    'Gatherly Stack <onboarding@resend.dev>';

  const recipients = Array.from(
    new Set(message.to.map((e) => e.trim().toLowerCase()).filter(Boolean))
  );
  if (recipients.length === 0) {
    return { sent: false, reason: 'no_recipients' };
  }

  if (!apiKey) {
    console.info('[notify] RESEND_API_KEY unset; skipping email', {
      to: recipients,
      subject: message.subject,
    });
    return { sent: false, reason: 'missing_api_key' };
  }

  const replyTo = message.replyTo
    ? Array.from(
        new Set(
          (Array.isArray(message.replyTo) ? message.replyTo : [message.replyTo])
            .map((e) => e.trim().toLowerCase())
            .filter(Boolean)
        )
      )
    : undefined;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: recipients,
        subject: message.subject,
        text: message.text,
        ...(replyTo?.length ? { reply_to: replyTo } : {}),
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error('[notify] Resend failed', res.status, body);
      return {
        sent: false,
        reason: 'resend_error',
        detail: body || `HTTP ${res.status}`,
      };
    }
    return { sent: true };
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error('[notify] Resend error', err);
    return { sent: false, reason: 'resend_error', detail };
  }
}
