import type { ComponentType } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FieldSection } from './FieldSection';
import {
  FacebookIcon,
  InstagramIcon,
  ThreadsIcon,
  YoutubeIcon,
} from './SocialIcons';
import type { OnboardDraft } from './types';
import { slugifyName } from './types';

type Props = {
  draft: OnboardDraft;
  onChange: (next: OnboardDraft) => void;
};

const inputClass =
  'h-11 border-ink-200 bg-white/80 shadow-none focus-visible:border-brand-500 focus-visible:ring-brand-200 dark:border-ink-700 dark:bg-ink-950/60 dark:focus-visible:ring-brand-500/25';

export function ChurchStep({ draft, onChange }: Props) {
  return (
    <div className="space-y-10">
      <FieldSection
        title="About your church"
        description="This is how your church will appear across Church Stack."
      >
        <div>
          <Label htmlFor="church-name" className="mb-1.5 text-ink-700 dark:text-ink-300">
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
            className={inputClass}
          />
        </div>
        <div>
          <Label htmlFor="church-slug" className="mb-1.5 text-ink-700 dark:text-ink-300">
            URL slug
          </Label>
          <div className="flex overflow-hidden rounded-lg border border-ink-200 bg-white/80 dark:border-ink-700 dark:bg-ink-950/60">
            <span className="flex items-center border-r border-ink-200 bg-ink-50 px-3 text-sm text-ink-400 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-500">
              /
            </span>
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
              className="h-11 border-0 bg-transparent shadow-none focus-visible:ring-0"
            />
          </div>
          <p className="mt-1.5 text-xs text-ink-500 dark:text-ink-400">
            Lowercase letters, numbers, and hyphens only.
          </p>
        </div>
        <div>
          <Label htmlFor="church-tagline" className="mb-1.5 text-ink-700 dark:text-ink-300">
            Tagline <span className="font-normal text-ink-400">(optional)</span>
          </Label>
          <Input
            id="church-tagline"
            value={draft.tagline}
            onChange={(e) => onChange({ ...draft, tagline: e.target.value })}
            placeholder="A place to belong"
            className={inputClass}
          />
        </div>
      </FieldSection>

      <FieldSection
        title="Primary admin"
        description="We’ll use this email as your main contact. You can always add more admins later."
      >
        <div>
          <Label htmlFor="admin-email" className="mb-1.5 text-ink-700 dark:text-ink-300">
            Admin email
          </Label>
          <Input
            id="admin-email"
            type="email"
            required
            value={draft.adminEmails[0] ?? ''}
            onChange={(e) => {
              const rest = draft.adminEmails.slice(1);
              onChange({ ...draft, adminEmails: [e.target.value, ...rest] });
            }}
            placeholder="admin@yourchurch.org"
            className={inputClass}
          />
        </div>
        {draft.adminEmails.slice(1).map((email, index) => {
          const realIndex = index + 1;
          return (
            <div key={`admin-${realIndex}`} className="flex items-end gap-2">
              <div className="flex-1">
                <Label className="mb-1.5 text-ink-700 dark:text-ink-300">
                  Additional admin
                </Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    const adminEmails = draft.adminEmails.map((item, i) =>
                      i === realIndex ? e.target.value : item
                    );
                    onChange({ ...draft, adminEmails });
                  }}
                  placeholder="another@yourchurch.org"
                  className={inputClass}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mb-0.5"
                onClick={() =>
                  onChange({
                    ...draft,
                    adminEmails: draft.adminEmails.filter((_, i) => i !== realIndex),
                  })
                }
              >
                Remove
              </Button>
            </div>
          );
        })}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange({ ...draft, adminEmails: [...draft.adminEmails, ''] })}
        >
          Add another admin email
        </Button>
        <p className="rounded-lg border border-brand-200/70 bg-brand-50/80 px-3 py-2.5 text-xs leading-relaxed text-brand-900 dark:border-brand-500/20 dark:bg-brand-500/10 dark:text-brand-100">
          Only one admin is required to get started. Location-specific admins can be added on the
          Locations step, and more church-wide admins can be added anytime after setup.
        </p>
      </FieldSection>

      <FieldSection
        title="Social links"
        description="Optional. Full profile URLs help us wire your site and app footers."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {(
            [
              {
                key: 'facebookUrl' as const,
                label: 'Facebook',
                placeholder: 'https://facebook.com/yourchurch',
                Icon: FacebookIcon,
                iconClass: 'text-[#1877F2]',
              },
              {
                key: 'instagramUrl' as const,
                label: 'Instagram',
                placeholder: 'https://instagram.com/yourchurch',
                Icon: InstagramIcon,
                iconClass: 'text-[#E4405F]',
              },
              {
                key: 'youtubeUrl' as const,
                label: 'YouTube',
                placeholder: 'https://youtube.com/@yourchurch',
                Icon: YoutubeIcon,
                iconClass: 'text-[#FF0000]',
              },
              {
                key: 'threadsUrl' as const,
                label: 'Threads',
                placeholder: 'https://threads.net/@yourchurch',
                Icon: ThreadsIcon,
                iconClass: 'text-ink-900 dark:text-white',
              },
            ] satisfies Array<{
              key: 'facebookUrl' | 'instagramUrl' | 'youtubeUrl' | 'threadsUrl';
              label: string;
              placeholder: string;
              Icon: ComponentType<{ className?: string }>;
              iconClass: string;
            }>
          ).map(({ key, label, placeholder, Icon, iconClass }) => (
            <div key={key}>
              <Label
                htmlFor={key}
                className="mb-1.5 inline-flex items-center gap-2 text-ink-700 dark:text-ink-300"
              >
                <span
                  className={`inline-flex size-6 items-center justify-center rounded-md bg-ink-50 dark:bg-ink-800/80 ${iconClass}`}
                >
                  <Icon className="size-3.5" />
                </span>
                {label}
              </Label>
              <Input
                id={key}
                type="url"
                value={draft[key]}
                onChange={(e) => onChange({ ...draft, [key]: e.target.value })}
                placeholder={placeholder}
                className={inputClass}
              />
            </div>
          ))}
        </div>
      </FieldSection>
    </div>
  );
}
