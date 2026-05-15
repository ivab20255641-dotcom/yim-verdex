import { Link, useLocation } from "@tanstack/react-router";
import { Leaf, QrCode, Home } from "lucide-react";
import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const tabs = [
    { to: "/", label: "Inicio", icon: Home },
    { to: "/scan", label: "QR", icon: QrCode },
    { to: "/identify", label: "Planta", icon: Leaf },
  ] as const;

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background">
      <main className="flex-1 pb-24">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md px-4 pb-4">
        <div className="flex items-center justify-around rounded-3xl border border-border/60 bg-card/90 p-2 shadow-leaf backdrop-blur">
          {tabs.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-1 flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs font-medium transition ${
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
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
