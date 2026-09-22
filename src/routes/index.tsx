import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Play, Info } from "lucide-react";
import { getHomeData } from "@/lib/catalog.functions";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { SeriesCard, EpisodeCard, Row } from "@/components/site/Cards";

const homeQuery = queryOptions({ queryKey: ["home"], queryFn: () => getHomeData() });

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PULSO — Streaming de desenhos, séries e memes" },
      {
        name: "description",
        content:
          "Assista desenhos animados, séries, memes e conteúdos criados com IA na PULSO. Episódios grátis e premium.",
      },
      { property: "og:title", content: "PULSO — Streaming de desenhos, séries e memes" },
      {
        property: "og:description",
        content: "Episódios grátis e premium de desenhos, séries e memes IA.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(homeQuery),
  component: Index,
});

function Index() {
  const { data } = useSuspenseQuery(homeQuery);
  const f = data.featured;

  return (
    <div className="min-h-screen">
      <Header />

      {f && (
        <section className="relative h-[68vh] min-h-[420px] w-full overflow-hidden">
          <img
            src={f.backdrop_url ?? f.cover_url ?? "/images/hero.jpg"}
            alt={f.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
          <div className="relative mx-auto flex h-full max-w-[1500px] flex-col justify-end px-4 pb-14 sm:px-6">
            <span className="mb-3 w-fit rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-foreground">
              Em destaque
            </span>
            <h1 className="max-w-2xl font-display text-5xl leading-none tracking-wide sm:text-7xl">
              {f.title}
            </h1>
            <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
              {f.description}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/serie/$slug"
                params={{ slug: f.slug }}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                <Play className="h-4 w-4" /> Assistir agora
              </Link>
              <Link
                to="/serie/$slug"
                params={{ slug: f.slug }}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-6 py-3 text-sm font-semibold backdrop-blur transition hover:bg-secondary"
              >
                <Info className="h-4 w-4" /> Mais informações
              </Link>
            </div>
          </div>
        </section>
      )}

      <div className="mx-auto max-w-[1500px] pb-10">
        <Row title="Em destaque" empty={!data.highlights.length}>
          {data.highlights.map((s) => (
            <SeriesCard key={s.id} s={s} />
          ))}
        </Row>
        <Row title="Mais assistidos" empty={!data.mostWatched.length}>
          {data.mostWatched.map((s) => (
            <SeriesCard key={s.id} s={s} />
          ))}
        </Row>
        <Row title="Novos episódios" empty={!data.newEpisodes.length}>
          {data.newEpisodes.map((e) => (
            <EpisodeCard key={e.episode.id} episode={e.episode} seriesTitle={e.seriesTitle} />
          ))}
        </Row>
        <Row title="Desenhos 🎬" empty={!data.cartoons.length}>
          {data.cartoons.map((s) => (
            <SeriesCard key={s.id} s={s} />
          ))}
        </Row>
        <Row title="Memes IA 🤖" empty={!data.memes.length}>
          {data.memes.map((s) => (
            <SeriesCard key={s.id} s={s} />
          ))}
        </Row>
        <Row title="Séries 🎭" empty={!data.shows.length}>
          {data.shows.map((s) => (
            <SeriesCard key={s.id} s={s} />
          ))}
        </Row>
        <Row title="Conteúdos Premium ⭐" empty={!data.premium.length}>
          {data.premium.map((s) => (
            <SeriesCard key={s.id} s={s} />
          ))}
        </Row>
      </div>

      <Footer />
    </div>
  );
}
