import { describe, expect, it } from "vitest";
import { orderTotal, quotaError, remainingBaskets, type Order } from "@/lib/logic";
import { bookableDates } from "@/lib/dates";

const o = (p: Partial<Order>): Order => ({
  id: "X", name: "", phone: "", address: "", notes: "", zoneId: "centro-cordon", slotId: "11-13",
  date: "2030-01-07", baskets: 1, items: {}, payment: "efectivo", status: "activo", createdAt: "", ...p,
});

describe("cupo por canasto", () => {
  it("3 canastos en franja de 8 deja 5", () => {
    expect(remainingBaskets([o({ baskets: 3 })], "centro-cordon", "11-13", "2030-01-07")).toBe(5);
  });
  it("con 2 libres frena un pedido de 3", () => {
    const orders = [o({ baskets: 4 }), o({ baskets: 2 })];
    expect(quotaError(orders, "centro-cordon", "11-13", "2030-01-07", 3)).toMatch(/quedan 2/);
    expect(quotaError(orders, "centro-cordon", "11-13", "2030-01-07", 2)).toBeNull();
  });
  it("otra fecha tiene cupo completo", () => {
    expect(remainingBaskets([o({ baskets: 8 })], "centro-cordon", "11-13", "2030-01-08")).toBe(8);
  });
  it("cancelado devuelve canastos", () => {
    expect(remainingBaskets([o({ baskets: 3, status: "cancelado" })], "centro-cordon", "11-13", "2030-01-07")).toBe(8);
  });
});

describe("precio", () => {
  it("2 canastos a $260", () => expect(orderTotal(2, {})).toBe(520));
  it("3 canastos a $210", () => expect(orderTotal(3, {})).toBe(630));
  it("suma acolchado de guata 2 plazas", () => expect(orderTotal(2, { "guata-2": 1 })).toBe(980));
});

describe("fechas", () => {
  it("arranca mañana y salta domingos", () => {
    // sábado 7 nov 2026
    const d = bookableDates(2, new Date(2026, 10, 7, 21));
    expect(d).toEqual(["2026-11-09", "2026-11-10"]);
  });
});
