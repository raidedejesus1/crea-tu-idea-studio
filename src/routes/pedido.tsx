import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { Baskets, leftLabel } from "@/components/Baskets";
import { Loading, Shell } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BED_ITEMS, MAX_BASKETS, PROMO_FROM, findSlot, findZone } from "@/lib/data";
import { dateLong, isBookable } from "@/lib/dates";
import { basketUnitPrice, formatPesos, orderTotal, quotaError, remainingBaskets, type Payment } from "@/lib/logic";
import { addOrder, getOrders, useOrders } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pedido")({
  validateSearch: (s: Record<string, unknown>) => ({
    zona: String(s["zona"] ?? ""), fecha: String(s["fecha"] ?? ""), franja: String(s["franja"] ?? ""),
  }),
  head: () => ({
    meta: [
      { title: "Tu pedido · Canasto" },
      { name: "description", content: "Contanos cuántos canastos y prendas de cama tenés." },
      { property: "og:title", content: "Tu pedido · Canasto" },
      { property: "og:description", content: "Elegí canastos y prendas de cama y confirmá el retiro." },
    ],
  }),
  component: Pedido,
});

function Stepper({ value, onChange, min = 0, max }: { value: number; onChange: (n: number) => void; min?: number; max: number }) {
  return (
    <div className="flex items-center gap-3">
      <Button type="button" variant="outline" size="icon" className="h-11 w-11 rounded-full" disabled={value <= min} onClick={() => onChange(value - 1)} aria-label="Menos"><Minus /></Button>
      <span className="w-6 text-center font-display text-2xl">{value}</span>
      <Button type="button" variant="outline" size="icon" className="h-11 w-11 rounded-full" disabled={value >= max} onClick={() => onChange(value + 1)} aria-label="Más"><Plus /></Button>
    </div>
  );
}

function Pedido() {
  const { zona, fecha, franja } = Route.useSearch();
  const zone = findZone(zona);
  const slot = findSlot(zona, franja);
  const orders = useOrders();
  const navigate = useNavigate();
  const [baskets, setBaskets] = useState(1);
  const [items, setItems] = useState<Record<string, number>>({});
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [payment, setPayment] = useState<Payment>("efectivo");

  if (!zone || !slot || !isBookable(fecha)) {
    return (
      <Shell>
        <h1 className="text-3xl font-semibold">Esa franja no está disponible</h1>
        <p className="mt-2 text-muted-foreground">Puede que la fecha ya haya pasado. Elegí otra.</p>
        <Button asChild size="lg" className="mt-6 h-14 rounded-xl"><Link to="/">Elegir zona</Link></Button>
      </Shell>
    );
  }
  if (!orders) return <Shell><Loading /></Shell>;

  const left = remainingBaskets(orders, zona, franja, fecha);
  const error = quotaError(orders, zona, franja, fecha, baskets);
  const total = orderTotal(baskets, items);
  const canSubmit = !error && name.trim() && phone.trim() && address.trim();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || quotaError(getOrders(), zona, franja, fecha, baskets)) return;
    const o = addOrder({ name: name.trim(), phone: phone.trim(), address: address.trim(), notes: notes.trim(), zoneId: zona, slotId: franja, date: fecha, baskets, items, payment });
    navigate({ to: "/confirmacion/$id", params: { id: o.id } });
  }

  return (
    <Shell back={<Link to="/agendar/$zona" params={{ zona }} className="text-sm text-muted-foreground hover:text-foreground">Cambiar franja</Link>}>
      <p className="text-sm font-bold uppercase tracking-wide text-primary">{zone.name}</p>
      <h1 className="mt-1 text-3xl font-semibold first-letter:uppercase">{dateLong(fecha)}, {slot.start} a {slot.end} h</h1>

      <form onSubmit={submit} className="mt-8 grid gap-8">
        <section className="rounded-2xl border bg-card p-5 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Canastos</h2>
              <p className="text-sm text-muted-foreground">1 canasto ≈ lo que entra en un lavarropas de 6 kg.</p>
            </div>
            <Stepper value={baskets} onChange={setBaskets} min={1} max={MAX_BASKETS} />
          </div>
          <div className="mt-4"><Baskets cap={slot.cap} left={left} pending={Math.min(baskets, left)} /></div>
          <p className={cn("mt-2 text-sm font-bold", error ? "text-destructive" : "text-primary")} role={error ? "alert" : undefined}>
            {error ?? `${leftLabel(left)} en esta franja.`}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatPesos(basketUnitPrice(baskets))} cada uno{baskets < PROMO_FROM ? ` · desde ${PROMO_FROM}, $210 c/u` : " · precio por cantidad"}
          </p>
        </section>

        <section className="rounded-2xl border bg-card p-5">
          <h2 className="text-xl font-semibold">Ropa de cama <span className="text-sm font-normal text-muted-foreground">(opcional)</span></h2>
          <p className="text-sm text-muted-foreground">No ocupa lugar de canasto.</p>
          <ul className="mt-4 grid gap-3">
            {BED_ITEMS.map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-3">
                <div><p className="font-semibold">{b.name}</p><p className="text-sm text-muted-foreground">{b.size} · {formatPesos(b.price)}</p></div>
                <Stepper value={items[b.id] ?? 0} max={4} onChange={(n) => setItems((p) => ({ ...p, [b.id]: n }))} />
              </li>
            ))}
          </ul>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold">Tus datos</h2>
          <div className="grid gap-2"><Label htmlFor="name">Nombre</Label><Input id="name" className="h-12" value={name} onChange={(e) => setName(e.target.value)} required /></div>
          <div className="grid gap-2"><Label htmlFor="phone">Celular</Label><Input id="phone" type="tel" inputMode="tel" className="h-12" value={phone} onChange={(e) => setPhone(e.target.value)} required /></div>
          <div className="grid gap-2"><Label htmlFor="address">Dirección</Label><Input id="address" className="h-12" placeholder="Calle, número, apto." value={address} onChange={(e) => setAddress(e.target.value)} required /></div>
          <div className="grid gap-2"><Label htmlFor="notes">Algo más</Label><Textarea id="notes" placeholder="Timbre, portería…" value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
          <div className="grid gap-2">
            <Label>Pagás al recibir con</Label>
            <div className="grid grid-cols-2 gap-2">
              {(["efectivo", "transferencia"] as const).map((p) => (
                <button type="button" key={p} onClick={() => setPayment(p)}
                  className={cn("h-12 rounded-xl border font-semibold capitalize transition", payment === p ? "border-primary bg-primary-soft text-foreground" : "bg-card")}>{p}</button>
              ))}
            </div>
          </div>
        </section>

        <div className="sticky bottom-3 rounded-2xl border bg-card p-4 shadow-soft">
          <div className="flex items-baseline justify-between">
            <span className="text-muted-foreground">Total estimado</span>
            <span className="font-display text-3xl" data-testid="total">{formatPesos(total)}</span>
          </div>
          <Button type="submit" size="lg" disabled={!canSubmit} className="mt-3 h-14 w-full rounded-xl text-lg">Confirmar retiro</Button>
        </div>
      </form>
    </Shell>
  );
}
