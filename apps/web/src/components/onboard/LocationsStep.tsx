import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlanningCenterImport } from './PlanningCenterImport';
import type { OnboardDraft } from './types';
import { DAY_OPTIONS, newClientKey } from './types';

const selectClassName =
  'flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-brand-500 focus-visible:ring-3 focus-visible:ring-brand-200 dark:focus-visible:ring-brand-500/30';

type Props = {
  draft: OnboardDraft;
  onChange: (next: OnboardDraft) => void;
};

export function LocationsStep({ draft, onChange }: Props) {
  return (
    <div className="space-y-8">
      <p className="text-sm text-ink-600 dark:text-ink-300">
        Add each campus or site, optionally assign a pastor, and list weekly services.
      </p>
      <PlanningCenterImport draft={draft} onChange={onChange} />
      {draft.locations.map((location, locIndex) => (
        <div
          key={location.key}
          className="space-y-4 border-t border-ink-200 pt-6 first:border-t-0 first:pt-0 dark:border-ink-800"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-ink-800 dark:text-ink-200">
              Location {locIndex + 1}
            </p>
            {draft.locations.length > 1 ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  onChange({
                    ...draft,
                    locations: draft.locations.filter((l) => l.key !== location.key),
                  })
                }
              >
                Remove
              </Button>
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label className="mb-1 text-ink-700 dark:text-ink-300">Location name</Label>
              <Input
                required
                value={location.name}
                onChange={(e) => {
                  const locations = draft.locations.map((l) =>
                    l.key === location.key ? { ...l, name: e.target.value } : l
                  );
                  onChange({ ...draft, locations });
                }}
                placeholder="Grace Church North"
                className="h-10"
              />
            </div>
            <div className="sm:col-span-2">
              <Label className="mb-1 text-ink-700 dark:text-ink-300">Address</Label>
              <Input
                required
                value={location.address}
                onChange={(e) => {
                  const locations = draft.locations.map((l) =>
                    l.key === location.key ? { ...l, address: e.target.value } : l
                  );
                  onChange({ ...draft, locations });
                }}
                placeholder="123 Main St, City, ST 00000"
                className="h-10"
              />
            </div>
            <div className="sm:col-span-2">
              <Label className="mb-1 text-ink-700 dark:text-ink-300">
                Pastor <span className="font-normal text-ink-400">(optional)</span>
              </Label>
              <select
                className={selectClassName}
                value={location.pastorClientKey ?? ''}
                onChange={(e) => {
                  const locations = draft.locations.map((l) =>
                    l.key === location.key
                      ? { ...l, pastorClientKey: e.target.value || null }
                      : l
                  );
                  onChange({ ...draft, locations });
                }}
              >
                <option value="">None</option>
                {draft.pastors.map((p) => {
                  const label =
                    [p.firstName, p.lastName].filter(Boolean).join(' ') || 'Untitled pastor';
                  return (
                    <option key={p.clientKey} value={p.clientKey}>
                      {label}
                      {p.title ? ` — ${p.title}` : ''}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label className="text-ink-700 dark:text-ink-300">
                Location admin emails{' '}
                <span className="font-normal text-ink-400">(optional)</span>
              </Label>
              {(location.adminEmails.length ? location.adminEmails : ['']).map(
                (email, emailIndex) => (
                  <div key={`${location.key}-admin-${emailIndex}`} className="flex gap-2">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        const nextEmails =
                          location.adminEmails.length > 0
                            ? [...location.adminEmails]
                            : [''];
                        nextEmails[emailIndex] = e.target.value;
                        const locations = draft.locations.map((l) =>
                          l.key === location.key ? { ...l, adminEmails: nextEmails } : l
                        );
                        onChange({ ...draft, locations });
                      }}
                      placeholder="campus-admin@yourchurch.org"
                      className="h-10"
                    />
                    {location.adminEmails.length > 1 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const locations = draft.locations.map((l) =>
                            l.key !== location.key
                              ? l
                              : {
                                  ...l,
                                  adminEmails: l.adminEmails.filter((_, i) => i !== emailIndex),
                                }
                          );
                          onChange({ ...draft, locations });
                        }}
                      >
                        Remove
                      </Button>
                    ) : null}
                  </div>
                )
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const locations = draft.locations.map((l) =>
                    l.key !== location.key
                      ? l
                      : {
                          ...l,
                          adminEmails:
                            l.adminEmails.length > 0 ? [...l.adminEmails, ''] : ['', ''],
                        }
                  );
                  onChange({ ...draft, locations });
                }}
              >
                Add location admin
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-ink-800 dark:text-ink-200">Services</p>
            {location.services.map((service, svcIndex) => (
              <div
                key={service.key}
                className="grid gap-3 rounded-lg border border-ink-200 p-3 dark:border-ink-800 sm:grid-cols-[1fr_8rem_7rem_auto]"
              >
                <div>
                  <Label className="mb-1 text-ink-700 dark:text-ink-300">Name</Label>
                  <Input
                    required
                    value={service.name}
                    onChange={(e) => {
                      const locations = draft.locations.map((l) =>
                        l.key !== location.key
                          ? l
                          : {
                              ...l,
                              services: l.services.map((s) =>
                                s.key === service.key ? { ...s, name: e.target.value } : s
                              ),
                            }
                      );
                      onChange({ ...draft, locations });
                    }}
                    className="h-10"
                  />
                </div>
                <div>
                  <Label className="mb-1 text-ink-700 dark:text-ink-300">Day</Label>
                  <select
                    className={selectClassName}
                    value={service.dayOfWeek}
                    onChange={(e) => {
                      const dayOfWeek = Number(e.target.value);
                      const locations = draft.locations.map((l) =>
                        l.key !== location.key
                          ? l
                          : {
                              ...l,
                              services: l.services.map((s) =>
                                s.key === service.key ? { ...s, dayOfWeek } : s
                              ),
                            }
                      );
                      onChange({ ...draft, locations });
                    }}
                  >
                    {DAY_OPTIONS.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="mb-1 text-ink-700 dark:text-ink-300">Start</Label>
                  <Input
                    type="time"
                    required
                    value={service.startTime}
                    onChange={(e) => {
                      const locations = draft.locations.map((l) =>
                        l.key !== location.key
                          ? l
                          : {
                              ...l,
                              services: l.services.map((s) =>
                                s.key === service.key
                                  ? { ...s, startTime: e.target.value }
                                  : s
                              ),
                            }
                      );
                      onChange({ ...draft, locations });
                    }}
                    className="h-10"
                  />
                </div>
                <div className="flex items-end">
                  {location.services.length > 1 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const locations = draft.locations.map((l) =>
                          l.key !== location.key
                            ? l
                            : {
                                ...l,
                                services: l.services.filter((s) => s.key !== service.key),
                              }
                        );
                        onChange({ ...draft, locations });
                      }}
                    >
                      Remove
                    </Button>
                  ) : (
                    <span className="text-xs text-ink-400">#{svcIndex + 1}</span>
                  )}
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const locations = draft.locations.map((l) =>
                  l.key !== location.key
                    ? l
                    : {
                        ...l,
                        services: [
                          ...l.services,
                          {
                            key: newClientKey('svc'),
                            name: '',
                            dayOfWeek: 0,
                            startTime: '10:00',
                          },
                        ],
                      }
                );
                onChange({ ...draft, locations });
              }}
            >
              Add service
            </Button>
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() =>
          onChange({
            ...draft,
            locations: [
              ...draft.locations,
              {
                key: newClientKey('loc'),
                name: '',
                address: '',
                pastorClientKey: null,
                adminEmails: [],
                services: [
                  {
                    key: newClientKey('svc'),
                    name: 'Sunday Worship',
                    dayOfWeek: 0,
                    startTime: '10:00',
                  },
                ],
              },
            ],
          })
        }
      >
        Add location
      </Button>
    </div>
  );
}
