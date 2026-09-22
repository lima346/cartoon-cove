import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getCategoryPage } from "@/lib/catalog.functions";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { SeriesCard } from "@/components/site/Cards";

export const Route = createFileRoute("/categoria/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — PULSO` },
      { name: "description", content: `Séries e episódios da categoria ${params.slug} na PULSO.` },
      { property: "og:title", content: `${params.slug} — PULSO` },
      { property: "og:description", content: `Categoria ${params.slug} na PULSO.` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["categoria", slug],
    queryFn: () => getCategoryPage({ data: { slug } }),
  });

  return (
    <div className="min-h-screen">
      <Header />
      <div className="mx-auto max-w-[1500px] px-4 py-10 sm:px-6">
        <h1 className="font-display text-4xl tracking-wide">
          {data?.category?.emoji} {data?.category?.name ?? slug}
        </h1>
        <div className="mt-4 flex flex-wrap gap-2">
          {(data?.categories ?? []).map((c) => (
            <Link
              key={c.id}
              to="/categoria/$slug"
              params={{ slug: c.slug }}
              className={`rounded-full border px-3 py-1 text-sm ${
                c.slug === slug ? "border-primary bg-primary text-primary-foreground" : "border-border"
              }`}
            >
              {c.emoji} {c.name}
            </Link>
          ))}
        </div>

        {isLoading ? (
          <p className="mt-10 text-muted-foreground">A carregar...</p>
        ) : (data?.series.length ?? 0) === 0 ? (
          <p className="mt-10 text-muted-foreground">Ainda não há conteúdos nesta categoria.</p>
        ) : (
          <div className="mt-8 flex flex-wrap gap-4">
            {data!.series.map((s) => (
              <SeriesCard key={s.id} s={s} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
