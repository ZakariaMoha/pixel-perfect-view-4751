import { FX } from "./demo-data";

export type Direction = "IN" | "OUT";
export type Currency = "KES" | "CNY" | "USD";
export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED";
export type RecipientType = "Supplier" | "Agent" | "Logistics" | "Other";
export type ImageTag = "M-Pesa" | "Bank" | "WeChat" | "Invoice" | "Other";

export const METHODS = ["M-Pesa", "Bank", "WeChat Pay", "Alipay", "Cash", "Stripe"] as const;
export type Method = (typeof METHODS)[number];

export const TYPES: Record<Direction, readonly string[]> = {
  IN: ["Deposit", "Balance", "Full payment", "Refund", "Other income"],
  OUT: [
    "Supplier payment",
    "Agent commission",
    "Logistics",
    "Warehouse fee",
    "Customs & duty",
    "Refund",
    "Subscription",
    "Other expense",
  ],
};

export type PaymentLine = {
  recipientType: RecipientType;
  recipient: string;
  amount: number;
  currency: Currency;
  note?: string;
  orderCodes?: string[];
};

export type ProofImage = { id: string; name: string; tag: ImageTag; dataUrl?: string };
export type AuditEntry = { at: string; action: string; by: string };

export type Payment = {
  id: string;
  code: string;
  direction: Direction;
  type: string;
  status: PaymentStatus;
  counterparty: string;
  counterpartyType: "Client" | RecipientType;
  amount: number;
  currency: Currency;
  lines?: PaymentLine[];
  orderCode?: string;
  rateSource: "locked" | "live";
  method: Method;
  reference: string;
  date: string;
  expectedDate?: string;
  note?: string;
  images: ProofImage[];
  refundOf?: string;
  audit: AuditEntry[];
};

export type RecurringTemplate = {
  id: string;
  name: string;
  direction: Direction;
  type: string;
  recipient: string;
  amount: number;
  currency: Currency;
  frequency: "weekly" | "monthly" | "quarterly" | "yearly" | "custom";
  dayOfMonth?: number;
  nextDue: string;
  active: boolean;
  notes?: string;
};

/** Live market rate (differs slightly from the locked order rate). */
export const LIVE_FX = { cnyToUsd: 0.1382, usdToKes: 129.1 };

export function rates(source: "locked" | "live") {
  return source === "locked" ? FX : LIVE_FX;
}

export function toUsd(amount: number, currency: Currency, source: "locked" | "live" = "locked") {
  const r = rates(source);
  if (currency === "USD") return amount;
  if (currency === "KES") return amount / r.usdToKes;
  return amount * r.cnyToUsd;
}

export function fromUsd(usdAmount: number, currency: Currency, source: "locked" | "live" = "locked") {
  const r = rates(source);
  if (currency === "USD") return usdAmount;
  if (currency === "KES") return usdAmount * r.usdToKes;
  return usdAmount / r.cnyToUsd;
}

export function money(amount: number, currency: Currency) {
  const n = Math.round(amount).toLocaleString("en-US");
  if (currency === "USD") return `$${amount.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  if (currency === "CNY") return `¥${n}`;
  return `KSh ${n}`;
}

export function paymentUsd(p: Payment) {
  if (p.lines?.length) return p.lines.reduce((s, l) => s + toUsd(l.amount, l.currency, p.rateSource), 0);
  return toUsd(p.amount, p.currency, p.rateSource);
}

const img = (n: number, tag: ImageTag): ProofImage[] =>
  Array.from({ length: n }, (_, i) => ({ id: `${tag}-${i}`, name: `${tag.toLowerCase()}-proof-${i + 1}.jpg`, tag }));

const audit = (date: string, extra: string[] = []): AuditEntry[] => [
  { at: `${date}T09:14:00Z`, action: "Payment recorded", by: "Joan Mwangi" },
  ...extra.map((action, i) => ({ at: `${date}T1${i}:30:00Z`, action, by: "Joan Mwangi" })),
];

type Seed = Omit<Payment, "id" | "code" | "audit" | "images" | "rateSource"> &
  Partial<Pick<Payment, "images" | "rateSource" | "audit">>;

const seeds: Seed[] = [
  // IN — deposits
  { direction: "IN", type: "Deposit", status: "COMPLETED", counterparty: "Amani Electronics", counterpartyType: "Client", amount: 480000, currency: "KES", orderCode: "KE-2026-0847", method: "M-Pesa", reference: "SIQ4K7T2PX", date: "2026-08-04", images: img(1, "M-Pesa") },
  { direction: "IN", type: "Deposit", status: "COMPLETED", counterparty: "Nairobi Home Depot", counterpartyType: "Client", amount: 620000, currency: "KES", orderCode: "KE-2026-0846", method: "M-Pesa", reference: "SIR8B3LM4Q", date: "2026-08-11", images: img(2, "M-Pesa") },
  { direction: "IN", type: "Deposit", status: "COMPLETED", counterparty: "Tuskys Auto Spares", counterpartyType: "Client", amount: 355000, currency: "KES", orderCode: "KE-2026-0845", method: "M-Pesa", reference: "SJA2N9WQ7C", date: "2026-08-19", images: img(1, "M-Pesa") },
  { direction: "IN", type: "Deposit", status: "COMPLETED", counterparty: "Zawadi Beauty", counterpartyType: "Client", amount: 210000, currency: "KES", orderCode: "KE-2026-0844", method: "M-Pesa", reference: "SJF6T1XK3M", date: "2026-08-27", images: img(1, "M-Pesa") },
  { direction: "IN", type: "Deposit", status: "COMPLETED", counterparty: "Kilimani Fashion House", counterpartyType: "Client", amount: 298000, currency: "KES", orderCode: "KE-2026-0843", method: "M-Pesa", reference: "SJK3P8ZD5R", date: "2026-09-06", images: img(1, "M-Pesa") },
  { direction: "IN", type: "Deposit", status: "COMPLETED", counterparty: "Mombasa Hardware Ltd", counterpartyType: "Client", amount: 540000, currency: "KES", orderCode: "KE-2026-0842", method: "M-Pesa", reference: "SJP7C2HV9L", date: "2026-09-14", images: img(2, "M-Pesa") },
  // IN — balances
  { direction: "IN", type: "Balance", status: "COMPLETED", counterparty: "Amani Electronics", counterpartyType: "Client", amount: 720000, currency: "KES", orderCode: "KE-2026-0841", method: "Bank", reference: "EQB-FT26258-44102", date: "2026-09-15", images: img(1, "Bank") },
  { direction: "IN", type: "Balance", status: "COMPLETED", counterparty: "Nairobi Home Depot", counterpartyType: "Client", amount: 410000, currency: "KES", orderCode: "KE-2026-0846", method: "M-Pesa", reference: "SJT4R6YB2N", date: "2026-09-22", images: img(1, "M-Pesa") },
  { direction: "IN", type: "Balance", status: "COMPLETED", counterparty: "Tuskys Auto Spares", counterpartyType: "Client", amount: 390000, currency: "KES", orderCode: "KE-2026-0845", method: "Bank", reference: "KCB-FT26266-90811", date: "2026-09-24", images: img(1, "Bank") },
  // IN — refund & pending
  { direction: "IN", type: "Refund", status: "COMPLETED", counterparty: "Zawadi Beauty", counterpartyType: "Client", amount: -18500, currency: "KES", orderCode: "KE-2026-0844", method: "M-Pesa", reference: "SJW9M3QF6T", date: "2026-09-26", note: "Partial refund for 12 damaged units", refundOf: "p-4", images: img(1, "M-Pesa") },
  { direction: "IN", type: "Balance", status: "PENDING", counterparty: "Kilimani Fashion House", counterpartyType: "Client", amount: 330000, currency: "KES", orderCode: "KE-2026-0843", method: "M-Pesa", reference: "", date: "2026-09-30", expectedDate: "2026-10-01", note: "Client confirmed on WhatsApp — paying tomorrow" },
  // OUT — supplier
  { direction: "OUT", type: "Supplier payment", status: "COMPLETED", counterparty: "Shenzhen AudioTech", counterpartyType: "Supplier", amount: 26500, currency: "CNY", orderCode: "KE-2026-0847", method: "WeChat Pay", reference: "4200001983202608", date: "2026-08-06", images: img(1, "WeChat") },
  { direction: "OUT", type: "Supplier payment", status: "COMPLETED", counterparty: "Guangdong KitchenPro", counterpartyType: "Supplier", amount: 31200, currency: "CNY", orderCode: "KE-2026-0846", method: "WeChat Pay", reference: "4200002047202608", date: "2026-08-14", images: img(2, "WeChat") },
  { direction: "OUT", type: "Supplier payment", status: "COMPLETED", counterparty: "Hebei AutoLine", counterpartyType: "Supplier", amount: 18800, currency: "CNY", orderCode: "KE-2026-0845", method: "WeChat Pay", reference: "4200002119202608", date: "2026-08-22", images: img(1, "WeChat") },
  { direction: "OUT", type: "Supplier payment", status: "FAILED", counterparty: "Xuchang HairCo", counterpartyType: "Supplier", amount: 12400, currency: "CNY", orderCode: "KE-2026-0844", method: "WeChat Pay", reference: "4200002230202609", date: "2026-09-02", note: "Daily WeChat limit exceeded — retry split in two", images: [] },
  // OUT — multi-line
  {
    direction: "OUT", type: "Supplier payment", status: "COMPLETED", counterparty: "Shenzhen AudioTech + Li Wei", counterpartyType: "Supplier", amount: 22000, currency: "CNY", orderCode: "KE-2026-0841", method: "WeChat Pay", reference: "4200002354202609", date: "2026-09-09", images: img(2, "WeChat"),
    lines: [
      { recipientType: "Supplier", recipient: "Shenzhen AudioTech", amount: 20000, currency: "CNY", note: "Balance for 800 speakers" },
      { recipientType: "Agent", recipient: "Li Wei", amount: 2000, currency: "CNY", note: "Sourcing fee" },
    ],
  },
  // OUT — logistics
  { direction: "OUT", type: "Logistics", status: "COMPLETED", counterparty: "Sino-Africa Freight", counterpartyType: "Logistics", amount: 3850, currency: "USD", orderCode: "KE-2026-0847", method: "Bank", reference: "SWIFT-HSBC-2609-7731", date: "2026-09-12", images: img(1, "Invoice") },
  { direction: "OUT", type: "Logistics", status: "COMPLETED", counterparty: "Eagle Air Cargo", counterpartyType: "Logistics", amount: 1420, currency: "USD", orderCode: "KE-2026-0844", method: "Bank", reference: "SWIFT-SCB-2609-2210", date: "2026-09-18", images: img(1, "Bank") },
  { direction: "OUT", type: "Warehouse fee", status: "COMPLETED", counterparty: "Yiwu Consolidation Warehouse", counterpartyType: "Other", amount: 3500, currency: "CNY", method: "WeChat Pay", reference: "4200002488202609", date: "2026-09-01", rateSource: "live", images: img(1, "WeChat") },
  // Agent bulk payouts
  {
    direction: "OUT", type: "Agent commission", status: "COMPLETED", counterparty: "Li Wei", counterpartyType: "Agent", amount: 3500, currency: "CNY", method: "WeChat Pay", reference: "4200002591202609", date: "2026-09-20", note: "Bulk payout — 18 orders", images: img(1, "WeChat"),
    lines: [{ recipientType: "Agent", recipient: "Li Wei", amount: 3500, currency: "CNY", note: "18 orders" }],
  },
  {
    direction: "OUT", type: "Agent commission", status: "COMPLETED", counterparty: "Wang Fei", counterpartyType: "Agent", amount: 2800, currency: "CNY", method: "Alipay", reference: "2026092822001483", date: "2026-09-28", note: "Bulk payout — 12 orders", images: img(1, "Other"),
    lines: [{ recipientType: "Agent", recipient: "Wang Fei", amount: 2800, currency: "CNY", note: "12 orders" }],
  },
];

export const payments: Payment[] = seeds.map((s, i) => ({
  ...s,
  id: `p-${i + 1}`,
  code: `PAY-2026-${String(101 + i).padStart(4, "0")}`,
  rateSource: s.rateSource ?? (s.orderCode ? "locked" : "live"),
  images: s.images ?? [],
  audit: s.audit ?? audit(s.date, s.status === "PENDING" ? [] : ["Proof attached", "Marked as " + (s.status === "FAILED" ? "failed" : s.direction === "IN" ? "received" : "sent")]),
}));

export const recurringTemplates: RecurringTemplate[] = [
  { id: "r-1", name: "Warehouse rent — Yiwu", direction: "OUT", type: "Warehouse fee", recipient: "Yiwu Consolidation Warehouse", amount: 3500, currency: "CNY", frequency: "monthly", dayOfMonth: 1, nextDue: "2026-10-01", active: true },
  { id: "r-2", name: "Software subscription", direction: "OUT", type: "Subscription", recipient: "TradeHub Cloud", amount: 49, currency: "USD", frequency: "monthly", dayOfMonth: 5, nextDue: "2026-10-05", active: true },
];

/** Agent fees still owed, per order (demo). */
export const pendingAgentFees = [
  { id: "f-1", agent: "Li Wei", orderCode: "KE-2026-0847", date: "2026-09-18", amount: 1200 },
  { id: "f-2", agent: "Li Wei", orderCode: "KE-2026-0846", date: "2026-09-21", amount: 950 },
  { id: "f-3", agent: "Li Wei", orderCode: "KE-2026-0843", date: "2026-09-25", amount: 780 },
  { id: "f-4", agent: "Zhang Min", orderCode: "KE-2026-0845", date: "2026-09-19", amount: 1100 },
  { id: "f-5", agent: "Zhang Min", orderCode: "KE-2026-0842", date: "2026-09-27", amount: 640 },
  { id: "f-6", agent: "Chen Hao", orderCode: "KE-2026-0844", date: "2026-09-23", amount: 520 },
  { id: "f-7", agent: "Wang Fei", orderCode: "KE-2026-0841", date: "2026-09-29", amount: 870 },
];

/** Outstanding CNY owed per supplier (demo). */
export const supplierOwed: Record<string, number> = {
  "Shenzhen AudioTech": 0,
  "Guangdong KitchenPro": 14800,
  "Hebei AutoLine": 9200,
  "Xuchang HairCo": 12400,
};
