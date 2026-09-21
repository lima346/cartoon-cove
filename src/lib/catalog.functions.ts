import { createServerFn } from "@tanstack/react-start";
import type {
  Category,
  Episode,
  PlatformSettings,
  Series,
  SeriesDetail,
} from "./types";

type RawSeason = {
  id: string;
  series_id: string;
  number: number;
  title: string;
  price_cents: number;
};

async function loadCatalogue() {
  const { publicDb } = await import("./db.server");
  const db = publicDb();
  const [cats, series, seasons, episodes, settings] = await Promise.all([
    db.from("categories").select("*").order("sort_order"),
    db.from("series").select("*").order("created_at"),
    db.from("seasons").select("*").order("number"),
    db.from("episodes_public").select("*").order("number"),
    db.from("platform_settings").select("*").eq("id", 1).maybeSingle(),
  ]);

  const categories = (cats.data ?? []) as Category[];
  const rawSeasons = (seasons.data ?? []) as RawSeason[];
  const eps = (episodes.data ?? []) as Episode[];

  const list: Series[] = ((series.data ?? []) as Series[]).map((s) => {
    const seasonIds = rawSeasons.filter((x) => x.series_id === s.id).map((x) => x.id);
    const own = eps.filter((e) => seasonIds.includes(e.season_id));
    return {
      ...s,
      category: categories.find((c) => c.id === s.category_id) ?? null,
      episode_count: own.length,
      premium_count: own.filter((e) => e.is_premium).length,
    };
  });

  return {
    categories,
    series: list,
    rawSeasons,
    episodes: eps,
    settings: (settings.data ?? {
      allow_episode_purchase: true,
      allow_season_purchase: true,
      allow_subscription: true,
      monthly_price_cents: 19900,
      annual_price_cents: 159900,
      currency: "MZN",
    }) as PlatformSettings,
  };
}

export const getHomeData = createServerFn({ method: "GET" }).handler(async () => {
  const { categories, series, episodes, rawSeasons, settings } = await loadCatalogue();

  const bySlug = (slug: string) =>
    series.filter((s) => s.category?.slug === slug);

  const newEpisodes = [...episodes]
    .sort((a, b) => (a.created_at ?? "") < (b.created_at ?? "") ? 1 : -1)
    .slice(0, 8)
    .map((e) => {
      const season = rawSeasons.find((s) => s.id === e.season_id);
      const serie = series.find((s) => s.id === season?.series_id);
      return { episode: e, seriesTitle: serie?.title ?? "", seriesSlug: serie?.slug ?? "" };
    });

  return {
    categories,
    settings,
    featured: series.find((s) => s.is_featured) ?? series[0] ?? null,
    highlights: series,
    mostWatched: [...series].sort((a, b) => b.views - a.views),
    newEpisodes,
    cartoons: bySlug("desenhos"),
    memes: [...bySlug("memes"), ...bySlug("memes-ia")],
    shows: [...bySlug("series"), ...bySlug("infantil")],
    premium: series.filter((s) => (s.premium_count ?? 0) > 0),
  };
});

export const getSeries = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }): Promise<SeriesDetail | null> => {
    const { categories, series, rawSeasons, episodes } = await loadCatalogue();
    const s = series.find((x) => x.slug === data.slug);
    if (!s) return null;
    const seasons = rawSeasons
      .filter((x) => x.series_id === s.id)
      .map((x) => ({
        ...x,
        episodes: episodes
          .filter((e) => e.season_id === x.id)
          .sort((a, b) => a.number - b.number),
      }));
    return {
      ...s,
      category: categories.find((c) => c.id === s.category_id) ?? null,
      seasons,
    };
  });

export const getEpisodeContext = createServerFn({ method: "GET" })
  .inputValidator((data: { episodeId: string }) => data)
  .handler(async ({ data }) => {
    const { series, rawSeasons, episodes, settings } = await loadCatalogue();
    const episode = episodes.find((e) => e.id === data.episodeId);
    if (!episode) return null;
    const season = rawSeasons.find((s) => s.id === episode.season_id)!;
    const serie = series.find((s) => s.id === season.series_id)!;
    const siblings = episodes
      .filter((e) => e.season_id === season.id)
      .sort((a, b) => a.number - b.number);
    const idx = siblings.findIndex((e) => e.id === episode.id);
    return {
      episode,
      season,
      series: serie,
      settings,
      previous: idx > 0 ? siblings[idx - 1]! : null,
      next: idx < siblings.length - 1 ? siblings[idx + 1]! : null,
      all: siblings,
    };
  });

export const getCategoryPage = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    const { categories, series } = await loadCatalogue();
    const category = categories.find((c) => c.slug === data.slug) ?? null;
    return {
      category,
      categories,
      series: series.filter((s) => s.category?.slug === data.slug),
    };
  });

export const getNewReleases = createServerFn({ method: "GET" }).handler(async () => {
  const { series, rawSeasons, episodes } = await loadCatalogue();
  const recent = [...episodes]
    .sort((a, b) => ((a.created_at ?? "") < (b.created_at ?? "") ? 1 : -1))
    .slice(0, 12)
    .map((e) => {
      const season = rawSeasons.find((s) => s.id === e.season_id);
      const serie = series.find((s) => s.id === season?.series_id);
      return { episode: e, seriesTitle: serie?.title ?? "", seriesSlug: serie?.slug ?? "" };
    });
  return { series: [...series].sort((a, b) => ((a.created_at ?? "") < (b.created_at ?? "") ? 1 : -1)), recent };
});

export const searchCatalogue = createServerFn({ method: "GET" })
  .inputValidator((data: { q: string; category?: string; access?: string }) => data)
  .handler(async ({ data }) => {
    const { series, rawSeasons, episodes, categories } = await loadCatalogue();
    const q = data.q.trim().toLowerCase();
    let matchedSeries = series;
    let matchedEpisodes = episodes.map((e) => {
      const season = rawSeasons.find((s) => s.id === e.season_id);
      const serie = series.find((s) => s.id === season?.series_id);
      return { episode: e, seriesTitle: serie?.title ?? "", seriesSlug: serie?.slug ?? "" };
    });

    if (q) {
      matchedSeries = matchedSeries.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          (s.category?.name ?? "").toLowerCase().includes(q),
      );
      matchedEpisodes = matchedEpisodes.filter(
        (e) =>
          e.episode.title.toLowerCase().includes(q) ||
          e.episode.description.toLowerCase().includes(q) ||
          e.seriesTitle.toLowerCase().includes(q),
      );
    }
    if (data.category) {
      matchedSeries = matchedSeries.filter((s) => s.category?.slug === data.category);
      const ok = new Set(matchedSeries.map((s) => s.slug));
      matchedEpisodes = matchedEpisodes.filter((e) => ok.has(e.seriesSlug));
    }
    if (data.access === "free") {
      matchedEpisodes = matchedEpisodes.filter((e) => !e.episode.is_premium);
    } else if (data.access === "premium") {
      matchedEpisodes = matchedEpisodes.filter((e) => e.episode.is_premium);
      matchedSeries = matchedSeries.filter((s) => (s.premium_count ?? 0) > 0);
    }

    return { categories, series: matchedSeries, episodes: matchedEpisodes.slice(0, 30) };
  });

/** Free episodes only — never returns a premium video URL. */
export const getFreeStream = createServerFn({ method: "GET" })
  .inputValidator((data: { episodeId: string }) => data)
  .handler(async ({ data }) => {
    const { publicDb } = await import("./db.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: pub } = await publicDb()
      .from("episodes_public")
      .select("id,is_premium")
      .eq("id", data.episodeId)
      .maybeSingle();
    if (!pub || (pub as { is_premium: boolean }).is_premium) {
      return { url: null as string | null, subtitles: null as string | null };
    }
    const { data: full } = await supabaseAdmin
      .from("episodes")
      .select("video_url,subtitles_url")
      .eq("id", data.episodeId)
      .maybeSingle();
    const row = full as { video_url: string | null; subtitles_url: string | null } | null;
    return { url: row?.video_url ?? null, subtitles: row?.subtitles_url ?? null };
  });
