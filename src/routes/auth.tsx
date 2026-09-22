import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({
    modo: s['modo'] === "criar" ? "criar" : "entrar",
  }),
  head: () => ({
    meta: [
      { title: "Entrar ou criar conta — PULSO" },
      { name: "description", content: "Aceda à sua conta PULSO para assistir episódios e gerir o seu plano." },
      { property: "og:title", content: "Entrar ou criar conta — PULSO" },
      { property: "og:description", content: "Aceda à sua conta PULSO." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { modo } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"entrar" | "criar" | "recuperar">(modo);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/conta", replace: true });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "entrar") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/conta" });
      } else if (mode === "criar") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: name },
          },
        });
        if (error) throw error;
        if (data.session) navigate({ to: "/conta" });
        else toast.success("Conta criada! Confirme o seu e-mail para entrar.");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Enviámos um link de recuperação para o seu e-mail.");
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[url('/images/hero.jpg')] bg-cover bg-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-background/90 p-8 backdrop-blur-xl">
        <Link to="/" className="mb-6 flex items-center gap-2">
          <span className="inline-block h-6 w-1.5 rounded-full bg-primary" />
          <span className="font-display text-2xl tracking-[0.18em]">PULSO</span>
        </Link>
        <h1 className="font-display text-3xl tracking-wide">
          {mode === "entrar" ? "Entrar" : mode === "criar" ? "Criar conta" : "Recuperar palavra-passe"}
        </h1>

        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode === "criar" && (
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          )}
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {mode !== "recuperar" && (
            <div>
              <Label htmlFor="pass">Palavra-passe</Label>
              <Input
                id="pass"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          )}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy
              ? "Aguarde..."
              : mode === "entrar"
                ? "Entrar"
                : mode === "criar"
                  ? "Criar conta"
                  : "Enviar link"}
          </Button>
        </form>

        {mode !== "recuperar" && (
          <>
            <div className="my-4 text-center text-xs text-muted-foreground">ou</div>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() =>
                lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin })
              }
            >
              Continuar com Google
            </Button>
          </>
        )}

        <div className="mt-6 space-y-2 text-sm text-muted-foreground">
          {mode !== "entrar" && (
            <button onClick={() => setMode("entrar")} className="block hover:text-foreground">
              Já tenho conta — entrar
            </button>
          )}
          {mode !== "criar" && (
            <button onClick={() => setMode("criar")} className="block hover:text-foreground">
              Não tenho conta — criar agora
            </button>
          )}
          {mode !== "recuperar" && (
            <button onClick={() => setMode("recuperar")} className="block hover:text-foreground">
              Esqueci a palavra-passe
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
