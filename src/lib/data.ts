// Datos de ejemplo del lavadero (zonas, franjas, topes y precios).
export type Slot = { id: string; start: number; end: number; cap: number };
export type Zone = { id: string; name: string; slots: Slot[] };

export const ZONES: Zone[] = [
  { id: "centro-cordon", name: "Centro y Cordón", slots: [
    { id: "11-13", start: 11, end: 13, cap: 8 },
    { id: "13-15", start: 13, end: 15, cap: 8 },
  ] },
  { id: "pocitos-punta-carretas", name: "Pocitos y Punta Carretas", slots: [
    { id: "15-17", start: 15, end: 17, cap: 10 },
    { id: "17-19", start: 17, end: 19, cap: 8 },
  ] },
  { id: "malvin-buceo", name: "Malvín y Buceo", slots: [
    { id: "17-19", start: 17, end: 19, cap: 8 },
    { id: "19-21", start: 19, end: 21, cap: 6 },
  ] },
  { id: "prado-aguada", name: "Prado y Aguada", slots: [
    { id: "11-13", start: 11, end: 13, cap: 6 },
    { id: "19-21", start: 19, end: 21, cap: 6 },
  ] },
];

export const BASKET_PRICE = 260;
export const BASKET_PROMO_PRICE = 210;
export const PROMO_FROM = 3;
export const MAX_BASKETS = 4;

export type BedItem = { id: string; name: string; size: string; price: number };
export const BED_ITEMS: BedItem[] = [
  { id: "guata-1", name: "Acolchado de guata", size: "1 plaza", price: 360 },
  { id: "guata-2", name: "Acolchado de guata", size: "2 plazas", price: 460 },
  { id: "pluma-1", name: "Acolchado de pluma", size: "1 plaza", price: 460 },
  { id: "pluma-2", name: "Acolchado de pluma", size: "2 plazas", price: 560 },
  { id: "frazada-1", name: "Frazada", size: "1 plaza", price: 310 },
  { id: "frazada-2", name: "Frazada", size: "2 plazas", price: 360 },
  { id: "cubrecama-1", name: "Cubrecama", size: "1 plaza", price: 260 },
  { id: "cubrecama-2", name: "Cubrecama", size: "2 plazas", price: 310 },
];

export const findZone = (id: string) => ZONES.find((z) => z.id === id);
export const findSlot = (zoneId: string, slotId: string) =>
  findZone(zoneId)?.slots.find((s) => s.id === slotId);
