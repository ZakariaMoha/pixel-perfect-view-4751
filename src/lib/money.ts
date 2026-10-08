/**
 * Integer-cent money helpers. All arithmetic happens on integer minor units
 * and is serialized as decimal strings, so no float drift reaches storage.
 */
export type Cents = number;

/** Parse a decimal string ("12.34") into integer cents. */
export function toCents(value: string): Cents {
  const neg = value.startsWith("-");
  const [whole = "0", frac = ""] = value.replace("-", "").split(".");
  const cents = Number(whole) * 100 + Number((frac + "00").slice(0, 2));
  return neg ? -cents : cents;
}

/** Serialize integer cents to a 2dp decimal string. */
export function fromCents(cents: Cents): string {
  const c = Math.round(cents);
  const neg = c < 0;
  const abs = Math.abs(c);
  return `${neg ? "-" : ""}${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, "0")}`;
}

/** Multiply cents by a rate, rounding half-up to whole cents. */
export function mulRate(cents: Cents, rate: number): Cents {
  return Math.round(cents * rate);
}

/** Format a decimal string as KSh with thousands separators. */
export function fmtKes(value: string): string {
  return `KSh ${Math.round(toCents(value) / 100).toLocaleString("en-US")}`;
}
export function fmtUsd(value: string): string {
  return `$${(toCents(value) / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
export function fmtCny(value: string): string {
  return `¥${(toCents(value) / 100).toFixed(2)}`;
}
