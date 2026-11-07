import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarPlus, Check, MessageCircle } from "lucide-react";
import { Loading, Shell } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { BED_ITEMS, findSlot, findZone } from "@/lib/data";
import { dateLong, weekdayLong } from "@/lib/dates";
import { downloadIcs } from "@/lib/ics";
import { formatPesos, orderTotal, type Order } from "@/lib/logic";
import { useOrders } from "@/lib/store";

export const Route = createFileRoute("/confirmacion/$id")({
  head: () => ({
    meta: [
      { title: "Retiro agendado · Canasto" },
      { name: "description", content: "Tu comprobante de retiro." },
      { property: "og:title", content: "Retiro agendado · Canasto" },
      { property: "og:description", content: "Comprobante del retiro de ropa." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Confirmacion,
});

function shareText(o: Order) {
  const slot = findSlot(o.zoneId, o.slotId)!;
  return `Agendé el retiro de ropa (pedido ${o.id}): ${o.baskets} canasto${o.baskets > 1 ? "s" : ""}. Pasan el ${weekdayLong(o.date)} ${dateLong(o.date).split(", ")[1] ?? ""} entre las ${slot.start} y las ${slot.end} por ${o.address}. Total estimado ${formatPesos(orderTotal(o.baskets, o.items))}, pago en ${o.payment}.`;
}

function Confirmacion() {
  const { id } = Route.useParams();
  const orders = useOrders();
  if (!orders) return <Shell><Loading /></Shell>;
  const o = orders.find((x) => x.id === id);
  if (!o) {
    return (
      <Shell>
        <h1 className="text-3xl font-semibold">No encontramos ese pedido</h1>
        <Button asChild size="lg" className="mt-6 h-14 rounded-xl"><Link to="/">Agendar un retiro</Link></Button>
      </Shell>
    );
  }
  const zone = findZone(o.zoneId)!;
  const slot = findSlot(o.zoneId, o.slotId)!;
  const beds = BED_ITEMS.filter((b) => (o.items[b.id] ?? 0) > 0);

  return (
    <Shell>
      <div className="grid h-16 w-16 place-items-center rounded-full bg-primary text-primary-foreground"><Check className="h-8 w-8" /></div>
      <h1 className="mt-5 text-3xl font-semibold">{o.status === "cancelado" ? "Este pedido fue cancelado" : "¡Listo, quedó agendado!"}</h1>
      <p className="mt-2 text-lg">Pasamos el <b>{weekdayLong(o.date)}</b> entre las <b>{slot.start} y las {slot.end}</b>.</p>

      <dl className="mt-8 grid gap-3 rounded-2xl border-2 border-dashed border-primary/40 bg-card p-5">
        <Row k="Pedido" v={o.id} />
        <Row k="Fecha" v={<span className="capitalize">{dateLong(o.date)}</span>} />
        <Row k="Zona" v={zone.name} />
        <Row k="Dirección" v={o.address} />
        <Row k="Canastos" v={o.baskets} />
        {beds.map((b) => <Row key={b.id} k={`${b.name} ${b.size}`} v={`× ${o.items[b.id]}`} />)}
        <Row k="Pago al recibir" v={<span className="capitalize">{o.payment}</span>} />
        <div className="flex items-baseline justify-between border-t pt-3"><dt className="font-bold">Total estimado</dt><dd className="font-display text-2xl text-primary">{formatPesos(orderTotal(o.baskets, o.items))}</dd></div>
      </dl>
      <p className="mt-3 text-sm text-muted-foreground">Te la devolvemos en unas 24 horas, lavada, perfumada y doblada.</p>

      <div className="mt-8 grid gap-3">
        <Button size="lg" className="h-14 rounded-xl text-lg" onClick={() => downloadIcs(o)}><CalendarPlus /> Agregar al calendario</Button>
        <Button size="lg" variant="outline" className="h-14 rounded-xl text-lg" asChild>
          <a href={`https://wa.me/?text=${encodeURIComponent(shareText(o))}`} target="_blank" rel="noreferrer"><MessageCircle /> Compartir por WhatsApp</a>
        </Button>
        <Link to="/" className="mt-2 text-center text-muted-foreground underline-offset-4 hover:underline">Volver al inicio</Link>
      </div>
    </Shell>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return <div className="flex justify-between gap-4"><dt className="text-muted-foreground">{k}</dt><dd className="text-right font-semibold">{v}</dd></div>;
}
