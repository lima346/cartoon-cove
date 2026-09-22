import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Nova palavra-passe — PULSO" },
      { name: "description", content: "Defina uma nova palavra-passe para a sua conta PULSO." },
      { property: "og:title", content: "Nova palavra-passe — PULSO" },
      { property: "og:description", content: "Defina uma nova palavra-passe." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Palavra-passe actualizada.");
    navigate({ to: "/conta" });
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-2xl border border-border bg-card p-8"
      >
        <h1 className="font-display text-3xl tracking-wide">Nova palavra-passe</h1>
        <div className="mt-6">
          <Label htmlFor="p">Palavra-passe</Label>
          <Input
            id="p"
            type="password"
            minLength={6}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" className="mt-4 w-full" disabled={busy}>
          Guardar
        </Button>
      </form>
    </div>
  );
}
