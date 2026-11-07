import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, MapPin } from "lucide-react";
import { Shell } from "@/components/Shell";
import { BASKET_PRICE, BASKET_PROMO_PRICE, BED_ITEMS, ZONES } from "@/lib/data";
import { formatPesos } from "@/lib/logic";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Canasto · Agendá el retiro de tu ropa en Montevideo" },
      { name: "description", content: "Lavado, secado, perfumado y doblado por canasto. Elegí tu zona y agendá el retiro." },
      { property: "og:title", content: "Canasto · Agendá el retiro de tu ropa" },
      { property: "og:description", content: "Lavado por canasto en Montevideo. Elegí zona, día y franja." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <Shell back={<Link to="/admin" className="text-sm text-muted-foreground hover:text-foreground">Panel</Link>}>
      <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">Pasamos a buscar tu ropa.<br /><span className="text-primary">Te la traemos doblada.</span></h1>
      <p className="mt-4 text-lg text-muted-foreground">Lavado, secado, perfumado y doblado. Sin planchado. Vuelve en unas 24 horas.</p>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">¿En qué zona estás?</h2>
        <ul className="mt-4 grid gap-3">
          {ZONES.map((z) => (
            <li key={z.id}>
              <Link to="/agendar/$zona" params={{ zona: z.id }}
                className="flex items-center gap-4 rounded-2xl border bg-card p-5 shadow-soft transition hover:border-primary">
                <MapPin className="h-6 w-6 text-primary" />
                <div className="flex-1">
                  <p className="font-display text-lg font-semibold">{z.name}</p>
                  <p className="text-sm text-muted-foreground">{z.slots.map((s) => `${s.start} a ${s.end}`).join(" · ")} h</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-muted-foreground">De lunes a sábado. Agendás desde mañana.</p>
      </section>

      <section className="mt-12 rounded-2xl border-2 border-dashed border-primary/40 bg-card p-6">
        <h2 className="text-xl font-semibold">Precios</h2>
        <p className="mt-1 text-sm text-muted-foreground">1 canasto ≈ lo que entra en un lavarropas de 6 kg.</p>
        <div className="mt-4 flex items-baseline justify-between border-b pb-3">
          <span className="font-bold">Canasto de ropa</span>
          <span className="font-display text-2xl text-primary">{formatPesos(BASKET_PRICE)}</span>
        </div>
        <div className="flex items-baseline justify-between border-b py-3">
          <span>Desde 3 canastos, cada uno</span>
          <span className="font-display text-xl">{formatPesos(BASKET_PROMO_PRICE)}</span>
        </div>
        <ul className="mt-3 grid gap-1 text-sm">
          {BED_ITEMS.map((b) => (
            <li key={b.id} className="flex justify-between"><span>{b.name}, {b.size}</span><span>{formatPesos(b.price)}</span></li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-muted-foreground">Pagás al recibir: efectivo o transferencia.</p>
      </section>
    </Shell>
  );
}
