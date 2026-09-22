import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Menu, X } from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const NAV = [
  { label: "Início", to: "/" },
  { label: "Desenhos", to: "/categoria/desenhos" },
  { label: "Memes", to: "/categoria/memes" },
  { label: "Séries", to: "/categoria/series" },
  { label: "Novidades", to: "/novidades" },
  { label: "Categorias", to: "/categorias" },
];

export function Header() {
  const { user } = useSession();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    navigate({ to: "/pesquisa", search: { q } });
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1500px] items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="inline-block h-6 w-1.5 rounded-full bg-primary" />
          <span className="font-display text-2xl tracking-[0.18em] text-foreground">PULSO</span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <form onSubmit={submit} className="ml-auto hidden items-center md:flex">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Pesquisar séries, episódios..."
              className="h-9 w-56 rounded-full border border-border bg-secondary/60 pl-9 pr-3 text-sm text-foreground outline-none transition focus:w-72 focus:border-primary"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          {user ? (
            <>
              <Button asChild size="sm" variant="secondary" className="rounded-full">
                <Link to="/conta">Minha Conta</Link>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="hidden rounded-full sm:inline-flex"
                onClick={async () => {
                  await supabase.auth.signOut();
                  navigate({ to: "/", replace: true });
                }}
              >
                Sair
              </Button>
            </>
          ) : (
            <>
              <Button asChild size="sm" variant="ghost" className="rounded-full">
                <Link to="/auth" search={{ modo: "entrar" }}>
                  Entrar
                </Link>
              </Button>
              <Button asChild size="sm" className="rounded-full">
                <Link to="/auth" search={{ modo: "criar" }}>
                  Criar conta
                </Link>
              </Button>
            </>
          )}
          <button
            className="lg:hidden"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border/60 px-4 pb-4 pt-3 lg:hidden">
          <form onSubmit={submit} className="mb-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Pesquisar..."
              className="h-10 w-full rounded-full border border-border bg-secondary/60 px-4 text-sm outline-none focus:border-primary"
            />
          </form>
          <div className="grid grid-cols-2 gap-2">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="rounded-lg bg-secondary/60 px-3 py-2 text-sm"
              >
                {n.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
