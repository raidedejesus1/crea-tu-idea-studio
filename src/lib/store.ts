import { useSyncExternalStore } from "react";
import { bookableDates } from "./dates";
import type { Order, Payment } from "./logic";

const KEY = "canasto:orders:v1";
let cache: Order[] | null = null;
const listeners = new Set<() => void>();

function makeId() {
  return Math.random().toString(36).slice(2, 7).toUpperCase();
}

/** 12 pedidos de ejemplo, inventados. Prado y Aguada 11–13 del primer día queda completa (6/6). */
export function makeSeed(now = new Date()): Order[] {
  const [d1, d2, d3] = bookableDates(3, now) as [string, string, string];
  const base = (o: Partial<Order> & Pick<Order, "name" | "zoneId" | "slotId" | "date" | "baskets">): Order => ({
    id: makeId(), phone: "09" + Math.floor(1000000 + Math.random() * 8999999), address: "Calle de ejemplo 1234",
    notes: "", items: {}, payment: "efectivo" as Payment, status: "activo", createdAt: now.toISOString(), ...o,
  });
  return [
    base({ name: "Martina Sosa", zoneId: "prado-aguada", slotId: "11-13", date: d1, baskets: 4, address: "Av. Agraciada 3120" }),
    base({ name: "Gonzalo Pereyra", zoneId: "prado-aguada", slotId: "11-13", date: d1, baskets: 2, address: "Lucas Obes 905", payment: "transferencia" }),
    base({ name: "Florencia Rodríguez", zoneId: "pocitos-punta-carretas", slotId: "17-19", date: d1, baskets: 3, items: { "guata-2": 1 }, address: "Benito Blanco 870" }),
    base({ name: "Diego Fernández", zoneId: "pocitos-punta-carretas", slotId: "17-19", date: d1, baskets: 2, address: "21 de Setiembre 2945" }),
    base({ name: "Valentina Núñez", zoneId: "centro-cordon", slotId: "11-13", date: d1, baskets: 1, address: "Gaboto 1410" }),
    base({ name: "Santiago Méndez", zoneId: "malvin-buceo", slotId: "19-21", date: d1, baskets: 4, payment: "transferencia", address: "Av. Italia 4560" }),
    base({ name: "Camila Silva", zoneId: "centro-cordon", slotId: "13-15", date: d2, baskets: 2, items: { "frazada-1": 2 }, address: "Colonia 1720" }),
    base({ name: "Joaquín Cabrera", zoneId: "pocitos-punta-carretas", slotId: "15-17", date: d2, baskets: 3, address: "Ellauri 512" }),
    base({ name: "Lucía Acosta", zoneId: "malvin-buceo", slotId: "17-19", date: d2, baskets: 1, address: "Orinoco 4890" }),
    base({ name: "Federico Olivera", zoneId: "prado-aguada", slotId: "19-21", date: d2, baskets: 2, payment: "transferencia", address: "Millán 2250" }),
    base({ name: "Agustina Duarte", zoneId: "centro-cordon", slotId: "11-13", date: d3, baskets: 4, items: { "pluma-2": 1 }, address: "Ejido 1185" }),
    base({ name: "Nicolás Techera", zoneId: "malvin-buceo", slotId: "19-21", date: d3, baskets: 1, address: "Rivera 6020" }),
  ];
}

function read(): Order[] {
  if (cache) return cache;
  const raw = localStorage.getItem(KEY);
  if (raw) {
    try { cache = JSON.parse(raw) as Order[]; return cache; } catch { /* reseed */ }
  }
  cache = makeSeed();
  localStorage.setItem(KEY, JSON.stringify(cache));
  return cache;
}

function write(next: Order[]) {
  cache = next;
  localStorage.setItem(KEY, JSON.stringify(next));
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => { if (e.key === KEY) { cache = null; l(); } };
  window.addEventListener("storage", onStorage);
  return () => { listeners.delete(l); window.removeEventListener("storage", onStorage); };
}

/** null mientras no hidrató (SSR). */
export function useOrders(): Order[] | null {
  return useSyncExternalStore(subscribe, read, () => null);
}

export function addOrder(o: Omit<Order, "id" | "status" | "createdAt">): Order {
  const order: Order = { ...o, id: makeId(), status: "activo", createdAt: new Date().toISOString() };
  write([...read(), order]);
  return order;
}

export function cancelOrder(id: string) {
  write(read().map((o) => (o.id === id ? { ...o, status: "cancelado" } : o)));
}

export function getOrders() { return read(); }
