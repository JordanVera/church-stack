'use client';

import { useEffect, useRef, useState } from 'react';
import { use } from 'react';
import { toast } from 'sonner';
import { ChurchDashboardProvider } from '@/components/dashboard/ChurchDashboardProvider';
import { trpc } from '@/lib/trpc-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

type PastorRow = {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  photoUrl: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  youtubeUrl: string | null;
};

function PastorEditor({
  churchId,
  pastor,
  onCancel,
  onSaved,
}: {
  churchId: string;
  pastor: PastorRow;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const utils = trpc.useUtils();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [firstName, setFirstName] = useState(pastor.firstName);
  const [lastName, setLastName] = useState(pastor.lastName);
  const [title, setTitle] = useState(pastor.title);
  const [facebookUrl, setFacebookUrl] = useState(pastor.facebookUrl ?? '');
  const [instagramUrl, setInstagramUrl] = useState(pastor.instagramUrl ?? '');
  const [youtubeUrl, setYoutubeUrl] = useState(pastor.youtubeUrl ?? '');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);

  useEffect(() => {
    return () => {
      if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    };
  }, [pendingPreview]);

  const update = trpc.pastors.update.useMutation({
    onSuccess: async () => {
      toast.success('Pastor updated');
      onSaved();
      await utils.pastors.list.invalidate({ churchId });
    },
    onError: (e) => toast.error(e.message),
  });

  const clearPendingFile = () => {
    if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    setPendingFile(null);
    setPendingPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onPickPhoto = (file: File | null) => {
    if (!file) {
      clearPendingFile();
      return;
    }
    if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    setPendingFile(file);
    setPendingPreview(URL.createObjectURL(file));
  };

  const uploadPhoto = async () => {
    if (!pendingFile) return;
    setPhotoBusy(true);
    try {
      const form = new FormData();
      form.set('churchId', churchId);
      form.set('pastorId', pastor.id);
      form.set('file', pendingFile);
      const res = await fetch('/api/church/pastor-photo', { method: 'POST', body: form });
      const body = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !body.ok) {
        throw new Error(body.error || 'Upload failed');
      }
      toast.success('Photo uploaded');
      clearPendingFile();
      await utils.pastors.list.invalidate({ churchId });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setPhotoBusy(false);
    }
  };

  const removePhoto = async () => {
    setPhotoBusy(true);
    try {
      const res = await fetch('/api/church/pastor-photo', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ churchId, pastorId: pastor.id }),
      });
      const body = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !body.ok) {
        throw new Error(body.error || 'Could not remove photo');
      }
      toast.success('Photo removed');
      clearPendingFile();
      await utils.pastors.list.invalidate({ churchId });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not remove photo');
    } finally {
      setPhotoBusy(false);
    }
  };

  const photoPreview = pendingPreview ?? pastor.photoUrl ?? null;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <Label htmlFor={`edit-fn-${pastor.id}`}>First name</Label>
          <Input
            id={`edit-fn-${pastor.id}`}
            className="mt-1 h-10"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`edit-ln-${pastor.id}`}>Last name</Label>
          <Input
            id={`edit-ln-${pastor.id}`}
            className="mt-1 h-10"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`edit-title-${pastor.id}`}>Title</Label>
          <Input
            id={`edit-title-${pastor.id}`}
            className="mt-1 h-10"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-ink-200 bg-ink-50/50 p-4 dark:border-ink-700 dark:bg-ink-950/40">
        <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">Photo</p>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-24 w-20 items-center justify-center overflow-hidden rounded-xl border border-ink-200 bg-white dark:border-ink-700 dark:bg-ink-900">
            {photoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoPreview} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="px-2 text-center text-xs text-ink-400">No photo</span>
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <Label htmlFor={`photo-${pastor.id}`}>Image file</Label>
            <input
              ref={fileInputRef}
              id={`photo-${pastor.id}`}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="mt-1 block h-10 w-full cursor-pointer rounded-lg border border-ink-200 bg-transparent px-2.5 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-ink-100 file:px-3 file:py-1 file:text-sm file:font-medium dark:border-ink-700 dark:file:bg-ink-800"
              onChange={(e) => onPickPhoto(e.target.files?.[0] ?? null)}
            />
            <p className="text-xs text-ink-500">PNG, JPEG, or WebP up to 2MB. One portrait per pastor.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            disabled={photoBusy || !pendingFile}
            onClick={() => void uploadPhoto()}
          >
            {photoBusy && pendingFile ? 'Uploading…' : 'Upload photo'}
          </Button>
          {pastor.photoUrl ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={photoBusy}
              onClick={() => void removePhoto()}
            >
              {photoBusy && !pendingFile ? 'Removing…' : 'Remove photo'}
            </Button>
          ) : null}
          {pendingFile ? (
            <Button type="button" variant="ghost" size="sm" disabled={photoBusy} onClick={clearPendingFile}>
              Cancel
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <Label htmlFor={`edit-fb-${pastor.id}`}>Facebook URL</Label>
          <Input
            id={`edit-fb-${pastor.id}`}
            className="mt-1 h-10"
            placeholder="https://facebook.com/…"
            value={facebookUrl}
            onChange={(e) => setFacebookUrl(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`edit-ig-${pastor.id}`}>Instagram URL</Label>
          <Input
            id={`edit-ig-${pastor.id}`}
            className="mt-1 h-10"
            placeholder="https://instagram.com/…"
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`edit-yt-${pastor.id}`}>YouTube URL</Label>
          <Input
            id={`edit-yt-${pastor.id}`}
            className="mt-1 h-10"
            placeholder="https://youtube.com/…"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          disabled={
            update.isPending || !firstName.trim() || !lastName.trim() || !title.trim()
          }
          onClick={() =>
            update.mutate({
              churchId,
              id: pastor.id,
              firstName,
              lastName,
              title,
              facebookUrl: facebookUrl.trim() || null,
              instagramUrl: instagramUrl.trim() || null,
              youtubeUrl: youtubeUrl.trim() || null,
            })
          }
        >
          {update.isPending ? 'Saving…' : 'Save'}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function PastorsPanel({ churchId }: { churchId: string }) {
  const utils = trpc.useUtils();
  const list = trpc.pastors.list.useQuery({ churchId });
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [title, setTitle] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const create = trpc.pastors.create.useMutation({
    onSuccess: async () => {
      toast.success('Pastor added');
      setFirstName('');
      setLastName('');
      setTitle('');
      setFacebookUrl('');
      setInstagramUrl('');
      setYoutubeUrl('');
      await utils.pastors.list.invalidate({ churchId });
    },
    onError: (e) => toast.error(e.message),
  });

  const remove = trpc.pastors.delete.useMutation({
    onSuccess: async () => {
      toast.success('Pastor removed');
      await utils.pastors.list.invalidate({ churchId });
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Pastors</h2>
        <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">
          Leadership shown on your site and app. Add a photo and social links for each pastor.
        </p>
      </div>

      <Card className="border-ink-200 dark:border-ink-800 dark:bg-ink-900">
        <CardContent className="space-y-4 px-5 py-5">
          <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">Add pastor</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label htmlFor="fn">First name</Label>
              <Input
                id="fn"
                className="mt-1 h-10"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="ln">Last name</Label>
              <Input
                id="ln"
                className="mt-1 h-10"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                className="mt-1 h-10"
                placeholder="Lead Pastor"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label htmlFor="fb">Facebook URL</Label>
              <Input
                id="fb"
                className="mt-1 h-10"
                placeholder="Optional"
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="ig">Instagram URL</Label>
              <Input
                id="ig"
                className="mt-1 h-10"
                placeholder="Optional"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="yt">YouTube URL</Label>
              <Input
                id="yt"
                className="mt-1 h-10"
                placeholder="Optional"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
              />
            </div>
          </div>
          <p className="text-xs text-ink-500">You can upload a photo after the pastor is created.</p>
          <Button
            disabled={create.isPending || !firstName.trim() || !lastName.trim() || !title.trim()}
            onClick={() =>
              create.mutate({
                churchId,
                firstName,
                lastName,
                title,
                facebookUrl: facebookUrl.trim() || null,
                instagramUrl: instagramUrl.trim() || null,
                youtubeUrl: youtubeUrl.trim() || null,
              })
            }
          >
            {create.isPending ? 'Saving…' : 'Add pastor'}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {list.data?.length === 0 ? (
          <p className="text-sm text-ink-500">No pastors yet.</p>
        ) : null}
        {list.data?.map((p: NonNullable<typeof list.data>[number]) => (
          <Card key={p.id} className="border-ink-200 dark:border-ink-800 dark:bg-ink-900">
            <CardContent className="px-5 py-4">
              {editingId === p.id ? (
                <PastorEditor
                  churchId={churchId}
                  pastor={p}
                  onCancel={() => setEditingId(null)}
                  onSaved={() => setEditingId(null)}
                />
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-14 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-ink-200 bg-ink-50 dark:border-ink-700 dark:bg-ink-950">
                      {p.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.photoUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-xs font-semibold text-ink-400">
                          {p.firstName.charAt(0)}
                          {p.lastName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-ink-900 dark:text-white">
                        {p.firstName} {p.lastName}
                      </p>
                      <p className="text-sm text-ink-500">{p.title}</p>
                      <p className="mt-0.5 truncate text-xs text-ink-400">
                        {[
                          p.facebookUrl ? 'Facebook' : null,
                          p.instagramUrl ? 'Instagram' : null,
                          p.youtubeUrl ? 'YouTube' : null,
                        ]
                          .filter(Boolean)
                          .join(' · ') || 'No social links'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingId(p.id)}>
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={remove.isPending}
                      onClick={() => {
                        if (window.confirm(`Remove ${p.firstName} ${p.lastName}?`)) {
                          remove.mutate({ churchId, id: p.id });
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function PastorsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return (
    <ChurchDashboardProvider slug={slug}>
      {({ churchId }) => <PastorsPanel churchId={churchId} />}
    </ChurchDashboardProvider>
  );
}
