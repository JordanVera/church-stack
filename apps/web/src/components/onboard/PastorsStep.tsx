import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { OnboardDraft } from './types';
import { newClientKey } from './types';

type Props = {
  draft: OnboardDraft;
  onChange: (next: OnboardDraft) => void;
};

export function PastorsStep({ draft, onChange }: Props) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-ink-600 dark:text-ink-300">
        Add pastors or leaders. You can associate them with locations in the next step.
      </p>
      {draft.pastors.map((pastor, index) => (
        <div
          key={pastor.clientKey}
          className="space-y-3 border-t border-ink-200 pt-4 first:border-t-0 first:pt-0 dark:border-ink-800"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-ink-800 dark:text-ink-200">
              Pastor {index + 1}
            </p>
            {draft.pastors.length > 1 ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
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
                Remove
              </Button>
            ) : null}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="mb-1 text-ink-700 dark:text-ink-300">First name</Label>
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
                className="h-10"
              />
            </div>
            <div>
              <Label className="mb-1 text-ink-700 dark:text-ink-300">Last name</Label>
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
                className="h-10"
              />
            </div>
          </div>
          <div>
            <Label className="mb-1 text-ink-700 dark:text-ink-300">Title</Label>
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
              className="h-10"
            />
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
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
        Add pastor
      </Button>
    </div>
  );
}
