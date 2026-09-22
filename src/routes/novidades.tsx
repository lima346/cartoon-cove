import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getNewReleases } from "@/lib/catalog.functions";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { SeriesCard, EpisodeCard } from "@/components/site/Cards";

const q = queryOptions({ queryKey: ["novidades"], queryFn: () => getNewReleases() });

export const Route = createFileRoute("/novidades")({
  head: () => ({
    meta: [
      { title: "Novidades — PULSO" },
      { name: "description", content: "Os episódios e séries mais recentes adicionados à PULSO." },
      { property: "og:title", content: "Novidades — PULSO" },
      { property: "og:description", content: "Episódios e séries mais recentes da PULSO." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(q),
  component: Novidades,
});

function Novidades() {
  const { data } = useSuspenseQuery(q);
  return (
    <div className="min-h-screen">
      <Header />
      <div className="mx-auto max-w-[1500px] px-4 py-10 sm:px-6">
        <h1 className="font-display text-4xl tracking-wide">Novidades 🆕</h1>
        <h2 className="mt-8 text-lg font-semibold">Episódios recentes</h2>
        <div className="mt-4 flex flex-wrap gap-4">
          {data.recent.map((e) => (
            <EpisodeCard key={e.episode.id} episode={e.episode} seriesTitle={e.seriesTitle} />
          ))}
        </div>
        <h2 className="mt-10 text-lg font-semibold">Séries recentes</h2>
        <div className="mt-4 flex flex-wrap gap-4">
          {data.series.map((s) => (
            <SeriesCard key={s.id} s={s} />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
