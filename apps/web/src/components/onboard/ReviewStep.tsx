import type { OnboardDraft } from './types';
import { dayLabel, formatTime } from './types';

type Props = {
  draft: OnboardDraft;
};

export function ReviewStep({ draft }: Props) {
  const churchAdmins = draft.adminEmails.map((e) => e.trim()).filter(Boolean);

  return (
    <div className="space-y-6 text-sm">
      <section>
        <h3 className="font-semibold text-ink-900 dark:text-white">Church</h3>
        <p className="mt-1 text-ink-700 dark:text-ink-300">{draft.name}</p>
        <p className="text-ink-500 dark:text-ink-400">/{draft.slug}</p>
        {draft.tagline ? (
          <p className="mt-1 text-ink-600 dark:text-ink-300">{draft.tagline}</p>
        ) : null}
      </section>

      <section>
        <h3 className="font-semibold text-ink-900 dark:text-white">Church admins</h3>
        <ul className="mt-2 space-y-1 text-ink-700 dark:text-ink-300">
          {churchAdmins.map((email) => (
            <li key={email}>{email}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="font-semibold text-ink-900 dark:text-white">Pastors</h3>
        <ul className="mt-2 space-y-1 text-ink-700 dark:text-ink-300">
          {draft.pastors.map((p) => (
            <li key={p.clientKey}>
              {p.firstName} {p.lastName}
              <span className="text-ink-500 dark:text-ink-400"> — {p.title}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="font-semibold text-ink-900 dark:text-white">Locations</h3>
        <ul className="mt-2 space-y-4">
          {draft.locations.map((loc) => {
            const pastor = draft.pastors.find((p) => p.clientKey === loc.pastorClientKey);
            const locAdmins = loc.adminEmails.map((e) => e.trim()).filter(Boolean);
            return (
              <li key={loc.key} className="text-ink-700 dark:text-ink-300">
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
      </section>
    </div>
  );
}
