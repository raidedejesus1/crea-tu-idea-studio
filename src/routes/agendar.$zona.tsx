import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Baskets, leftLabel } from "@/components/Baskets";
import { Loading, Shell } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { findZone } from "@/lib/data";
import { bookableDates, dateLong, dateShort } from "@/lib/dates";
import { remainingBaskets } from "@/lib/logic";
import { useOrders } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/agendar/$zona")({
  loader: ({ params }) => {
    const zone = findZone(params.zona);
    if (!zone) throw notFound();
    return { zoneName: zone.name };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `Retiros en ${loaderData?.zoneName ?? "tu zona"} · Canasto` },
      { name: "description", content: "Elegí día y franja para que pasemos a buscar tu ropa." },
      { property: "og:title", content: `Retiros en ${loaderData?.zoneName ?? "tu zona"} · Canasto` },
      { property: "og:description", content: "Elegí día y franja y mirá cuántos canastos quedan." },
    ],
  }),
  component: Agendar,
});

function Agendar() {
  const { zona } = Route.useParams();
  const zone = findZone(zona)!;
  const orders = useOrders();
  const [dates] = useState(() => bookableDates(12));
  const [date, setDate] = useState<string>(dates[0] ?? "");

  return (
    <Shell back={<Link to="/" className="text-sm text-muted-foreground hover:text-foreground">Cambiar zona</Link>}>
      <p className="text-sm font-bold uppercase tracking-wide text-primary">{zone.name}</p>
      <h1 className="mt-1 text-3xl font-semibold">¿Qué día pasamos?</h1>

      <div className="-mx-5 mt-6 flex gap-2 overflow-x-auto px-5 pb-2">
        {dates.map((d) => {
          const s = dateShort(d);
          return (
            <button key={d} onClick={() => setDate(d)}
              className={cn("flex min-w-16 flex-col items-center rounded-2xl border px-3 py-3 transition",
                d === date ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary")}>
              <span className="text-xs capitalize">{s.wd}</span>
              <span className="font-display text-2xl">{s.day}</span>
              <span className="text-xs">{s.month}</span>
            </button>
          );
        })}
      </div>

      <h2 className="mt-8 text-lg font-semibold first-letter:uppercase">{dateLong(date)}</h2>
      {!orders ? <Loading /> : (
        <ul className="mt-4 grid gap-3">
          {zone.slots.map((slot) => {
            const left = remainingBaskets(orders, zone.id, slot.id, date);
            const full = left === 0;
            return (
              <li key={slot.id} className={cn("rounded-2xl border bg-card p-5 shadow-soft", full && "opacity-70")}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-2xl">{slot.start} a {slot.end} h</p>
                    <p className={cn("mt-1 font-bold", full ? "text-destructive" : "text-primary")}>{leftLabel(left)}</p>
                  </div>
                  {full ? (
                    <Button size="lg" disabled className="h-12 rounded-xl">Completa</Button>
                  ) : (
                    <Button size="lg" asChild className="h-12 rounded-xl">
                      <Link to="/pedido" search={{ zona: zone.id, fecha: date, franja: slot.id }}>Elegir</Link>
                    </Button>
                  )}
                </div>
                <div className="mt-4"><Baskets cap={slot.cap} left={left} /></div>
              </li>
            );
          })}
        </ul>
      )}
    </Shell>
  );
}
