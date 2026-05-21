import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Camera, Image as ImageIcon, Loader2, Leaf, Droplets, Sun, Thermometer, Sprout, RotateCcw, Plus, MapPin, Check } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { identifyPlant } from "@/lib/plant.functions";
import { savePlant } from "@/lib/garden.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/identify")({
  head: () => ({ meta: [{ title: "Identificar planta — Verdex" }] }),
  component: IdentifyPage,
});

type Plant = {
  commonName: string; scientificName: string; family: string;
  confidence: "alta" | "media" | "baja"; description: string;
  care: { light: string; water: string; soil: string; temperature: string };
  funFact: string; notes: string;
};

function IdentifyPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const galRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [previewBlob, setPreviewBlob] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [plant, setPlant] = useState<Plant | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const identify = useServerFn(identifyPlant);
  const save = useServerFn(savePlant);
  const navigate = useNavigate();

  const handleFile = async (file: File) => {
    setError(null); setPlant(null); setSaved(false); setPreviewBlob(file);
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
        console.error(e); setError("Error al contactar la IA.");
      } finally { setLoading(false); }
    };
    reader.readAsDataURL(file);
  };

  const reset = () => {
    setPreview(null); setPlant(null); setError(null); setSaved(false); setPreviewBlob(null); setLocation(null);
  };

  const getLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setError("No se pudo obtener tu ubicación."),
      { enableHighAccuracy: false, timeout: 5000 }
    );
  };

  const handleSave = async () => {
    if (!plant || !previewBlob) return;
    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error("No autenticado");

      const ext = previewBlob.name.split(".").pop() || "jpg";
      const path = `${userId}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("plants").upload(path, previewBlob, { upsert: false });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("plants").getPublicUrl(path);

      await save({ data: {
        common_name: plant.commonName,
        scientific_name: plant.scientificName,
        family: plant.family,
        description: plant.description,
        image_url: pub.publicUrl,
        care: plant.care,
        latitude: location?.lat ?? null,
        longitude: location?.lng ?? null,
        water_every_days: 7,
      }});
      setSaved(true);
      setTimeout(() => navigate({ to: "/garden" }), 800);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar.");
    } finally { setSaving(false); }
  };

  return (
    <AppShell>
      <header className="px-6 pt-10 pb-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
          <Leaf className="h-4 w-4" /> Identificación IA
        </div>
        <h1 className="mt-2 text-3xl">¿Qué <span className="italic text-primary">planta</span> es?</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sube o toma una foto. La IA hace el resto.</p>
      </header>

      <section className="px-5">
        {!preview && (
          <div className="space-y-3">
            <button onClick={() => fileRef.current?.click()}
              className="flex w-full items-center justify-between rounded-3xl p-6 text-primary-foreground shadow-glow"
              style={{ background: "var(--gradient-moss)" }}>
              <div className="text-left">
                <p className="text-xs uppercase tracking-widest opacity-80">Recomendado</p>
                <p className="text-xl font-semibold">Tomar foto</p>
              </div>
              <Camera className="h-8 w-8" />
            </button>
            <button onClick={() => galRef.current?.click()}
              className="flex w-full items-center justify-between rounded-3xl border border-border bg-card p-6">
              <div className="text-left">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Desde galería</p>
                <p className="text-xl font-semibold">Subir imagen</p>
              </div>
              <ImageIcon className="h-7 w-7 text-primary" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            <input ref={galRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </div>
        )}

        {preview && (
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-3xl border border-border">
              <img src={preview} alt="Planta" className="aspect-square w-full object-cover" />
              {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm">Analizando hojas, tallos y flores…</p>
                </div>
              )}
            </div>

            {error && <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}

            {plant && (
              <article className="space-y-4 rounded-3xl border border-primary/20 bg-card p-5 shadow-glow">
                <div>
                  <p className="text-xs uppercase tracking-widest text-primary">Confianza {plant.confidence}</p>
                  <h2 className="mt-1 text-3xl">{plant.commonName}</h2>
                  <p className="text-sm italic text-muted-foreground">{plant.scientificName} · {plant.family}</p>
                </div>
                <p className="text-sm leading-relaxed">{plant.description}</p>
                <div className="grid grid-cols-2 gap-2">
                  <CareCard icon={<Sun className="h-4 w-4" />} label="Luz" value={plant.care.light} />
                  <CareCard icon={<Droplets className="h-4 w-4" />} label="Agua" value={plant.care.water} />
                  <CareCard icon={<Sprout className="h-4 w-4" />} label="Sustrato" value={plant.care.soil} />
                  <CareCard icon={<Thermometer className="h-4 w-4" />} label="Temp." value={plant.care.temperature} />
                </div>
                {plant.funFact && (
                  <div className="rounded-2xl bg-primary/10 p-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-primary">Sabías que…</p>
                    <p className="mt-1 text-sm">{plant.funFact}</p>
                  </div>
                )}

                <div className="space-y-2 border-t border-border pt-4">
                  <button onClick={getLocation}
                    className={`flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-medium ${location ? "border-primary/40 bg-primary/10 text-primary" : "border-border"}`}>
                    <MapPin className="h-4 w-4" />
                    {location ? `Ubicación capturada (${location.lat.toFixed(3)}, ${location.lng.toFixed(3)})` : "Marcar ubicación"}
                  </button>
                  <button onClick={handleSave} disabled={saving || saved}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-60"
                    style={{ background: "var(--gradient-moss)" }}>
                    {saved ? <><Check className="h-4 w-4" /> Guardada</> : saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Guardando…</> : <><Plus className="h-4 w-4" /> Guardar en mi jardín</>}
                  </button>
                </div>
              </article>
            )}

            <button onClick={reset}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-border px-4 py-3 text-sm font-medium">
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
    <div className="rounded-2xl border border-border bg-background/40 p-3">
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">{icon} {label}</div>
      <p className="mt-1 text-xs leading-snug text-muted-foreground">{value}</p>
    </div>
  );
}
