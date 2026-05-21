import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sprout, Droplets, MapPin, Trash2, Leaf, Map as MapIcon, List } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { listPlants, waterPlant, deletePlant } from "@/lib/garden.functions";

export const Route = createFileRoute("/_authenticated/garden")({
  head: () => ({ meta: [{ title: "Mi jardín — Verdex" }] }),
  component: GardenPage,
});

function GardenPage() {
  const [plants, setPlants] = useState<any[]>([]);
  const [view, setView] = useState<"list" | "map">("list");
  const [loading, setLoading] = useState(true);
  const fetchPlants = useServerFn(listPlants);
  const water = useServerFn(waterPlant);
  const del = useServerFn(deletePlant);

  const reload = () => fetchPlants().then((d) => { setPlants(d); setLoading(false); });
  useEffect(() => { reload(); /* eslint-disable-next-line */ }, []);

  const handleWater = async (id: string) => { await water({ data: { id } }); reload(); };
  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta planta de tu jardín?")) return;
    await del({ data: { id } }); reload();
  };

  const withLocation = plants.filter(p => p.latitude && p.longitude);

  return (
    <AppShell>
      <header className="px-6 pt-10 pb-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
          <Sprout className="h-4 w-4" /> Mi jardín
        </div>
        <h1 className="mt-2 text-3xl">{plants.length} {plants.length === 1 ? "planta" : "plantas"} <span className="italic text-primary">tuyas</span></h1>

        <div className="mt-4 flex gap-2 rounded-2xl bg-secondary/40 p-1 text-xs font-semibold uppercase tracking-wider">
          <button onClick={() => setView("list")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 ${view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
            <List className="h-3.5 w-3.5" /> Lista
          </button>
          <button onClick={() => setView("map")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 ${view === "map" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
            <MapIcon className="h-3.5 w-3.5" /> Mapa
          </button>
        </div>
      </header>

      <section className="px-5">
        {loading ? (
          <p className="py-12 text-center text-sm text-muted-foreground">Cargando…</p>
        ) : plants.length === 0 ? (
          <EmptyState />
        ) : view === "list" ? (
          <div className="space-y-3">
            {plants.map(p => <PlantRow key={p.id} plant={p} onWater={handleWater} onDelete={handleDelete} />)}
          </div>
        ) : (
          <MapView plants={withLocation} />
        )}
      </section>
    </AppShell>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-border p-10 text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl" style={{ background: "var(--gradient-jade)" }}>
        <Leaf className="h-8 w-8 text-primary-foreground" />
      </div>
      <p className="mt-4 text-lg font-semibold">Tu jardín espera</p>
      <p className="mt-1 text-sm text-muted-foreground">Identifica una planta para empezar a coleccionarlas.</p>
      <Link to="/identify"
        className="mt-5 inline-flex rounded-2xl px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow"
        style={{ background: "var(--gradient-moss)" }}>
        Identificar mi primera planta
      </Link>
    </div>
  );
}

function PlantRow({ plant, onWater, onDelete }: { plant: any; onWater: (id: string) => void; onDelete: (id: string) => void }) {
  const needsWater = plant.next_water_at && new Date(plant.next_water_at) <= new Date();
  const daysLeft = plant.next_water_at ? Math.ceil((new Date(plant.next_water_at).getTime() - Date.now()) / 86400000) : null;

  return (
    <div className={`overflow-hidden rounded-3xl border bg-card ${needsWater ? "border-accent/40 shadow-glow" : "border-border"}`}>
      <div className="flex gap-3 p-3">
        {plant.image_url ? (
          <img src={plant.image_url} alt={plant.common_name} className="h-24 w-24 flex-shrink-0 rounded-2xl object-cover" />
        ) : (
          <div className="grid h-24 w-24 flex-shrink-0 place-items-center rounded-2xl bg-secondary"><Leaf className="h-8 w-8 text-muted-foreground" /></div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold">{plant.common_name}</p>
          <p className="truncate text-xs italic text-muted-foreground">{plant.scientific_name}</p>

          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px]">
            {needsWater ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-accent/20 px-2 py-0.5 font-semibold text-accent">
                <Droplets className="h-3 w-3" /> Regar ya
              </span>
            ) : daysLeft !== null && (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                <Droplets className="h-3 w-3" /> {daysLeft}d
              </span>
            )}
            {plant.latitude && (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                <MapPin className="h-3 w-3" /> Ubicada
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex border-t border-border">
        <button onClick={() => onWater(plant.id)}
          className="flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-semibold text-primary hover:bg-primary/10">
          <Droplets className="h-4 w-4" /> Regué
        </button>
        <div className="w-px bg-border" />
        <button onClick={() => onDelete(plant.id)}
          className="flex items-center justify-center gap-1.5 px-5 py-3 text-xs font-medium text-muted-foreground hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function MapView({ plants }: { plants: any[] }) {
  if (plants.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border p-10 text-center">
        <MapPin className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium">Sin ubicaciones</p>
        <p className="mt-1 text-xs text-muted-foreground">Cuando guardes una planta, activa "Marcar ubicación" para verla aquí.</p>
      </div>
    );
  }
  const lats = plants.map(p => p.latitude);
  const lngs = plants.map(p => p.longitude);
  const minLat = Math.min(...lats) - 0.01, maxLat = Math.max(...lats) + 0.01;
  const minLng = Math.min(...lngs) - 0.01, maxLng = Math.max(...lngs) + 0.01;
  const bbox = `${minLng},${minLat},${maxLng},${maxLat}`;
  const markers = plants.map(p => `${p.latitude},${p.longitude}`).join("|");
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${plants[0].latitude},${plants[0].longitude}`;

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-3xl border border-border">
        <iframe src={mapUrl} className="h-80 w-full" loading="lazy" title="Mapa de plantas" />
      </div>
      <div className="space-y-2">
        {plants.map(p => (
          <div key={p.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
            <MapPin className="h-4 w-4 text-primary" />
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold">{p.common_name}</p>
              <p className="text-[10px] font-mono text-muted-foreground">{p.latitude.toFixed(4)}, {p.longitude.toFixed(4)}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-center text-muted-foreground">Mapa via OpenStreetMap · {markers.split("|").length} puntos</p>
    </div>
  );
}
