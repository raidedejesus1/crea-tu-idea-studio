import { Link } from "@tanstack/react-router";
import { ShoppingBasket } from "lucide-react";
import type { ReactNode } from "react";

export function Shell({ children, back }: { children: ReactNode; back?: ReactNode }) {
  return (
    <div className="min-h-screen bg-background bg-fresh">
      <header className="mx-auto flex max-w-2xl items-center justify-between px-5 pt-6">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-semibold text-foreground">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground">
            <ShoppingBasket className="h-5 w-5" />
          </span>
          Canasto
        </Link>
        {back}
      </header>
      <main className="mx-auto max-w-2xl px-5 pb-16 pt-8">{children}</main>
    </div>
  );
}

export function Loading() {
  return <p className="py-20 text-center text-muted-foreground">Cargando…</p>;
}
