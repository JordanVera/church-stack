/**
 * YouTube Data API v3 helpers for church sermon playlists.
 * Uses native fetch (no axios). Requires YOUTUBE_API_KEY.
 */

const BASE_URL = 'https://www.googleapis.com/youtube/v3';
const CACHE_TTL_MS = 45 * 60 * 1000; // 45 minutes

export type SermonVideo = {
  videoId: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnailUrl: string;
  duration?: string;
  channelTitle?: string;
};

export type ParsedYoutubeInput =
  | { kind: 'playlist'; playlistId: string }
  | { kind: 'channelId'; channelId: string }
  | { kind: 'handle'; handle: string }
  | { kind: 'channelSearch'; query: string };

type CacheEntry = {
  expiresAt: number;
  videos: SermonVideo[];
};

const playlistCache = new Map<string, CacheEntry>();

function getApiKey(apiKey?: string): string {
  const key = apiKey || process.env.YOUTUBE_API_KEY;
  if (!key?.trim()) {
    throw new Error(
      'YouTube API key is not configured. Set YOUTUBE_API_KEY on the platform.'
    );
  }
  return key.trim();
}

async function youtubeGet<T>(
  path: string,
  params: Record<string, string | number | undefined>,
  apiKey?: string
): Promise<T> {
  const key = getApiKey(apiKey);
  const url = new URL(`${BASE_URL}/${path}`);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') url.searchParams.set(k, String(v));
  }
  url.searchParams.set('key', key);

  const res = await fetch(url.toString());
  const body = (await res.json().catch(() => ({}))) as {
    error?: { message?: string; code?: number };
  };

  if (!res.ok) {
    const message = body.error?.message || res.statusText || 'Unknown YouTube API error';
    if (res.status === 403) {
      throw new Error(`YouTube API quota exceeded or invalid API key: ${message}`);
    }
    if (res.status === 404) {
      throw new Error(`YouTube resource not found: ${message}`);
    }
    throw new Error(`YouTube API error (${res.status}): ${message}`);
  }

  return body as T;
}

/**
 * Parse a playlist URL, channel URL/handle, or bare playlist/channel id.
 */
export function parseYoutubePlaylistOrChannelInput(raw: string): ParsedYoutubeInput {
  const input = raw.trim();
  if (!input) {
    throw new Error('Enter a YouTube playlist or channel URL.');
  }

  // Bare playlist id
  if (/^(PL|UU|LL|FL)[\w-]{10,}$/i.test(input)) {
    return { kind: 'playlist', playlistId: input };
  }

  // Bare channel id
  if (/^UC[\w-]{20,}$/i.test(input)) {
    return { kind: 'channelId', channelId: input };
  }

  // Handle without URL
  if (/^@[\w.-]+$/.test(input)) {
    return { kind: 'handle', handle: input.slice(1) };
  }

  let url: URL;
  try {
    url = new URL(input.startsWith('http') ? input : `https://${input}`);
  } catch {
    throw new Error(
      'Could not parse that URL. Paste a playlist link (youtube.com/playlist?list=…) or channel link.'
    );
  }

  const host = url.hostname.replace(/^www\./, '');
  if (!host.includes('youtube.com') && host !== 'youtu.be') {
    throw new Error('URL must be a YouTube link.');
  }

  const list = url.searchParams.get('list');
  if (list && /^(PL|UU|LL|FL)[\w-]{10,}$/i.test(list)) {
    return { kind: 'playlist', playlistId: list };
  }

  const parts = url.pathname.split('/').filter(Boolean);

  if (parts[0] === 'playlist' && list) {
    return { kind: 'playlist', playlistId: list };
  }

  if (parts[0] === 'channel' && parts[1]?.startsWith('UC')) {
    return { kind: 'channelId', channelId: parts[1] };
  }

  if (parts[0]?.startsWith('@')) {
    return { kind: 'handle', handle: parts[0].slice(1) };
  }

  if ((parts[0] === 'c' || parts[0] === 'user') && parts[1]) {
    return { kind: 'channelSearch', query: parts[1] };
  }

  throw new Error(
    'Could not find a playlist or channel in that URL. Use a playlist link or a channel /@handle link.'
  );
}

type ChannelsListResponse = {
  items?: Array<{
    id: string;
    contentDetails?: {
      relatedPlaylists?: {
        uploads?: string;
      };
    };
  }>;
};

type SearchListResponse = {
  items?: Array<{
    id?: { channelId?: string };
  }>;
};

async function uploadsPlaylistForChannelId(
  channelId: string,
  apiKey?: string
): Promise<string> {
  const data = await youtubeGet<ChannelsListResponse>(
    'channels',
    { part: 'contentDetails', id: channelId },
    apiKey
  );
  const uploads = data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploads) {
    throw new Error(`No uploads playlist found for channel ${channelId}`);
  }
  return uploads;
}

/**
 * Resolve owner input to a playlist id (playlist PL… or channel uploads UU…).
 */
export async function resolveToPlaylistId(
  raw: string,
  apiKey?: string
): Promise<{ playlistId: string; sourceUrl: string }> {
  const sourceUrl = raw.trim();
  const parsed = parseYoutubePlaylistOrChannelInput(sourceUrl);

  if (parsed.kind === 'playlist') {
    return { playlistId: parsed.playlistId, sourceUrl };
  }

  if (parsed.kind === 'channelId') {
    const playlistId = await uploadsPlaylistForChannelId(parsed.channelId, apiKey);
    return { playlistId, sourceUrl };
  }

  if (parsed.kind === 'handle') {
    const data = await youtubeGet<ChannelsListResponse>(
      'channels',
      { part: 'contentDetails', forHandle: parsed.handle },
      apiKey
    );
    const channelId = data.items?.[0]?.id;
    if (!channelId) {
      throw new Error(`YouTube channel not found for @${parsed.handle}`);
    }
    const playlistId = await uploadsPlaylistForChannelId(channelId, apiKey);
    return { playlistId, sourceUrl };
  }

  // channelSearch via /c/ or /user/
  const search = await youtubeGet<SearchListResponse>(
    'search',
    {
      part: 'snippet',
      q: parsed.query,
      type: 'channel',
      maxResults: 1,
    },
    apiKey
  );
  const channelId = search.items?.[0]?.id?.channelId;
  if (!channelId) {
    throw new Error(`YouTube channel not found for “${parsed.query}”`);
  }
  const playlistId = await uploadsPlaylistForChannelId(channelId, apiKey);
  return { playlistId, sourceUrl };
}

type PlaylistItemsResponse = {
  items?: Array<{
    snippet?: {
      title?: string;
      description?: string;
      publishedAt?: string;
      channelTitle?: string;
      thumbnails?: {
        high?: { url?: string };
        medium?: { url?: string };
        default?: { url?: string };
      };
      resourceId?: { videoId?: string };
    };
    contentDetails?: { videoId?: string };
  }>;
  nextPageToken?: string;
};

type VideosListResponse = {
  items?: Array<{
    id: string;
    contentDetails?: { duration?: string };
  }>;
};

function pickThumbnail(
  thumbs?: PlaylistItemsResponse['items'] extends (infer I)[] | undefined
    ? I extends { snippet?: { thumbnails?: infer T } }
      ? T
      : never
    : never
): string {
  if (!thumbs || typeof thumbs !== 'object') return '';
  const t = thumbs as {
    high?: { url?: string };
    medium?: { url?: string };
    default?: { url?: string };
  };
  return t.high?.url || t.medium?.url || t.default?.url || '';
}

/**
 * Format ISO 8601 duration (PT4M13S) → 4:13
 */
export function formatDuration(duration: string | undefined): string {
  if (!duration) return '';
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '';
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export async function getPlaylistVideos(
  playlistId: string,
  opts: { maxResults?: number; pageToken?: string; apiKey?: string } = {}
): Promise<{ videos: SermonVideo[]; nextPageToken?: string }> {
  const maxResults = Math.min(Math.max(opts.maxResults ?? 12, 1), 50);

  const playlist = await youtubeGet<PlaylistItemsResponse>(
    'playlistItems',
    {
      part: 'snippet,contentDetails',
      playlistId,
      maxResults,
      pageToken: opts.pageToken,
    },
    opts.apiKey
  );

  const items = playlist.items ?? [];
  if (items.length === 0) {
    return { videos: [], nextPageToken: undefined };
  }

  const videoIds = items
    .map((item) => item.snippet?.resourceId?.videoId || item.contentDetails?.videoId)
    .filter((id): id is string => Boolean(id));

  let detailsById = new Map<string, string | undefined>();
  if (videoIds.length > 0) {
    const details = await youtubeGet<VideosListResponse>(
      'videos',
      {
        part: 'contentDetails',
        id: videoIds.join(','),
      },
      opts.apiKey
    );
    detailsById = new Map(
      (details.items ?? []).map((d) => [d.id, d.contentDetails?.duration])
    );
  }

  const videos: SermonVideo[] = [];
  for (const item of items) {
    const videoId = item.snippet?.resourceId?.videoId || item.contentDetails?.videoId;
    if (!videoId) continue;
    // Skip private/deleted placeholders
    const title = item.snippet?.title?.trim() || '';
    if (!title || title === 'Private video' || title === 'Deleted video') continue;

    const isoDuration = detailsById.get(videoId);
    videos.push({
      videoId,
      title,
      description: item.snippet?.description ?? '',
      publishedAt: item.snippet?.publishedAt ?? '',
      thumbnailUrl: pickThumbnail(item.snippet?.thumbnails),
      duration: formatDuration(isoDuration) || undefined,
      channelTitle: item.snippet?.channelTitle,
    });
  }

  return {
    videos,
    nextPageToken: playlist.nextPageToken,
  };
}

/**
 * Fetch playlist videos with pagination up to maxTotal (default 100).
 * Results are cached in-memory by playlistId for ~45 minutes.
 */
export async function fetchAllPlaylistVideos(
  playlistId: string,
  opts: { maxTotal?: number; apiKey?: string; skipCache?: boolean } = {}
): Promise<SermonVideo[]> {
  const maxTotal = Math.min(Math.max(opts.maxTotal ?? 100, 1), 100);
  const cacheKey = playlistId;

  if (!opts.skipCache) {
    const cached = playlistCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.videos.slice(0, maxTotal);
    }
  }

  const all: SermonVideo[] = [];
  let pageToken: string | undefined;

  while (all.length < maxTotal) {
    const pageSize = Math.min(50, maxTotal - all.length);
    const page = await getPlaylistVideos(playlistId, {
      maxResults: pageSize,
      pageToken,
      apiKey: opts.apiKey,
    });
    all.push(...page.videos);
    if (!page.nextPageToken || page.videos.length === 0) break;
    pageToken = page.nextPageToken;
  }

  const videos = all.slice(0, maxTotal);
  playlistCache.set(cacheKey, {
    expiresAt: Date.now() + CACHE_TTL_MS,
    videos,
  });
  return videos;
}

/** Invalidate cache after an owner updates their playlist. */
export function invalidatePlaylistCache(playlistId: string | null | undefined) {
  if (playlistId) playlistCache.delete(playlistId);
}
