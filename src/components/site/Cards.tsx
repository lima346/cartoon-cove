import { Link } from "@tanstack/react-router";
import { Play, Lock } from "lucide-react";
import type { Episode, Series } from "@/lib/types";
import { formatMinutes } from "@/lib/types";

export function SeriesCard({ s }: { s: Series }) {
  const premium = (s.premium_count ?? 0) > 0;
  return (
    <Link
      to="/serie/$slug"
      params={{ slug: s.slug }}
      className="group relative w-[190px] shrink-0 sm:w-[230px]"
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-border/70 bg-secondary">
        {s.cover_url ? (
          <img
            src={s.cover_url}
            alt={s.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />
        <span
          className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
            premium ? "bg-gold text-ink" : "bg-background/80 text-foreground"
          }`}
        >
          {premium ? "Premium" : "Grátis"}
        </span>
        <div className="absolute inset-x-0 bottom-0 p-3">
          <p className="line-clamp-1 text-sm font-semibold">{s.title}</p>
          <p className="text-xs text-muted-foreground">
            {s.category?.emoji ?? ""} {s.category?.name ?? "Sem categoria"} ·{" "}
            {s.episode_count ?? 0} eps
          </p>
          <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground opacity-0 transition group-hover:opacity-100">
            <Play className="h-3 w-3" /> Assistir
          </span>
        </div>
      </div>
    </Link>
  );
}

export function EpisodeCard({
  episode,
  seriesTitle,
}: {
  episode: Episode;
  seriesTitle: string;
}) {
  return (
    <Link
      to="/assistir/$episodeId"
      params={{ episodeId: episode.id }}
      className="group w-[260px] shrink-0 sm:w-[300px]"
    >
      <div className="relative aspect-video overflow-hidden rounded-xl border border-border/70 bg-secondary">
        {episode.thumb_url ? (
          <img
            src={episode.thumb_url}
            alt={episode.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
        <span
          className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
            episode.is_premium ? "bg-gold text-ink" : "bg-background/80"
          }`}
        >
          {episode.is_premium ? (
            <span className="inline-flex items-center gap-1">
              <Lock className="h-2.5 w-2.5" /> Premium
            </span>
          ) : (
            "Grátis"
          )}
        </span>
        <span className="absolute bottom-2 right-2 rounded bg-background/80 px-1.5 py-0.5 font-mono text-[10px]">
          {formatMinutes(episode.duration_seconds)}
        </span>
      </div>
      <p className="mt-2 line-clamp-1 text-sm font-semibold">
        Ep. {episode.number} — {episode.title}
      </p>
      <p className="line-clamp-1 text-xs text-muted-foreground">{seriesTitle}</p>
    </Link>
  );
}

export function Row({
  title,
  children,
  empty,
}: {
  title: string;
  children: React.ReactNode;
  empty?: boolean;
}) {
  if (empty) return null;
  return (
    <section className="mt-10">
      <h2 className="mb-4 px-4 font-display text-2xl tracking-wide sm:px-6">{title}</h2>
      <div className="no-scrollbar flex gap-4 overflow-x-auto px-4 pb-2 sm:px-6">{children}</div>
    </section>
  );
}
