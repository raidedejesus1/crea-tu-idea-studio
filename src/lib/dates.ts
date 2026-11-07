const pad = (n: number) => String(n).padStart(2, "0");

export function toISO(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fromISO(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Días hábiles (lunes a sábado) desde mañana. Nunca el mismo día. */
export function bookableDates(count = 12, now = new Date()) {
  const out: string[] = [];
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  while (out.length < count) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0) out.push(toISO(d));
  }
  return out;
}

export function isBookable(iso: string, now = new Date()) {
  return bookableDates(60, now).includes(iso);
}

export function weekdayLong(iso: string) {
  return fromISO(iso).toLocaleDateString("es-AR", { weekday: "long" });
}

export function dateLong(iso: string) {
  return fromISO(iso).toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
}

export function dateShort(iso: string) {
  const d = fromISO(iso);
  return {
    wd: d.toLocaleDateString("es-AR", { weekday: "short" }).replace(".", ""),
    day: d.getDate(),
    month: d.toLocaleDateString("es-AR", { month: "short" }).replace(".", ""),
  };
}
