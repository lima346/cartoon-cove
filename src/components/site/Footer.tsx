import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border/60 bg-card/30">
      <div className="mx-auto grid max-w-[1500px] gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-5 w-1.5 rounded-full bg-primary" />
            <span className="font-display text-xl tracking-[0.18em]">PULSO</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Streaming de desenhos, séries, memes e conteúdos criados com IA.
          </p>
        </div>
        <div className="text-sm">
          <p className="mb-3 font-semibold">Navegar</p>
          <ul className="space-y-2 text-muted-foreground">
            <li><Link to="/">Início</Link></li>
            <li><Link to="/novidades">Novidades</Link></li>
            <li><Link to="/categorias">Categorias</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="mb-3 font-semibold">Conta</p>
          <ul className="space-y-2 text-muted-foreground">
            <li><Link to="/conta">Minha Conta</Link></li>
            <li><Link to="/auth" search={{ modo: "entrar" }}>Entrar</Link></li>
          </ul>
        </div>
        <div className="text-sm text-muted-foreground">
          <p className="mb-3 font-semibold text-foreground">Aviso</p>
          <p>Todos os conteúdos são fictícios e de demonstração.</p>
        </div>
      </div>
      <div className="border-t border-border/60 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} PULSO. Todos os direitos reservados.
      </div>
    </footer>
  );
}
