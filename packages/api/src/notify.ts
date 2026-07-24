/**
 * Optional email notify via Resend HTTP API.
 * If RESEND_API_KEY is unset, logs and no-ops (dashboard remains source of truth).
 */

export type NotifyEmail = {
  to: string[];
  subject: string;
  text: string;
};

export async function notifyByEmail(message: NotifyEmail): Promise<{ sent: boolean }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() ||
    'Church Stack <onboarding@resend.dev>';

  const recipients = Array.from(
    new Set(message.to.map((e) => e.trim().toLowerCase()).filter(Boolean))
  );
  if (recipients.length === 0) return { sent: false };

  if (!apiKey) {
    console.info('[notify] RESEND_API_KEY unset; skipping email', {
      to: recipients,
      subject: message.subject,
    });
    return { sent: false };
  }

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
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error('[notify] Resend failed', res.status, body);
      return { sent: false };
    }
    return { sent: true };
  } catch (err) {
    console.error('[notify] Resend error', err);
    return { sent: false };
  }
}
