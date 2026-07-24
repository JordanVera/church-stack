'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DAY_LABELS, formatServiceTime } from '@/lib/format';

export type VisitLocation = {
  id: string;
  name: string;
  address: string | null;
  services: Array<{
    id: string;
    name: string;
    dayOfWeek: number;
    startTime: string;
  }>;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slug: string;
  locations: VisitLocation[];
  accentColor: string;
  secondaryColor: string;
};

function todayIsoLocal() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function dayOfWeekFromIso(iso: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]))).getUTCDay();
}

const fieldClass =
  'mt-1 h-11 w-full rounded-md border border-[var(--site-line)] bg-[var(--site-bg)] px-3 text-sm outline-none focus:border-[var(--church-primary)]';

export function PlanVisitModal({
  open,
  onOpenChange,
  slug,
  locations,
  accentColor,
  secondaryColor,
}: Props) {
  const multiLocation = locations.length > 1;
  const defaultLocationId = locations.length === 1 ? locations[0]!.id : '';

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [visitDate, setVisitDate] = useState(todayIsoLocal());
  const [locationId, setLocationId] = useState(defaultLocationId);
  const [serviceId, setServiceId] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setVisitDate(todayIsoLocal());
    setLocationId(defaultLocationId);
    setServiceId('');
    setNotes('');
    setSubmitting(false);
    setError(null);
    setDone(false);
  }, [open, defaultLocationId]);

  const selectedLocation = useMemo(
    () => locations.find((l) => l.id === locationId) ?? null,
    [locations, locationId]
  );

  const services = selectedLocation?.services ?? [];

  useEffect(() => {
    if (!serviceId) return;
    if (!services.some((s) => s.id === serviceId)) setServiceId('');
  }, [services, serviceId]);

  const selectedService = services.find((s) => s.id === serviceId) ?? null;
  const dateDay = dayOfWeekFromIso(visitDate);
  const dateMismatch =
    selectedService != null && dateDay != null && dateDay !== selectedService.dayOfWeek;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !visitDate) {
      setError('Please fill in your name, email, and visit date.');
      return;
    }
    if (multiLocation && !locationId) {
      setError('Please choose a location.');
      return;
    }
    if (services.length > 0 && !serviceId) {
      setError('Please choose a service.');
      return;
    }
    if (dateMismatch) {
      setError(
        `That date is a ${DAY_LABELS[dateDay!]}. ${selectedService!.name} meets on ${DAY_LABELS[selectedService!.dayOfWeek]}.`
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/visit-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          visitDate,
          locationId: locationId || null,
          serviceId: serviceId || null,
          notes: notes.trim() || null,
        }),
      });
      const body = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !body.ok) {
        throw new Error(body.error || 'Could not submit');
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <p
            className="text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: accentColor }}
          >
            Visit
          </p>
          <DialogTitle>Plan a visit</DialogTitle>
          <DialogDescription>
            Tell us a bit about yourself and when you&apos;d like to join us.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto px-6 py-5">
          {done ? (
            <div className="py-6 text-center">
              <p className="font-[family-name:var(--font-display)] text-2xl font-semibold">
                You&apos;re all set
              </p>
              <p className="mx-auto mt-3 max-w-sm text-[var(--site-muted)]">
                Thanks for planning a visit — we can&apos;t wait to welcome you. A member of our
                team will reach out within 24–48 hours via email or phone.
              </p>
              <DialogClose
                className="mt-8 inline-flex rounded-md px-5 py-3 text-sm font-semibold text-stone-900"
                style={{ backgroundColor: secondaryColor }}
              >
                Done
              </DialogClose>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={(e) => void submit(e)}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="visit-first" className="text-sm font-medium">
                    First name
                  </label>
                  <input
                    id="visit-first"
                    required
                    autoComplete="given-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="visit-last" className="text-sm font-medium">
                    Last name
                  </label>
                  <input
                    id="visit-last"
                    required
                    autoComplete="family-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={fieldClass}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="visit-email" className="text-sm font-medium">
                  Email
                </label>
                <input
                  id="visit-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={fieldClass}
                />
              </div>

              <div>
                <label htmlFor="visit-phone" className="text-sm font-medium">
                  Phone <span className="text-[var(--site-muted)]">(optional)</span>
                </label>
                <input
                  id="visit-phone"
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={fieldClass}
                />
              </div>

              <div>
                <label htmlFor="visit-date" className="text-sm font-medium">
                  Date you plan to visit
                </label>
                <input
                  id="visit-date"
                  type="date"
                  required
                  min={todayIsoLocal()}
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className={fieldClass}
                />
              </div>

              {multiLocation ? (
                <div>
                  <label htmlFor="visit-location" className="text-sm font-medium">
                    Location
                  </label>
                  <select
                    id="visit-location"
                    required
                    value={locationId}
                    onChange={(e) => setLocationId(e.target.value)}
                    className={fieldClass}
                  >
                    <option value="">Select a campus…</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                        {loc.address ? ` — ${loc.address}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              {selectedLocation && services.length > 0 ? (
                <div>
                  <label htmlFor="visit-service" className="text-sm font-medium">
                    Service
                  </label>
                  <select
                    id="visit-service"
                    required
                    value={serviceId}
                    onChange={(e) => setServiceId(e.target.value)}
                    className={fieldClass}
                  >
                    <option value="">Select a service…</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {DAY_LABELS[s.dayOfWeek]} · {s.name} · {formatServiceTime(s.startTime)}
                      </option>
                    ))}
                  </select>
                  {dateMismatch ? (
                    <p className="mt-1.5 text-xs text-amber-700 dark:text-amber-400">
                      Pick a {DAY_LABELS[selectedService!.dayOfWeek]} for this service.
                    </p>
                  ) : null}
                </div>
              ) : null}

              <div>
                <label htmlFor="visit-notes" className="text-sm font-medium">
                  Anything we should know?{' '}
                  <span className="text-[var(--site-muted)]">(optional)</span>
                </label>
                <textarea
                  id="visit-notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="First time visiting, bringing kids, etc."
                  className="mt-1 w-full rounded-md border border-[var(--site-line)] bg-[var(--site-bg)] px-3 py-2 text-sm outline-none focus:border-[var(--church-primary)]"
                />
              </div>

              {error ? <p className="text-sm text-red-600">{error}</p> : null}

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center rounded-md px-5 py-3.5 text-sm font-semibold text-stone-900 transition disabled:opacity-60"
                style={{ backgroundColor: secondaryColor }}
              >
                {submitting ? 'Sending…' : 'Submit visit plan'}
              </button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
