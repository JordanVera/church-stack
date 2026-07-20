import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { OnboardDraft } from './types';
import { slugifyName } from './types';

type Props = {
  draft: OnboardDraft;
  onChange: (next: OnboardDraft) => void;
};

export function ChurchStep({ draft, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="church-name" className="mb-1 text-ink-700 dark:text-ink-300">
          Church name
        </Label>
        <Input
          id="church-name"
          required
          value={draft.name}
          onChange={(e) => {
            const name = e.target.value;
            onChange({
              ...draft,
              name,
              slug: draft.slugTouched ? draft.slug : slugifyName(name),
            });
          }}
          placeholder="Grace Community Church"
          className="h-10"
        />
      </div>
      <div>
        <Label htmlFor="church-slug" className="mb-1 text-ink-700 dark:text-ink-300">
          Slug
        </Label>
        <Input
          id="church-slug"
          required
          value={draft.slug}
          onChange={(e) =>
            onChange({
              ...draft,
              slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
              slugTouched: true,
            })
          }
          placeholder="grace"
          pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
          className="h-10"
        />
        <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">
          Used in your site URL. Lowercase letters, numbers, and hyphens.
        </p>
      </div>
      <div>
        <Label htmlFor="church-tagline" className="mb-1 text-ink-700 dark:text-ink-300">
          Tagline <span className="font-normal text-ink-400">(optional)</span>
        </Label>
        <Input
          id="church-tagline"
          value={draft.tagline}
          onChange={(e) => onChange({ ...draft, tagline: e.target.value })}
          placeholder="A place to belong"
          className="h-10"
        />
      </div>
    </div>
  );
}
