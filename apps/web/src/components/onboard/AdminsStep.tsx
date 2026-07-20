import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { OnboardDraft } from './types';

type Props = {
  draft: OnboardDraft;
  onChange: (next: OnboardDraft) => void;
};

export function AdminsStep({ draft, onChange }: Props) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-600 dark:text-ink-300">
        Add church-wide admin emails. We’ll use these as the primary contacts for your account.
        You can also add location-specific admins on the Locations step.
      </p>
      {draft.adminEmails.map((email, index) => (
        <div key={`admin-${index}`} className="flex items-end gap-2">
          <div className="flex-1">
            <Label className="mb-1 text-ink-700 dark:text-ink-300">
              Admin email {index + 1}
            </Label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => {
                const adminEmails = draft.adminEmails.map((item, i) =>
                  i === index ? e.target.value : item
                );
                onChange({ ...draft, adminEmails });
              }}
              placeholder="admin@yourchurch.org"
              className="h-10"
            />
          </div>
          {draft.adminEmails.length > 1 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                onChange({
                  ...draft,
                  adminEmails: draft.adminEmails.filter((_, i) => i !== index),
                })
              }
            >
              Remove
            </Button>
          ) : null}
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={() => onChange({ ...draft, adminEmails: [...draft.adminEmails, ''] })}
      >
        Add admin email
      </Button>
    </div>
  );
}
