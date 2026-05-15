import { createFileRoute, Link } from "@tanstack/react-router";
import { Leaf, QrCode, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Verdex — Escanea QR e identifica plantas" },
      { name: "description", content: "App móvil para escanear códigos QR e identificar plantas con IA." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <AppShell>
      <header
        className="relative overflow-hidden rounded-b-[2.5rem] px-6 pt-12 pb-10 text-primary-foreground"
        style={{ background: "var(--gradient-canopy)" }}
      >
        <div className="flex items-center gap-2 text-sm font-medium opacity-80">
          <Leaf className="h-4 w-4" /> Verdex
        </div>
        <h1 className="mt-4 text-4xl leading-tight">
          Escanea, descubre, <span className="italic text-accent">florece</span>.
        </h1>
        <p className="mt-3 text-sm leading-relaxed opacity-80">
          Tu botánico de bolsillo. Lee códigos QR de tus plantas o identifica cualquier especie con la cámara.
        </p>
      </header>

      <section className="space-y-4 px-5 pt-6">
        <Link
          to="/identify"
          className="group block overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm transition hover:shadow-leaf"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <Sparkles className="h-3 w-3" /> IA
              </div>
              <h2 className="mt-3 text-2xl">Identificar planta</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Toma una foto y deja que la IA reconozca la especie y sus cuidados.
              </p>
            </div>
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl text-primary-foreground"
              style={{ background: "var(--gradient-moss)" }}
            >
              <Leaf className="h-7 w-7" />
            </div>
          </div>
        </Link>

        <Link
          to="/scan"
          className="group block overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm transition hover:shadow-leaf"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="inline-flex items-center gap-1 rounded-full bg-accent/30 px-3 py-1 text-xs font-semibold text-accent-foreground">
                Cámara
              </div>
              <h2 className="mt-3 text-2xl">Escanear QR</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Lee etiquetas de viveros, jardines o invernaderos al instante.
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-foreground text-background">
              <QrCode className="h-7 w-7" />
            </div>
          </div>
        </Link>

        <div className="rounded-3xl border border-dashed border-border p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Tip</p>
          <p className="mt-2 text-sm">
            Para mejores resultados, fotografía las hojas con buena luz natural y enfoca el detalle.
          </p>
        </div>
      </section>
    </AppShell>
  );
}
