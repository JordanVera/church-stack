import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FieldSection } from './FieldSection';
import { PlanningCenterImport } from './PlanningCenterImport';
import type { OnboardDraft } from './types';
import { DAY_OPTIONS, newClientKey } from './types';

const selectClassName =
  'flex h-11 w-full rounded-lg border border-ink-200 bg-white/80 px-3 text-sm outline-none focus-visible:border-brand-500 focus-visible:ring-3 focus-visible:ring-brand-200 dark:border-ink-700 dark:bg-ink-950/60 dark:focus-visible:ring-brand-500/25';

const inputClass =
  'h-11 border-ink-200 bg-white/80 shadow-none focus-visible:border-brand-500 focus-visible:ring-brand-200 dark:border-ink-700 dark:bg-ink-950/60 dark:focus-visible:ring-brand-500/25';

type Props = {
  draft: OnboardDraft;
  onChange: (next: OnboardDraft) => void;
};

export function LocationsStep({ draft, onChange }: Props) {
  return (
    <div className="space-y-8">
      <FieldSection
        title="Campuses & service times"
        description="Add each campus, optionally assign a pastor, and list weekly services — or import from Planning Center."
      >
        <PlanningCenterImport draft={draft} onChange={onChange} />
      </FieldSection>

      {draft.locations.map((location, locIndex) => (
        <div
          key={location.key}
          className="space-y-4 rounded-2xl border border-ink-200/90 bg-gradient-to-br from-white to-ink-50/40 p-5 dark:border-ink-700 dark:from-ink-900 dark:to-ink-950"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold tracking-[0.14em] text-ink-400 uppercase">
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
                className={inputClass}
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
                className={inputClass}
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
                    l.key === location.key ? { ...l, pastorClientKey: e.target.value || null } : l
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
                Location admin emails <span className="font-normal text-ink-400">(optional)</span>
              </Label>
              {(location.adminEmails.length ? location.adminEmails : ['']).map(
                (email, emailIndex) => (
                  <div key={`${location.key}-admin-${emailIndex}`} className="flex gap-2">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        const nextEmails =
                          location.adminEmails.length > 0 ? [...location.adminEmails] : [''];
                        nextEmails[emailIndex] = e.target.value;
                        const locations = draft.locations.map((l) =>
                          l.key === location.key ? { ...l, adminEmails: nextEmails } : l
                        );
                        onChange({ ...draft, locations });
                      }}
                      placeholder="campus-admin@yourchurch.org"
                      className={inputClass}
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
                          adminEmails: l.adminEmails.length > 0 ? [...l.adminEmails, ''] : ['', ''],
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
                className="grid gap-3 rounded-xl border border-ink-200/80 bg-white/70 p-3 dark:border-ink-700 dark:bg-ink-950/40 sm:grid-cols-[1fr_8rem_7rem_auto]"
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
                    className={inputClass}
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
                                s.key === service.key ? { ...s, startTime: e.target.value } : s
                              ),
                            }
                      );
                      onChange({ ...draft, locations });
                    }}
                    className={inputClass}
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
              className="h-9 border-ink-300 bg-white px-3 font-semibold text-ink-800 shadow-sm hover:border-ink-400 hover:bg-ink-50 dark:border-ink-500 dark:bg-ink-900 dark:text-ink-100 dark:hover:border-ink-400 dark:hover:bg-ink-800"
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
        className="h-10 gap-1.5 border-ink-300 bg-white px-4 font-semibold text-ink-800 shadow-sm hover:border-ink-400 hover:bg-ink-50 dark:border-ink-500 dark:bg-ink-900 dark:text-ink-100 dark:hover:border-ink-400 dark:hover:bg-ink-800"
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
        <Plus className="size-3.5" />
        Add location
      </Button>
    </div>
  );
}
