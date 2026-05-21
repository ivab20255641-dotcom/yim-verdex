import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpen, Search, Sun, Droplets } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated/encyclopedia")({
  head: () => ({ meta: [{ title: "Enciclopedia — Verdex" }] }),
  component: EncyclopediaPage,
});

type Entry = {
  common: string; scientific: string; family: string;
  difficulty: "fácil" | "media" | "exigente";
  light: string; water: string; emoji: string;
  desc: string;
};

const ENTRIES: Entry[] = [
  { common: "Monstera", scientific: "Monstera deliciosa", family: "Araceae", difficulty: "fácil", light: "Luz indirecta brillante", water: "Cada 7-10 días", emoji: "🌿", desc: "Hojas perforadas icónicas. Originaria de selvas tropicales de México y Panamá." },
  { common: "Pothos", scientific: "Epipremnum aureum", family: "Araceae", difficulty: "fácil", light: "Sombra a luz media", water: "Cada 7-14 días", emoji: "🍃", desc: "Trepadora resistente, ideal para principiantes. Purifica el aire." },
  { common: "Sansevieria", scientific: "Dracaena trifasciata", family: "Asparagaceae", difficulty: "fácil", light: "Cualquier luz", water: "Cada 14-21 días", emoji: "🌱", desc: "Lengua de suegra. Casi indestructible, tolera el olvido." },
  { common: "Ficus lyrata", scientific: "Ficus lyrata", family: "Moraceae", difficulty: "exigente", light: "Luz indirecta intensa", water: "Cada 7 días", emoji: "🌳", desc: "Hojas en forma de violín. Dramática pero sensible a cambios." },
  { common: "Aloe vera", scientific: "Aloe barbadensis", family: "Asphodelaceae", difficulty: "fácil", light: "Sol directo", water: "Cada 14-21 días", emoji: "🪴", desc: "Suculenta medicinal. Su gel calma quemaduras." },
  { common: "Calathea", scientific: "Calathea orbifolia", family: "Marantaceae", difficulty: "exigente", light: "Luz indirecta suave", water: "Suelo siempre húmedo", emoji: "🌿", desc: "Hojas rayadas plateadas. Requiere alta humedad ambiental." },
  { common: "Suculenta Echeveria", scientific: "Echeveria elegans", family: "Crassulaceae", difficulty: "fácil", light: "Sol directo", water: "Cada 14 días", emoji: "🌵", desc: "Rosetas geométricas. Acumula agua en sus hojas carnosas." },
  { common: "Helecho Boston", scientific: "Nephrolepis exaltata", family: "Nephrolepidaceae", difficulty: "media", light: "Luz indirecta", water: "Suelo húmedo constante", emoji: "🌿", desc: "Frondas plumosas. Adora humedad y baños regulares." },
  { common: "ZZ Plant", scientific: "Zamioculcas zamiifolia", family: "Araceae", difficulty: "fácil", light: "Sombra a luz baja", water: "Cada 14-21 días", emoji: "🌱", desc: "Hojas brillantes cerosas. Sobrevive en cualquier rincón oscuro." },
  { common: "Orquídea Phalaenopsis", scientific: "Phalaenopsis spp.", family: "Orchidaceae", difficulty: "media", light: "Luz filtrada", water: "Sumergir cada 7-10 días", emoji: "🌸", desc: "Flores duraderas que pueden florecer varias veces al año." },
  { common: "Cactus San Pedro", scientific: "Echinopsis pachanoi", family: "Cactaceae", difficulty: "fácil", light: "Sol pleno", water: "Cada 21-30 días", emoji: "🌵", desc: "Cactus columnar andino, crece rápido en climas cálidos." },
  { common: "Hortensia", scientific: "Hydrangea macrophylla", family: "Hydrangeaceae", difficulty: "media", light: "Media sombra", water: "Riego abundante", emoji: "💐", desc: "Sus flores cambian de color según el pH del suelo." },
];

const diffColors: Record<Entry["difficulty"], string> = {
  "fácil": "bg-primary/15 text-primary",
  "media": "bg-yellow-500/15 text-yellow-400",
  "exigente": "bg-destructive/15 text-destructive",
};

function EncyclopediaPage() {
  const [q, setQ] = useState("");
  const filtered = ENTRIES.filter(e =>
    e.common.toLowerCase().includes(q.toLowerCase()) ||
    e.scientific.toLowerCase().includes(q.toLowerCase()) ||
    e.family.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <AppShell>
      <header className="px-6 pt-10 pb-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
          <BookOpen className="h-4 w-4" /> Enciclopedia
        </div>
        <h1 className="mt-2 text-3xl"><span className="italic text-primary">{ENTRIES.length}</span> especies comunes</h1>

        <label className="mt-5 flex items-center gap-3 rounded-2xl border border-border bg-card/60 px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar planta, especie o familia…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
        </label>
      </header>

      <section className="space-y-3 px-5">
        {filtered.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Sin resultados</p>
        )}
        {filtered.map(e => (
          <article key={e.scientific} className="overflow-hidden rounded-3xl border border-border bg-card">
            <div className="flex items-start gap-4 p-5">
              <span className="text-4xl">{e.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="truncate text-lg font-semibold">{e.common}</h2>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${diffColors[e.difficulty]}`}>{e.difficulty}</span>
                </div>
                <p className="truncate text-xs italic text-muted-foreground">{e.scientific} · {e.family}</p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{e.desc}</p>
                <div className="mt-3 flex gap-2 text-[10px]">
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1"><Sun className="h-3 w-3 text-primary" />{e.light}</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1"><Droplets className="h-3 w-3 text-primary" />{e.water}</span>
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
