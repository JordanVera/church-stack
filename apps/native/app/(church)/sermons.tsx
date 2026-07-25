import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { trpc } from '../../src/lib/trpc';
import { useTenant } from '../../src/providers/TenantProvider';

type SermonVideo = {
  videoId: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnailUrl: string;
  duration?: string;
};

function formatPublishedAt(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function SermonsScreen() {
  const { slug, branding, theme } = useTenant();
  const { width } = useWindowDimensions();
  const sermonsEnabled = branding.features.sermons;
  const gap = 12;
  const pad = 20;
  const columns = width >= 700 ? 2 : 1;
  const cardWidth = (width - pad * 2 - gap * (columns - 1)) / columns;

  const siteQuery = trpc.church.getPublicSite.useQuery(
    { slug: slug ?? '' },
    { enabled: !!slug && sermonsEnabled }
  );

  const [extraVideos, setExtraVideos] = useState<SermonVideo[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);

  const utils = trpc.useUtils();

  useEffect(() => {
    if (!siteQuery.data) return;
    setExtraVideos([]);
    setNextPageToken(siteQuery.data.sermonsNextPageToken ?? null);
    setLoadMoreError(null);
  }, [siteQuery.dataUpdatedAt, siteQuery.data]);

  const videos = useMemo(() => {
    const initial = (siteQuery.data?.sermons ?? []) as SermonVideo[];
    if (extraVideos.length === 0) return initial;
    const seen = new Set(initial.map((v) => v.videoId));
    const merged = [...initial];
    for (const v of extraVideos) {
      if (!seen.has(v.videoId)) {
        seen.add(v.videoId);
        merged.push(v);
      }
    }
    return merged;
  }, [siteQuery.data?.sermons, extraVideos]);

  const sermonSeries = siteQuery.data?.sermonSeries ?? [];
  const showYoutube = videos.length > 0;
  const showSeriesFallback = !showYoutube && sermonSeries.length > 0;

  const loadMore = useCallback(async () => {
    if (!slug || !nextPageToken || loadingMore) return;
    setLoadingMore(true);
    setLoadMoreError(null);
    try {
      const page = await utils.church.getPublicSermons.fetch({
        slug,
        pageToken: nextPageToken,
        pageSize: 12,
      });
      setExtraVideos((prev) => {
        const seen = new Set(prev.map((v) => v.videoId));
        const merged = [...prev];
        for (const v of page.videos) {
          if (!seen.has(v.videoId)) {
            seen.add(v.videoId);
            merged.push(v);
          }
        }
        return merged;
      });
      setNextPageToken(page.nextPageToken ?? null);
    } catch (err) {
      setLoadMoreError(err instanceof Error ? err.message : 'Failed to load more sermons');
    } finally {
      setLoadingMore(false);
    }
  }, [slug, nextPageToken, loadingMore, utils.church.getPublicSermons]);

  const openVideo = (videoId: string) => {
    void Linking.openURL(`https://www.youtube.com/watch?v=${videoId}`);
  };

  if (!sermonsEnabled) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text className="text-center text-base leading-6 text-muted-foreground">
          Sermons aren't available for this church.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={showYoutube ? videos : []}
        key={columns}
        numColumns={columns}
        keyExtractor={(item) => item.videoId}
        contentContainerStyle={{ padding: pad, paddingBottom: 32, flexGrow: 1 }}
        columnWrapperStyle={columns > 1 ? { gap } : undefined}
        ItemSeparatorComponent={() => <View style={{ height: gap }} />}
        ListEmptyComponent={
          siteQuery.isLoading ? (
            <View className="flex-1 items-center justify-center py-24">
              <ActivityIndicator color={theme.primary} />
            </View>
          ) : siteQuery.isError ? (
            <View className="flex-1 items-center justify-center py-24">
              <Text className="text-center text-base leading-6 text-muted-foreground">
                Couldn't load sermons. Pull to refresh or try again later.
              </Text>
            </View>
          ) : showSeriesFallback ? (
            <View>
              {sermonSeries.map((series) => (
                <View key={series.id} className="mb-3 rounded-[14px] border border-border bg-card p-4">
                  <Text className="text-base font-semibold text-foreground">{series.title}</Text>
                  {series.description ? (
                    <Text className="mt-1.5 text-sm leading-5 text-muted-foreground">
                      {series.description}
                    </Text>
                  ) : null}
                </View>
              ))}
            </View>
          ) : (
            <View className="flex-1 items-center justify-center py-24">
              <Text className="text-center text-base leading-6 text-muted-foreground">
                No sermons available yet.
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => openVideo(item.videoId)}
            style={{ width: cardWidth }}
            accessibilityRole="link"
            accessibilityLabel={`Watch ${item.title}`}
          >
            <View className="overflow-hidden rounded-[14px] border border-border bg-card">
              <View className="relative w-full aspect-video bg-black/30">
                {item.thumbnailUrl ? (
                  <Image
                    source={{ uri: item.thumbnailUrl }}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="cover"
                    transition={200}
                  />
                ) : null}
                {item.duration ? (
                  <View className="absolute right-2 bottom-2 rounded bg-black/75 px-1.5 py-0.5">
                    <Text className="text-xs font-medium text-white">{item.duration}</Text>
                  </View>
                ) : null}
              </View>
              <View className="p-3.5">
                <Text className="text-base font-semibold leading-5 text-foreground" numberOfLines={2}>
                  {item.title}
                </Text>
                {item.publishedAt ? (
                  <Text className="mt-1.5 text-xs uppercase tracking-wide text-muted-foreground">
                    {formatPublishedAt(item.publishedAt)}
                  </Text>
                ) : null}
              </View>
            </View>
          </Pressable>
        )}
        ListFooterComponent={
          showYoutube ? (
            <View className="mt-6 items-center">
              {loadMoreError ? (
                <Text className="mb-3 text-center text-sm text-destructive">{loadMoreError}</Text>
              ) : null}
              {nextPageToken ? (
                <Pressable
                  onPress={() => void loadMore()}
                  disabled={loadingMore}
                  className="rounded-xl px-6 py-3.5"
                  style={{ backgroundColor: theme.primary, opacity: loadingMore ? 0.6 : 1 }}
                >
                  {loadingMore ? (
                    <ActivityIndicator color={theme.primaryForeground} />
                  ) : (
                    <Text
                      className="text-sm font-semibold"
                      style={{ color: theme.primaryForeground }}
                    >
                      Load more sermons
                    </Text>
                  )}
                </Pressable>
              ) : null}
            </View>
          ) : null
        }
        refreshing={siteQuery.isRefetching && !siteQuery.isLoading}
        onRefresh={() => void siteQuery.refetch()}
      />
    </View>
  );
}
