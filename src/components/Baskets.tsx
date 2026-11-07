import { ShoppingBasket } from "lucide-react";
import { cn } from "@/lib/utils";

/** Contador visual: íconos llenos = libres, vacíos = ocupados. `pending` resalta los que se van a usar. */
export function Baskets({ cap, left, pending = 0, size = "md" }: { cap: number; left: number; pending?: number; size?: "sm" | "md" }) {
  return (
    <div className="flex flex-wrap gap-1" aria-label={`Quedan ${left} de ${cap} canastos`}>
      {Array.from({ length: cap }, (_, i) => {
        const free = i < left;
        const willUse = free && i >= left - pending;
        return (
          <ShoppingBasket
            key={i}
            className={cn(
              size === "sm" ? "h-4 w-4" : "h-5 w-5",
              "transition-colors",
              willUse ? "text-accent-foreground fill-accent" : free ? "text-primary fill-primary-soft" : "text-border",
            )}
          />
        );
      })}
    </div>
  );
}

export function leftLabel(left: number) {
  if (left === 0) return "Completa";
  return left === 1 ? "Queda 1 canasto" : `Quedan ${left} canastos`;
}
