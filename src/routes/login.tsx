import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Leaf, Mail, Lock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import heroImg from "@/assets/hero-jungle.jpg";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Entrar — Verdex" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/" });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setInfo(null); setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { full_name: name },
          },
        });
        if (error) throw error;
        setInfo("Revisa tu correo para confirmar tu cuenta.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/" });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    setLoading(true);
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (res.error) { setError(res.error.message); setLoading(false); }
    else if (!res.redirected) navigate({ to: "/" });
  };

  return (
    <div className="relative mx-auto flex min-h-screen max-w-md flex-col">
      <div className="absolute inset-0 -z-10">
        <img src={heroImg} alt="" className="h-full w-full object-cover opacity-50" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 0%, oklch(0.10 0.03 165) 70%)" }} />
      </div>

      <header className="px-7 pt-16">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
          <Leaf className="h-3.5 w-3.5" /> Verdex
        </div>
        <h1 className="mt-6 text-5xl leading-[1.05] text-foreground">
          Tu jardín,<br />
          <span className="italic text-primary">decodificado</span>.
        </h1>
        <p className="mt-3 max-w-xs text-sm text-muted-foreground">
          Identifica plantas, diagnostica enfermedades y nunca olvides regar otra vez.
        </p>
      </header>

      <section className="mt-auto px-5 pb-8">
        <div className="glass space-y-4 rounded-3xl p-6">
          <div className="flex rounded-2xl bg-secondary/50 p-1 text-xs font-semibold uppercase tracking-wider">
            <button
              onClick={() => setMode("signin")}
              className={`flex-1 rounded-xl py-2 transition ${mode === "signin" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >Entrar</button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 rounded-xl py-2 transition ${mode === "signup" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >Crear cuenta</button>
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === "signup" && (
              <Field icon={<Leaf className="h-4 w-4" />} type="text" placeholder="Tu nombre" value={name} onChange={setName} />
            )}
            <Field icon={<Mail className="h-4 w-4" />} type="email" placeholder="Correo" value={email} onChange={setEmail} required />
            <Field icon={<Lock className="h-4 w-4" />} type="password" placeholder="Contraseña" value={password} onChange={setPassword} required />

            {error && <p className="text-xs text-destructive">{error}</p>}
            {info && <p className="text-xs text-primary">{info}</p>}

            <button
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-60"
              style={{ background: "var(--gradient-moss)" }}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "signin" ? "Entrar" : "Crear cuenta"}
            </button>
          </form>

          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> o <span className="h-px flex-1 bg-border" />
          </div>

          <button
            onClick={google}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card/60 py-3 text-sm font-medium disabled:opacity-60"
          >
            <GoogleIcon /> Continuar con Google
          </button>
        </div>
        <p className="mt-4 text-center text-[10px] uppercase tracking-widest text-muted-foreground">
          Proyecto universitario · Verdex 2026
        </p>
        <Link to="/" className="sr-only">Inicio</Link>
      </section>
    </div>
  );
}

function Field({ icon, type, placeholder, value, onChange, required }: { icon: React.ReactNode; type: string; placeholder: string; value: string; onChange: (v: string) => void; required?: boolean }) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-border bg-card/40 px-4 py-3">
      <span className="text-muted-foreground">{icon}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z" /><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4c-7.7 0-14.3 4.4-17.7 10.7z" /><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.5 16.2 44 24 44z" /><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.1 4.1-3.9 5.6l6.2 5.2C41.8 35.6 44 30.2 44 24c0-1.2-.1-2.3-.4-3.5z" /></svg>
  );
}
