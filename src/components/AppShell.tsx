import { Link, useLocation } from "@tanstack/react-router";
import { Leaf, QrCode, Home, Sprout, BookOpen } from "lucide-react";
import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const tabs = [
    { to: "/", label: "Inicio", icon: Home },
    { to: "/scan", label: "QR", icon: QrCode },
    { to: "/identify", label: "Identificar", icon: Leaf, primary: true },
    { to: "/garden", label: "Jardín", icon: Sprout },
    { to: "/encyclopedia", label: "Saber", icon: BookOpen },
  ] as const;

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col">
      <main className="flex-1 pb-28">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md px-3 pb-3">
        <div className="glass flex items-end justify-around rounded-3xl p-2 shadow-leaf">
          {tabs.map(({ to, label, icon: Icon, primary }) => {
            const active = pathname === to || (to !== "/" && pathname.startsWith(to));
            if (primary) {
              return (
                <Link
                  key={to}
                  to={to}
                  className={`-mt-6 flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[10px] font-semibold uppercase tracking-wider ${
                    active ? "text-primary-foreground" : "text-primary-foreground/90"
                  }`}
                >
                  <span
                    className="grid h-14 w-14 place-items-center rounded-2xl text-primary-foreground shadow-glow pulse-leaf"
                    style={{ background: "var(--gradient-moss)" }}
                  >
                    <Icon className="h-6 w-6" />
                  </span>
                  {label}
                </Link>
              );
            }
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[10px] font-medium uppercase tracking-wider transition ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
