import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getHomeData } from "@/lib/catalog.functions";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

const q = queryOptions({ queryKey: ["home"], queryFn: () => getHomeData() });

export const Route = createFileRoute("/categorias")({
  head: () => ({
    meta: [
      { title: "Categorias — PULSO" },
      { name: "description", content: "Explore desenhos, memes, memes IA, séries, infantil e conteúdos premium na PULSO." },
      { property: "og:title", content: "Categorias — PULSO" },
      { property: "og:description", content: "Explore todas as categorias da PULSO." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(q),
  component: Categorias,
});

function Categorias() {
  const { data } = useSuspenseQuery(q);
  return (
    <div className="min-h-screen">
      <Header />
      <div className="mx-auto max-w-[1500px] px-4 py-10 sm:px-6">
        <h1 className="font-display text-4xl tracking-wide">Categorias</h1>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.categories.map((c) => (
            <Link
              key={c.id}
              to="/categoria/$slug"
              params={{ slug: c.slug }}
              className="rounded-xl border border-border bg-card p-6 transition hover:border-primary"
            >
              <div className="text-3xl">{c.emoji}</div>
              <p className="mt-2 text-lg font-semibold">{c.name}</p>
              <p className="text-sm text-muted-foreground">
                {data.highlights.filter((s) => s.category?.slug === c.slug).length} séries
              </p>
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
