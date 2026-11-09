import { describe, expect, it } from "vitest";
import { bookableDates } from "@/lib/dates";
import { remainingBaskets } from "@/lib/logic";
import { addOrder, getOrders, resetOrders } from "@/lib/store";

const firstDay = bookableDates(1)[0] ?? "";

const demoOrder = () => ({
  name: "Vecina de prueba", phone: "099123456", address: "Calle de prueba 100", notes: "",
  items: {}, payment: "efectivo" as const, zoneId: "centro-cordon", slotId: "11-13",
  date: firstDay, baskets: 1,
});

describe("restaurar datos de ejemplo", () => {
  it("vuelve a los 12 pedidos de muestra después de agendar", () => {
    resetOrders();
    expect(getOrders()).toHaveLength(12);
    addOrder(demoOrder());
    expect(getOrders()).toHaveLength(13);
    resetOrders();
    expect(getOrders()).toHaveLength(12);
  });

  it("deja completa la franja Prado y Aguada 11–13 del primer día", () => {
    resetOrders();
    const orders = getOrders();
    expect(remainingBaskets(orders, "prado-aguada", "11-13", firstDay)).toBe(0);
    expect(remainingBaskets(orders, "prado-aguada", "19-21", firstDay)).toBe(6);
  });

  it("guarda el reinicio en localStorage", () => {
    resetOrders();
    const raw = localStorage.getItem("canasto:orders:v1");
    expect(raw && JSON.parse(raw)).toHaveLength(12);
  });
});
