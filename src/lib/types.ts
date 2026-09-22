export type Category = {
  id: string;
  slug: string;
  name: string;
  emoji: string | null;
  sort_order: number;
};

export type Episode = {
  id: string;
  season_id: string;
  number: number;
  title: string;
  description: string;
  thumb_url: string | null;
  duration_seconds: number;
  is_premium: boolean;
  price_cents: number;
  views: number;
  has_subtitles?: boolean;
  created_at?: string;
};

export type Season = {
  id: string;
  series_id: string;
  number: number;
  title: string;
  price_cents: number;
  episodes: Episode[];
};

export type Series = {
  id: string;
  slug: string;
  title: string;
  description: string;
  cover_url: string | null;
  backdrop_url: string | null;
  category_id: string | null;
  category?: Category | null;
  is_featured: boolean;
  is_published: boolean;
  views: number;
  season_price_cents: number;
  episode_count?: number;
  premium_count?: number;
  created_at?: string;
};

export type SeriesDetail = Series & { seasons: Season[] };

export type PlatformSettings = {
  allow_episode_purchase: boolean;
  allow_season_purchase: boolean;
  allow_subscription: boolean;
  monthly_price_cents: number;
  annual_price_cents: number;
  currency: string;
};

export function formatPrice(cents: number, currency = "MZN") {
  return `${(cents / 100).toFixed(2).replace(".", ",")} ${currency === "MZN" ? "MT" : currency}`;
}

export function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatMinutes(seconds: number) {
  return `${Math.max(1, Math.round(seconds / 60))} min`;
}
