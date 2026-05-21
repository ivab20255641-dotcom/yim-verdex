import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Camera, Image as ImageIcon, Loader2, Stethoscope, AlertTriangle, ShieldCheck, RotateCcw, Activity } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { diagnosePlant } from "@/lib/diagnose.functions";

export const Route = createFileRoute("/_authenticated/diagnose")({
  head: () => ({ meta: [{ title: "Diagnóstico — Verdex" }] }),
  component: DiagnosePage,
});

type Diagnosis = {
  status: "saludable" | "alerta" | "enferma";
  severity: "ninguna" | "leve" | "moderada" | "grave";
  problems: { name: string; cause: string; evidence: string }[];
  treatment: string[]; prevention: string[]; summary: string;
};

const statusColors: Record<Diagnosis["status"], string> = {
  saludable: "from-primary/30 to-primary/10 border-primary/40 text-primary",
  alerta: "from-yellow-500/30 to-yellow-500/10 border-yellow-500/40 text-yellow-400",
  enferma: "from-destructive/30 to-destructive/10 border-destructive/40 text-destructive",
};

function DiagnosePage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const galRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [diag, setDiag] = useState<Diagnosis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const diagnose = useServerFn(diagnosePlant);

  const handleFile = async (file: File) => {
    setError(null); setDiag(null);
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl); setLoading(true);
      try {
        const res = await diagnose({ data: { imageBase64: dataUrl } });
        if (res.ok) setDiag(res.diagnosis as Diagnosis);
        else setError(res.error);
      } catch { setError("Error al contactar la IA."); }
      finally { setLoading(false); }
    };
    reader.readAsDataURL(file);
  };

  const reset = () => { setPreview(null); setDiag(null); setError(null); };

  return (
    <AppShell>
      <header className="px-6 pt-10 pb-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
          <Stethoscope className="h-4 w-4" /> Diagnóstico IA
        </div>
        <h1 className="mt-2 text-3xl">¿Está <span className="italic text-primary">enferma</span>?</h1>
        <p className="mt-1 text-sm text-muted-foreground">Foto de la hoja afectada (manchas, plagas, hongos).</p>
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

            <div className="rounded-3xl border border-dashed border-border p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">Tip</p>
              <p className="mt-2 text-xs text-muted-foreground">Enfoca de cerca la zona afectada con buena iluminación natural. Una foto por hoja funciona mejor.</p>
            </div>
          </div>
        )}

        {preview && (
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-3xl border border-border">
              <img src={preview} alt="Planta" className="aspect-square w-full object-cover" />
              {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm">Analizando síntomas…</p>
                </div>
              )}
            </div>

            {error && <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}

            {diag && (
              <article className="space-y-4">
                <div className={`rounded-3xl border bg-gradient-to-br p-5 ${statusColors[diag.status]}`}>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-widest">Estado</p>
                    {diag.status === "saludable" ? <ShieldCheck className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                  </div>
                  <p className="mt-1 text-3xl capitalize">{diag.status}</p>
                  <p className="text-xs uppercase tracking-wider opacity-80">Severidad: {diag.severity}</p>
                  <p className="mt-3 text-sm text-foreground/80">{diag.summary}</p>
                </div>

                {diag.problems.length > 0 && (
                  <div className="rounded-3xl border border-border bg-card p-5">
                    <p className="text-xs font-semibold uppercase tracking-widest text-primary">Problemas detectados</p>
                    <ul className="mt-3 space-y-3">
                      {diag.problems.map((p, i) => (
                        <li key={i} className="border-l-2 border-primary pl-3">
                          <p className="text-sm font-semibold">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.cause}</p>
                          <p className="mt-1 text-xs italic text-muted-foreground">"{p.evidence}"</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {diag.treatment.length > 0 && (
                  <Section icon={<Activity className="h-4 w-4" />} title="Tratamiento" items={diag.treatment} />
                )}
                {diag.prevention.length > 0 && (
                  <Section icon={<ShieldCheck className="h-4 w-4" />} title="Prevención" items={diag.prevention} />
                )}
              </article>
            )}

            <button onClick={reset} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-border px-4 py-3 text-sm font-medium">
              <RotateCcw className="h-4 w-4" /> Analizar otra
            </button>
          </div>
        )}
      </section>
    </AppShell>
  );
}

function Section({ icon, title, items }: { icon: React.ReactNode; title: string; items: string[] }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">{icon} {title}</p>
      <ul className="mt-3 space-y-2 text-sm">
        {items.map((t, i) => (
          <li key={i} className="flex gap-2"><span className="text-primary">›</span><span>{t}</span></li>
        ))}
      </ul>
    </div>
  );
}
