import { findSlot, findZone } from "./data";
import type { Order } from "./logic";

const pad = (n: number) => String(n).padStart(2, "0");

export function buildIcs(o: Order) {
  const slot = findSlot(o.zoneId, o.slotId)!;
  const zone = findZone(o.zoneId)!;
  const d = o.date.replace(/-/g, "");
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Canasto//Retiros//ES", "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${o.id}@canasto.uy`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
    `DTSTART:${d}T${pad(slot.start)}0000`,
    `DTEND:${d}T${pad(slot.end)}0000`,
    `SUMMARY:Retiro de ropa – ${o.baskets} canasto${o.baskets > 1 ? "s" : ""}`,
    `LOCATION:${o.address}\\, ${zone.name}\\, Montevideo`,
    `DESCRIPTION:Pedido ${o.id}. Pasamos entre las ${slot.start} y las ${slot.end}.`,
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadIcs(o: Order) {
  const blob = new Blob([buildIcs(o)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `retiro-${o.id}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}
