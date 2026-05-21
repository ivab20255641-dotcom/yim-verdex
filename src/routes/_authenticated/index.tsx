import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Leaf, QrCode, Sprout, BookOpen, Stethoscope, Droplets, ChevronRight, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { listPlants } from "@/lib/garden.functions";
import heroImg from "@/assets/hero-jungle.jpg";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({ meta: [{ title: "Verdex — Tu jardín" }] }),
  component: Home,
});

function Home() {
  const [name, setName] = useState("");
  const [plants, setPlants] = useState<any[]>([]);
  const fetchPlants = useServerFn(listPlants);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const n = data.user?.user_metadata?.full_name || data.user?.user_metadata?.name || data.user?.email?.split("@")[0] || "";
      setName(n);
    });
    fetchPlants().then(setPlants).catch(() => {});
  }, [fetchPlants]);

  const needWater = plants.filter(p => p.next_water_at && new Date(p.next_water_at) <= new Date()).length;

  return (
    <AppShell>
      <header className="relative overflow-hidden px-6 pt-12 pb-8">
        <div className="absolute inset-0 -z-10">
          <img src={heroImg} alt="" className="h-full w-full object-cover opacity-40" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, oklch(0.10 0.03 165 / 0.4) 0%, var(--background) 95%)" }} />
        </div>
        <p className="text-xs uppercase tracking-[0.25em] text-primary">Hola{name ? `, ${name}` : ""}</p>
        <h1 className="mt-3 text-4xl leading-[1.05]">
          Tu jardín está<br />
          <span className="italic text-primary">vivo</span>.
        </h1>

        <div className="mt-6 grid grid-cols-3 gap-2">
          <Stat label="Plantas" value={plants.length} />
          <Stat label="A regar" value={needWater} tone="accent" />
          <Stat label="Especies" value={new Set(plants.map(p => p.scientific_name)).size} />
        </div>
      </header>

      <section className="px-5">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Acciones rápidas</h2>
        <div className="grid grid-cols-2 gap-3">
          <BigAction to="/identify" icon={<Leaf className="h-6 w-6" />} title="Identificar" subtitle="Foto → IA" primary />
          <BigAction to="/diagnose" icon={<Stethoscope className="h-6 w-6" />} title="Diagnóstico" subtitle="Salud de la hoja" />
          <BigAction to="/scan" icon={<QrCode className="h-6 w-6" />} title="Escanear QR" subtitle="Cámara en vivo" />
          <BigAction to="/garden" icon={<Sprout className="h-6 w-6" />} title="Mi jardín" subtitle={`${plants.length} plantas`} />
        </div>
      </section>

      {needWater > 0 && (
        <section className="mt-6 px-5">
          <Link to="/garden" className="flex items-center justify-between rounded-3xl border border-accent/30 bg-accent/10 p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent/20"><Droplets className="h-6 w-6 text-accent" /></span>
              <div>
                <p className="text-sm font-semibold">{needWater} {needWater === 1 ? "planta necesita" : "plantas necesitan"} agua</p>
                <p className="text-xs text-muted-foreground">Revisa tus recordatorios</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Link>
        </section>
      )}

      <section className="mt-6 px-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Recientes</h2>
          <Link to="/garden" className="text-xs font-medium text-primary">Ver todas</Link>
        </div>
        {plants.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-8 text-center">
            <Sparkles className="mx-auto h-7 w-7 text-primary" />
            <p className="mt-3 text-sm font-medium">Tu jardín está vacío</p>
            <p className="mt-1 text-xs text-muted-foreground">Identifica tu primera planta y se guardará aquí.</p>
            <Link to="/identify" className="mt-4 inline-flex rounded-2xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">
              Identificar planta
            </Link>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {plants.slice(0, 6).map(p => (
              <Link key={p.id} to="/garden" className="w-32 flex-shrink-0 overflow-hidden rounded-2xl border border-border bg-card">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.common_name} className="aspect-square w-full object-cover" />
                ) : (
                  <div className="aspect-square w-full bg-secondary grid place-items-center"><Leaf className="h-8 w-8 text-muted-foreground" /></div>
                )}
                <div className="p-2">
                  <p className="truncate text-xs font-semibold">{p.common_name}</p>
                  <p className="truncate text-[10px] italic text-muted-foreground">{p.scientific_name}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-6 px-5 pb-8">
        <Link to="/encyclopedia" className="flex items-center gap-4 rounded-3xl border border-border bg-card p-5">
          <span className="grid h-12 w-12 place-items-center rounded-2xl" style={{ background: "var(--gradient-jade)" }}>
            <BookOpen className="h-6 w-6 text-primary-foreground" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold">Enciclopedia botánica</p>
            <p className="text-xs text-muted-foreground">Explora especies comunes y sus cuidados</p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </Link>
      </section>
    </AppShell>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "accent" }) {
  return (
    <div className={`glass rounded-2xl p-3 ${tone === "accent" ? "border-accent/40" : ""}`}>
      <p className={`text-2xl font-display ${tone === "accent" ? "text-accent" : "text-primary"}`}>{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}

function BigAction({ to, icon, title, subtitle, primary }: { to: any; icon: React.ReactNode; title: string; subtitle: string; primary?: boolean }) {
  return (
    <Link to={to} className={`group relative overflow-hidden rounded-3xl p-5 ${primary ? "text-primary-foreground" : "border border-border bg-card"}`}
      style={primary ? { background: "var(--gradient-moss)" } : undefined}>
      <span className={`grid h-10 w-10 place-items-center rounded-xl ${primary ? "bg-primary-foreground/15" : "bg-primary/15 text-primary"}`}>{icon}</span>
      <p className="mt-4 text-base font-semibold">{title}</p>
      <p className={`text-[11px] ${primary ? "opacity-80" : "text-muted-foreground"}`}>{subtitle}</p>
    </Link>
  );
}
