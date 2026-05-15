import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { QrCode, Link as LinkIcon, RotateCcw, ExternalLink } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/scan")({
  head: () => ({ meta: [{ title: "Escanear QR — Verdex" }] }),
  component: ScanPage,
});

function ScanPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  const stop = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setScanning(false);
  };

  const start = async () => {
    setError(null);
    setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play();
      setScanning(true);
      tick();
    } catch (e) {
      console.error(e);
      setError("No se pudo acceder a la cámara. Permite el acceso e inténtalo de nuevo.");
    }
  };

  const tick = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(img.data, img.width, img.height, { inversionAttempts: "dontInvert" });
    if (code?.data) {
      setResult(code.data);
      stop();
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    start();
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isUrl = result ? /^https?:\/\//i.test(result) : false;

  return (
    <AppShell>
      <header className="px-6 pt-10 pb-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <QrCode className="h-4 w-4" /> Escáner
        </div>
        <h1 className="mt-2 text-3xl">Apunta al código QR</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Centra el QR dentro del marco. La detección es automática.
        </p>
      </header>

      <section className="px-5">
        <div className="relative aspect-square overflow-hidden rounded-3xl bg-foreground/90">
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            playsInline
            muted
          />
          <canvas ref={canvasRef} className="hidden" />
          <div className="pointer-events-none absolute inset-6 rounded-2xl border-2 border-accent/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.25)]" />
          {!scanning && !error && (
            <div className="absolute inset-0 grid place-items-center text-primary-foreground/80 text-sm">
              Iniciando cámara…
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
            <button onClick={start} className="ml-2 underline">
              Reintentar
            </button>
          </div>
        )}

        {result && (
          <div className="mt-5 rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
              <LinkIcon className="h-3.5 w-3.5" /> Resultado
            </div>
            <p className="mt-2 break-all text-sm">{result}</p>
            <div className="mt-4 flex gap-2">
              {isUrl && (
                <a
                  href={result}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground"
                >
                  Abrir enlace <ExternalLink className="h-4 w-4" />
                </a>
              )}
              <button
                onClick={start}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border px-4 py-3 text-sm font-medium"
              >
                <RotateCcw className="h-4 w-4" /> Escanear otro
              </button>
            </div>
          </div>
        )}
      </section>
    </AppShell>
  );
}
