import type { ReactNode } from 'react';
import type { OnboardDraft } from './types';
import { dayLabel, formatTime } from './types';

type Props = {
  draft: OnboardDraft;
};

function ReviewBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-ink-200/90 bg-gradient-to-br from-white to-ink-50/50 p-5 dark:border-ink-700 dark:from-ink-900 dark:to-ink-950">
      <h3 className="text-xs font-semibold tracking-[0.16em] text-ink-400 uppercase">{title}</h3>
      <div className="mt-3 text-sm text-ink-700 dark:text-ink-300">{children}</div>
    </section>
  );
}

export function ReviewStep({ draft }: Props) {
  const churchAdmins = draft.adminEmails.map((e) => e.trim()).filter(Boolean);
  const socials = [
    ['Facebook', draft.facebookUrl],
    ['Instagram', draft.instagramUrl],
    ['YouTube', draft.youtubeUrl],
    ['Threads', draft.threadsUrl],
  ].filter(([, url]) => url.trim());

  return (
    <div className="space-y-4">
      <div className="mb-2">
        <h3 className="font-display text-base font-semibold tracking-tight text-ink-900 dark:text-white">
          Review & submit
        </h3>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
          Confirm everything looks right — you can go back to edit any step.
        </p>
      </div>

      <ReviewBlock title="Church">
        <p className="text-base font-semibold text-ink-900 dark:text-white">{draft.name}</p>
        <p className="text-ink-500 dark:text-ink-400">/{draft.slug}</p>
        {draft.tagline ? <p className="mt-1">{draft.tagline}</p> : null}
      </ReviewBlock>

      <ReviewBlock title="Admins">
        <ul className="space-y-1">
          {churchAdmins.map((email) => (
            <li key={email}>{email}</li>
          ))}
        </ul>
      </ReviewBlock>

      {socials.length > 0 ? (
        <ReviewBlock title="Social">
          <ul className="space-y-1">
            {socials.map(([label, url]) => (
              <li key={label}>
                <span className="text-ink-500">{label}: </span>
                <span className="break-all">{url}</span>
              </li>
            ))}
          </ul>
        </ReviewBlock>
      ) : null}

      <ReviewBlock title="Pastors">
        <ul className="space-y-1">
          {draft.pastors.map((p) => (
            <li key={p.clientKey}>
              {p.firstName} {p.lastName}
              <span className="text-ink-500 dark:text-ink-400"> — {p.title}</span>
            </li>
          ))}
        </ul>
      </ReviewBlock>

      <ReviewBlock title="Locations">
        <ul className="space-y-4">
          {draft.locations.map((loc) => {
            const pastor = draft.pastors.find((p) => p.clientKey === loc.pastorClientKey);
            const locAdmins = loc.adminEmails.map((e) => e.trim()).filter(Boolean);
            return (
              <li key={loc.key}>
                <p className="font-medium text-ink-900 dark:text-white">{loc.name}</p>
                <p className="text-ink-500 dark:text-ink-400">{loc.address}</p>
                {pastor ? (
                  <p className="mt-1">
                    Pastor: {pastor.firstName} {pastor.lastName}
                  </p>
                ) : null}
                {locAdmins.length > 0 ? (
                  <p className="mt-1">Admins: {locAdmins.join(', ')}</p>
                ) : null}
                {loc.services.length > 0 ? (
                  <ul className="mt-2 list-inside list-disc text-ink-600 dark:text-ink-300">
                    {loc.services.map((svc) => (
                      <li key={svc.key}>
                        {svc.name} — {dayLabel(svc.dayOfWeek)} {formatTime(svc.startTime)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1 text-ink-500">No services listed</p>
                )}
              </li>
            );
          })}
        </ul>
      </ReviewBlock>
    </div>
  );
}
