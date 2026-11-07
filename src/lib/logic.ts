import { BASKET_PRICE, BASKET_PROMO_PRICE, BED_ITEMS, PROMO_FROM, findSlot } from "./data";

export type Payment = "efectivo" | "transferencia";
export type Order = {
  id: string;
  name: string;
  phone: string;
  address: string;
  notes: string;
  zoneId: string;
  slotId: string;
  date: string; // YYYY-MM-DD
  baskets: number;
  items: Record<string, number>;
  payment: Payment;
  status: "activo" | "cancelado";
  createdAt: string;
};

export function basketUnitPrice(baskets: number) {
  return baskets >= PROMO_FROM ? BASKET_PROMO_PRICE : BASKET_PRICE;
}

export function orderTotal(baskets: number, items: Record<string, number>) {
  const bed = BED_ITEMS.reduce((sum, it) => sum + it.price * (items[it.id] ?? 0), 0);
  return baskets * basketUnitPrice(baskets) + bed;
}

export function usedBaskets(orders: Order[], zoneId: string, slotId: string, date: string) {
  return orders
    .filter((o) => o.status === "activo" && o.zoneId === zoneId && o.slotId === slotId && o.date === date)
    .reduce((s, o) => s + o.baskets, 0);
}

export function remainingBaskets(orders: Order[], zoneId: string, slotId: string, date: string) {
  const slot = findSlot(zoneId, slotId);
  if (!slot) return 0;
  return Math.max(0, slot.cap - usedBaskets(orders, zoneId, slotId, date));
}

/** Devuelve un mensaje si el pedido no entra, o null si está OK. */
export function quotaError(orders: Order[], zoneId: string, slotId: string, date: string, baskets: number) {
  const left = remainingBaskets(orders, zoneId, slotId, date);
  if (left === 0) return "Esta franja está completa.";
  if (baskets > left) return `Solo ${left === 1 ? "queda 1 canasto" : `quedan ${left} canastos`} en esta franja.`;
  return null;
}

export const formatPesos = (n: number) => `$${n.toLocaleString("es-UY")}`;
