import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { searchCatalogue } from "@/lib/catalog.functions";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { SeriesCard, EpisodeCard } from "@/components/site/Cards";

export const Route = createFileRoute("/pesquisa")({
  validateSearch: (s: Record<string, unknown>) => ({
    q: typeof s['q'] === "string" ? s['q'] : "",
    categoria: typeof s['categoria'] === "string" ? s['categoria'] : "",
    acesso: typeof s['acesso'] === "string" ? s['acesso'] : "",
  }),
  head: () => ({
    meta: [
      { title: "Pesquisa — PULSO" },
      { name: "description", content: "Pesquise séries, episódios e categorias na PULSO." },
      { property: "og:title", content: "Pesquisa — PULSO" },
      { property: "og:description", content: "Pesquise conteúdos na PULSO." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pesquisa,
});

function Pesquisa() {
  const { q, categoria, acesso } = Route.useSearch();
  const navigate = useNavigate();
  const { data, isFetching } = useQuery({
    queryKey: ["pesquisa", q, categoria, acesso],
    queryFn: () => searchCatalogue({ data: { q, category: categoria, access: acesso } }),
  });

  const set = (patch: Record<string, string>) =>
    navigate({ to: "/pesquisa", search: { q, categoria, acesso, ...patch } });

  return (
    <div className="min-h-screen">
      <Header />
      <div className="mx-auto max-w-[1500px] px-4 py-10 sm:px-6">
        <h1 className="font-display text-4xl tracking-wide">Pesquisa</h1>
        <input
          value={q}
          onChange={(e) => set({ q: e.target.value })}
          placeholder="Nome do vídeo, série, episódio ou categoria"
          className="mt-4 h-12 w-full rounded-full border border-border bg-secondary/60 px-5 outline-none focus:border-primary"
        />
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            { v: "", l: "Todos" },
            { v: "free", l: "Grátis" },
            { v: "premium", l: "Premium" },
          ].map((o) => (
            <button
              key={o.v}
              onClick={() => set({ acesso: o.v })}
              className={`rounded-full border px-3 py-1 text-sm ${
                acesso === o.v ? "border-primary bg-primary text-primary-foreground" : "border-border"
              }`}
            >
              {o.l}
            </button>
          ))}
          <span className="mx-2 w-px bg-border" />
          <button
            onClick={() => set({ categoria: "" })}
            className={`rounded-full border px-3 py-1 text-sm ${
              !categoria ? "border-primary bg-primary text-primary-foreground" : "border-border"
            }`}
          >
            Todas categorias
          </button>
          {(data?.categories ?? []).map((c) => (
            <button
              key={c.id}
              onClick={() => set({ categoria: c.slug })}
              className={`rounded-full border px-3 py-1 text-sm ${
                categoria === c.slug
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border"
              }`}
            >
              {c.emoji} {c.name}
            </button>
          ))}
        </div>

        {isFetching && <p className="mt-6 text-sm text-muted-foreground">A pesquisar...</p>}

        {!!data?.series.length && (
          <>
            <h2 className="mt-8 text-lg font-semibold">Séries</h2>
            <div className="mt-4 flex flex-wrap gap-4">
              {data.series.map((s) => (
                <SeriesCard key={s.id} s={s} />
              ))}
            </div>
          </>
        )}
        {!!data?.episodes.length && (
          <>
            <h2 className="mt-10 text-lg font-semibold">Episódios</h2>
            <div className="mt-4 flex flex-wrap gap-4">
              {data.episodes.map((e) => (
                <EpisodeCard key={e.episode.id} episode={e.episode} seriesTitle={e.seriesTitle} />
              ))}
            </div>
          </>
        )}
        {data && !data.series.length && !data.episodes.length && (
          <p className="mt-10 text-muted-foreground">Nenhum resultado encontrado.</p>
        )}
      </div>
      <Footer />
    </div>
  );
}
