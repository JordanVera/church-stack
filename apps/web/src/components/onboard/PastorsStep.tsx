import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FieldSection } from './FieldSection';
import type { OnboardDraft } from './types';
import { newClientKey } from './types';

type Props = {
  draft: OnboardDraft;
  onChange: (next: OnboardDraft) => void;
};

const inputClass =
  'h-11 border-ink-200 bg-white/80 shadow-none focus-visible:border-brand-500 focus-visible:ring-brand-200 dark:border-ink-700 dark:bg-ink-950/60 dark:focus-visible:ring-brand-500/25';

export function PastorsStep({ draft, onChange }: Props) {
  return (
    <FieldSection
      title="Pastors & leaders"
      description="Add people who lead your church. You’ll be able to assign them to campuses next."
    >
      <div className="space-y-4">
        {draft.pastors.map((pastor, index) => (
          <div
            key={pastor.clientKey}
            className="relative space-y-3 rounded-2xl border border-ink-200/90 bg-gradient-to-br from-white to-ink-50/40 p-4 dark:border-ink-700 dark:from-ink-900 dark:to-ink-950"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold tracking-[0.14em] text-ink-400 uppercase">
                Pastor {index + 1}
              </p>
              {draft.pastors.length > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-ink-500"
                  onClick={() => {
                    const removedKey = pastor.clientKey;
                    onChange({
                      ...draft,
                      pastors: draft.pastors.filter((p) => p.clientKey !== removedKey),
                      locations: draft.locations.map((loc) =>
                        loc.pastorClientKey === removedKey
                          ? { ...loc, pastorClientKey: null }
                          : loc
                      ),
                    });
                  }}
                >
                  <Trash2 className="size-3.5" />
                  Remove
                </Button>
              ) : null}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="mb-1.5 text-ink-700 dark:text-ink-300">First name</Label>
                <Input
                  required
                  value={pastor.firstName}
                  onChange={(e) => {
                    const pastors = draft.pastors.map((p) =>
                      p.clientKey === pastor.clientKey
                        ? { ...p, firstName: e.target.value }
                        : p
                    );
                    onChange({ ...draft, pastors });
                  }}
                  className={inputClass}
                />
              </div>
              <div>
                <Label className="mb-1.5 text-ink-700 dark:text-ink-300">Last name</Label>
                <Input
                  required
                  value={pastor.lastName}
                  onChange={(e) => {
                    const pastors = draft.pastors.map((p) =>
                      p.clientKey === pastor.clientKey
                        ? { ...p, lastName: e.target.value }
                        : p
                    );
                    onChange({ ...draft, pastors });
                  }}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <Label className="mb-1.5 text-ink-700 dark:text-ink-300">Title</Label>
              <Input
                required
                value={pastor.title}
                onChange={(e) => {
                  const pastors = draft.pastors.map((p) =>
                    p.clientKey === pastor.clientKey ? { ...p, title: e.target.value } : p
                  );
                  onChange({ ...draft, pastors });
                }}
                placeholder="Senior Pastor"
                className={inputClass}
              />
            </div>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        className="gap-1.5"
        onClick={() =>
          onChange({
            ...draft,
            pastors: [
              ...draft.pastors,
              {
                clientKey: newClientKey('pastor'),
                firstName: '',
                lastName: '',
                title: '',
              },
            ],
          })
        }
      >
        <Plus className="size-3.5" />
        Add pastor
      </Button>
    </FieldSection>
  );
}
