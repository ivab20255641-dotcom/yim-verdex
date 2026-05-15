import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Camera, Image as ImageIcon, Loader2, Leaf, Droplets, Sun, Thermometer, Sprout, RotateCcw } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { identifyPlant } from "@/lib/plant.functions";

export const Route = createFileRoute("/identify")({
  head: () => ({ meta: [{ title: "Identificar planta — Verdex" }] }),
  component: IdentifyPage,
});

type Plant = {
  commonName: string;
  scientificName: string;
  family: string;
  confidence: "alta" | "media" | "baja";
  description: string;
  care: { light: string; water: string; soil: string; temperature: string };
  funFact: string;
  notes: string;
};

function IdentifyPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [plant, setPlant] = useState<Plant | null>(null);
  const [error, setError] = useState<string | null>(null);
  const identify = useServerFn(identifyPlant);

  const handleFile = async (file: File) => {
    setError(null);
    setPlant(null);
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      setLoading(true);
      try {
        const res = await identify({ data: { imageBase64: dataUrl } });
        if (res.ok) setPlant(res.plant as Plant);
        else setError(res.error);
      } catch (e) {
        console.error(e);
        setError("Error al contactar la IA.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const reset = () => {
    setPreview(null);
    setPlant(null);
    setError(null);
  };

  return (
    <AppShell>
      <header className="px-6 pt-10 pb-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Leaf className="h-4 w-4" /> Identificación con IA
        </div>
        <h1 className="mt-2 text-3xl">¿Qué planta es?</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sube o toma una foto. La IA hace el resto.
        </p>
      </header>

      <section className="px-5">
        {!preview && (
          <div className="space-y-3">
            <button
              onClick={() => fileRef.current?.click()}
              className="flex w-full items-center justify-between rounded-3xl p-6 text-primary-foreground shadow-leaf"
              style={{ background: "var(--gradient-moss)" }}
            >
              <div className="text-left">
                <p className="text-sm opacity-80">Recomendado</p>
                <p className="text-xl font-semibold">Tomar foto</p>
              </div>
              <Camera className="h-8 w-8" />
            </button>
            <label className="flex w-full cursor-pointer items-center justify-between rounded-3xl border border-border bg-card p-6">
              <div className="text-left">
                <p className="text-sm text-muted-foreground">Desde galería</p>
                <p className="text-xl font-semibold">Subir imagen</p>
              </div>
              <ImageIcon className="h-7 w-7 text-primary" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </div>
        )}

        {preview && (
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-3xl">
              <img src={preview} alt="Planta" className="aspect-square w-full object-cover" />
              {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-foreground/60 text-primary-foreground">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <p className="text-sm">Analizando hojas, tallos y flores…</p>
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
                {error}
              </div>
            )}

            {plant && (
              <article className="space-y-4 rounded-3xl border border-border bg-card p-5 shadow-sm">
                <div>
                  <p className="text-xs uppercase tracking-widest text-primary">
                    Confianza {plant.confidence}
                  </p>
                  <h2 className="mt-1 text-3xl">{plant.commonName}</h2>
                  <p className="text-sm italic text-muted-foreground">
                    {plant.scientificName} · {plant.family}
                  </p>
                </div>
                <p className="text-sm leading-relaxed">{plant.description}</p>

                <div className="grid grid-cols-2 gap-2">
                  <CareCard icon={<Sun className="h-4 w-4" />} label="Luz" value={plant.care.light} />
                  <CareCard icon={<Droplets className="h-4 w-4" />} label="Agua" value={plant.care.water} />
                  <CareCard icon={<Sprout className="h-4 w-4" />} label="Sustrato" value={plant.care.soil} />
                  <CareCard icon={<Thermometer className="h-4 w-4" />} label="Temp." value={plant.care.temperature} />
                </div>

                {plant.funFact && (
                  <div className="rounded-2xl bg-accent/20 p-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-accent-foreground">
                      Sabías que…
                    </p>
                    <p className="mt-1 text-sm">{plant.funFact}</p>
                  </div>
                )}

                {plant.notes && (
                  <p className="text-xs text-muted-foreground">{plant.notes}</p>
                )}
              </article>
            )}

            <button
              onClick={reset}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-border px-4 py-3 text-sm font-medium"
            >
              <RotateCcw className="h-4 w-4" /> Identificar otra
            </button>
          </div>
        )}
      </section>
    </AppShell>
  );
}

function CareCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-3">
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
        {icon} {label}
      </div>
      <p className="mt-1 text-xs leading-snug text-muted-foreground">{value}</p>
    </div>
  );
}
