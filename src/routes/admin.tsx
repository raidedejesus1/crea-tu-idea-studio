import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Baskets, leftLabel } from "@/components/Baskets";
import { Loading, Shell } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ADMIN_PASSWORD } from "@/lib/config";
import { BED_ITEMS, ZONES, findSlot } from "@/lib/data";
import { bookableDates, dateShort } from "@/lib/dates";
import { formatPesos, orderTotal, remainingBaskets } from "@/lib/logic";
import { cancelOrder, useOrders } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Panel de recorrido · Canasto" },
      { name: "description", content: "Canastos por franja y pedidos del día." },
      { property: "og:title", content: "Panel de recorrido · Canasto" },
      { property: "og:description", content: "Canastos por franja y pedidos del día." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

const SESSION_KEY = "canasto:admin";

function Admin() {
  const [ok, setOk] = useState<boolean | null>(null);
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  useEffect(() => setOk(sessionStorage.getItem(SESSION_KEY) === "1"), []);

  if (ok === null) return <Shell><Loading /></Shell>;
  if (!ok) {
    return (
      <Shell back={<Link to="/" className="text-sm text-muted-foreground">Inicio</Link>}>
        <h1 className="text-3xl font-semibold">Panel del recorrido</h1>
        <form className="mt-6 grid max-w-sm gap-3" onSubmit={(e) => {
          e.preventDefault();
          if (pw === ADMIN_PASSWORD) { sessionStorage.setItem(SESSION_KEY, "1"); setOk(true); } else setErr(true);
        }}>
          <Input type="password" className="h-12" placeholder="Clave" value={pw} onChange={(e) => { setPw(e.target.value); setErr(false); }} />
          {err && <p className="text-sm font-bold text-destructive">Esa clave no es.</p>}
          <Button size="lg" className="h-12 rounded-xl">Entrar</Button>
        </form>
      </Shell>
    );
  }
  return <Panel />;
}

function Panel() {
  const orders = useOrders();
  const [dates] = useState(() => bookableDates(12));
  const [date, setDate] = useState(dates[0]);
  if (!orders) return <Shell><Loading /></Shell>;
  const dayOrders = orders.filter((o) => o.date === date && o.status === "activo");

  return (
    <Shell back={<Link to="/" className="text-sm text-muted-foreground">Inicio</Link>}>
      <h1 className="text-3xl font-semibold">Recorrido</h1>
      <div className="-mx-5 mt-5 flex gap-2 overflow-x-auto px-5 pb-2">
        {dates.map((d) => {
          const s = dateShort(d);
          const n = orders.filter((o) => o.date === d && o.status === "activo").length;
          return (
            <button key={d} onClick={() => setDate(d)}
              className={cn("flex min-w-16 flex-col items-center rounded-2xl border px-3 py-2", d === date ? "border-primary bg-primary text-primary-foreground" : "bg-card")}>
              <span className="text-xs capitalize">{s.wd}</span>
              <span className="font-display text-xl">{s.day}</span>
              <span className="text-xs">{n} ped.</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6">
        {ZONES.map((z) => (
          <section key={z.id}>
            <h2 className="text-lg font-semibold">{z.name}</h2>
            <div className="mt-2 grid gap-3">
              {z.slots.map((s) => {
                const left = remainingBaskets(orders, z.id, s.id, date);
                const list = dayOrders.filter((o) => o.zoneId === z.id && o.slotId === s.id);
                return (
                  <div key={s.id} className="rounded-2xl border bg-card p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-display text-xl">{s.start}–{s.end} h</p>
                      <p className={cn("text-sm font-bold", left === 0 ? "text-destructive" : "text-primary")}>{s.cap - left}/{s.cap} · {leftLabel(left)}</p>
                    </div>
                    <div className="mt-2"><Baskets cap={s.cap} left={left} size="sm" /></div>
                    {list.length === 0 ? (
                      <p className="mt-3 text-sm text-muted-foreground">Sin pedidos en esta franja.</p>
                    ) : (
                      <ul className="mt-3 divide-y">
                        {list.map((o) => (
                          <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                            <div className="min-w-0">
                              <p className="font-semibold">{o.name} · {o.baskets} canasto{o.baskets > 1 ? "s" : ""}</p>
                              <p className="text-sm text-muted-foreground">{o.address} · {o.phone}</p>
                              <p className="text-sm text-muted-foreground">
                                {BED_ITEMS.filter((b) => o.items[b.id]).map((b) => `${o.items[b.id]}× ${b.name} ${b.size}`).join(", ")}
                                {" "}{formatPesos(orderTotal(o.baskets, o.items))} · {o.payment} · #{o.id}
                              </p>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => {
                              if (!confirm(`¿Cancelar el pedido de ${o.name}?`)) return;
                              cancelOrder(o.id);
                              toast.success(`Cancelado. Volvieron ${o.baskets} canastos a ${findSlot(o.zoneId, o.slotId)?.start}–${findSlot(o.zoneId, o.slotId)?.end} h.`);
                            }}>Cancelar</Button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </Shell>
  );
}
