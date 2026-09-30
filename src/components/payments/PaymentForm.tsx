import { useMemo, useRef, useState } from "react";
import { Camera, ClipboardPaste, ImagePlus, Plus, Trash2, X } from "lucide-react";
import { Button, Card } from "@/components/kit";
import { agents, clients, logisticsPartners, orders, suppliers } from "@/lib/demo-data";
import {
  METHODS,
  TYPES,
  money,
  rates,
  toUsd,
  type Currency,
  type Direction,
  type ImageTag,
  type Method,
  type Payment,
  type PaymentLine,
  type PaymentStatus,
  type ProofImage,
  type RecipientType,
} from "@/lib/payments-data";
import { compressImage, parseReference } from "@/lib/reference-parser";
import { cn } from "@/lib/utils";
import { fieldClass, Label } from "./shared";

const recipientOptions: Record<RecipientType, string[]> = {
  Supplier: suppliers.map((s) => s.name),
  Agent: agents.map((a) => a.name),
  Logistics: logisticsPartners.map((l) => l.name),
  Other: [],
};
const CURRENCIES: Currency[] = ["KES", "CNY", "USD"];
const TAGS: ImageTag[] = ["M-Pesa", "Bank", "WeChat", "Invoice", "Other"];
const activeOrders = orders.filter((o) => o.status !== "DELIVERED");

export type PaymentDraft = Omit<Payment, "id" | "code" | "audit">;

type Props = {
  initial?: Partial<PaymentDraft>;
  onSave: (draft: PaymentDraft) => void;
  onCancel: () => void;
  submitLabel?: string;
};

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <Card className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 font-mono text-xs font-bold text-primary">
          {n}
        </span>
        <h2 className="text-base font-semibold">{title}</h2>
      </div>
      {children}
    </Card>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("block space-y-1.5", className)}>
      <Label>{label}</Label>
      {children}
    </label>
  );
}

function Toggle<T extends string>({
  value,
  options,
  onChange,
  big,
}: {
  value: T;
  options: { value: T; label: string; tone?: string }[];
  onChange: (v: T) => void;
  big?: boolean;
}) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-md border font-semibold transition-colors",
            big ? "min-h-16 text-xl font-mono" : "min-h-11 text-sm",
            value === o.value
              ? (o.tone ?? "border-primary bg-primary/15 text-primary")
              : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function PaymentForm({ initial, onSave, onCancel, submitLabel = "Save payment" }: Props) {
  const [direction, setDirection] = useState<Direction>(initial?.direction ?? "IN");
  const [type, setType] = useState(initial?.type ?? TYPES[initial?.direction ?? "IN"][0]!);
  const [status, setStatus] = useState<PaymentStatus>(initial?.status ?? "COMPLETED");
  const [client, setClient] = useState(
    initial?.counterpartyType === "Client" ? (initial.counterparty ?? "") : "",
  );
  const [lines, setLines] = useState<PaymentLine[]>(
    initial?.lines?.length
      ? initial.lines
      : initial?.direction === "OUT" && initial.counterparty
        ? [{ recipientType: (initial.counterpartyType as RecipientType) ?? "Other", recipient: initial.counterparty, amount: initial.amount ?? 0, currency: initial.currency ?? "CNY" }]
        : [{ recipientType: "Supplier", recipient: "", amount: 0, currency: "CNY" }],
  );
  const [orderCode, setOrderCode] = useState(initial?.orderCode ?? "");
  const [amount, setAmount] = useState(initial?.direction === "IN" ? String(initial.amount ?? "") : "");
  const [currency, setCurrency] = useState<Currency>(initial?.currency ?? "KES");
  const [method, setMethod] = useState<Method>(initial?.method ?? "M-Pesa");
  const [reference, setReference] = useState(initial?.reference ?? "");
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().slice(0, 10));
  const [expectedDate, setExpectedDate] = useState(initial?.expectedDate ?? "");
  const [note, setNote] = useState(initial?.note ?? "");
  const [images, setImages] = useState<ProofImage[]>(initial?.images ?? []);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [parseMsg, setParseMsg] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const shotRef = useRef<HTMLInputElement>(null);

  const rateSource = orderCode ? "locked" : "live";
  const r = rates(rateSource);
  const isMulti = direction === "OUT" && lines.length > 1;

  const totalUsd = useMemo(() => {
    if (direction === "IN") return toUsd(Number(amount) || 0, currency, rateSource);
    return lines.reduce((s, l) => s + toUsd(l.amount || 0, l.currency, rateSource), 0);
  }, [direction, amount, currency, lines, rateSource]);

  const primaryCurrency: Currency = direction === "IN" ? currency : (lines[0]?.currency ?? "CNY");
  const primaryAmount =
    direction === "IN"
      ? Number(amount) || 0
      : lines.every((l) => l.currency === primaryCurrency)
        ? lines.reduce((s, l) => s + (l.amount || 0), 0)
        : totalUsd / toUsd(1, primaryCurrency, rateSource);

  const changeDirection = (d: Direction) => {
    setDirection(d);
    setType(TYPES[d][0]!);
    if (d === "IN") {
      setCurrency("KES");
      setMethod("M-Pesa");
    } else setMethod("WeChat Pay");
  };

  const updateLine = (i: number, patch: Partial<PaymentLine>) =>
    setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));

  const applyParsed = (text: string) => {
    const p = parseReference(text);
    const found: string[] = [];
    if (p.reference) {
      setReference(p.reference);
      found.push(`reference ${p.reference}`);
    }
    if (p.method) setMethod(p.method);
    if (p.amount) {
      found.push(`amount ${money(p.amount, p.currency ?? currency)}`);
      if (direction === "IN") {
        setAmount(String(p.amount));
        if (p.currency) setCurrency(p.currency);
      } else if (lines.length === 1) updateLine(0, { amount: p.amount, currency: p.currency ?? lines[0]!.currency });
    }
    if (p.date) {
      setDate(p.date);
      found.push(`date ${p.date}`);
    }
    setParseMsg(found.length ? `Found ${found.join(", ")}. Check and edit below.` : "Nothing recognised — enter details manually.");
  };

  const addFiles = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    const room = 5 - images.length;
    const accepted = list.slice(0, room);
    const defaultTag: ImageTag = method === "M-Pesa" ? "M-Pesa" : method === "Bank" ? "Bank" : method === "WeChat Pay" ? "WeChat" : "Other";
    const next = await Promise.all(
      accepted.map(async (f) => ({ id: crypto.randomUUID(), name: f.name, tag: defaultTag, dataUrl: await compressImage(f) })),
    );
    setImages((imgs) => [...imgs, ...next]);
  };

  const counterparty =
    direction === "IN"
      ? client
      : lines.length > 1
        ? lines.map((l) => l.recipient).filter(Boolean).join(" + ")
        : (lines[0]?.recipient ?? "");

  const validate = () => {
    const e: string[] = [];
    if (direction === "IN" && !client) e.push("Choose the client who paid.");
    if (direction === "IN" && !(Number(amount) !== 0)) e.push("Enter an amount.");
    if (direction === "OUT" && lines.some((l) => !l.recipient)) e.push("Every payment line needs a recipient.");
    if (direction === "OUT" && lines.some((l) => !l.amount)) e.push("Every payment line needs an amount.");
    if (status !== "PENDING" && !reference && method !== "Cash") e.push("Add a transaction reference.");
    if (status === "PENDING" && !expectedDate) e.push("Pick the expected payment date.");
    if (!date) e.push("Pick the payment date.");
    return e;
  };

  const submit = () => {
    const e = validate();
    setErrors(e);
    if (e.length) {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      return;
    }
    onSave({
      direction,
      type,
      status,
      counterparty,
      counterpartyType: direction === "IN" ? "Client" : lines.length > 1 ? "Supplier" : lines[0]!.recipientType,
      amount: Math.round(primaryAmount * 100) / 100,
      currency: primaryCurrency,
      ...(direction === "OUT" ? { lines } : {}),
      ...(orderCode ? { orderCode } : {}),
      rateSource,
      method,
      reference,
      date,
      ...(status === "PENDING" ? { expectedDate } : {}),
      ...(note ? { note } : {}),
      images,
      ...(initial?.refundOf ? { refundOf: initial.refundOf } : {}),
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Step n={1} title="Direction & type">
        <Toggle
          big
          value={direction}
          onChange={changeDirection}
          options={[
            { value: "IN", label: "IN", tone: "border-success bg-success/15 text-success" },
            { value: "OUT", label: "OUT", tone: "border-primary bg-primary/15 text-primary" },
          ]}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Type">
            <select className={fieldClass} value={type} onChange={(e) => setType(e.target.value)}>
              {TYPES[direction].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <Toggle
              value={status === "FAILED" ? "COMPLETED" : status}
              onChange={setStatus}
              options={[
                { value: "PENDING", label: "Pending", tone: "border-warning bg-warning/15 text-warning" },
                { value: "COMPLETED", label: direction === "IN" ? "Received" : "Sent", tone: "border-success bg-success/15 text-success" },
              ]}
            />
          </Field>
        </div>
      </Step>

      <Step n={2} title="Counterparty">
        {direction === "IN" ? (
          <Field label="Client">
            <select className={fieldClass} value={client} onChange={(e) => setClient(e.target.value)}>
              <option value="">Select client…</option>
              {clients.map((c) => (
                <option key={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>
        ) : (
          <div className="space-y-3">
            <Label>Payment lines</Label>
            {lines.map((line, i) => (
              <div key={i} className="grid gap-2 rounded-lg border border-border bg-secondary/30 p-3 md:grid-cols-12">
                <select
                  className={cn(fieldClass, "md:col-span-3")}
                  value={line.recipientType}
                  onChange={(e) => updateLine(i, { recipientType: e.target.value as RecipientType, recipient: "" })}
                  aria-label="Recipient type"
                >
                  {(["Supplier", "Agent", "Logistics", "Other"] as const).map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
                {line.recipientType === "Other" ? (
                  <input
                    className={cn(fieldClass, "md:col-span-4")}
                    placeholder="Recipient name"
                    value={line.recipient}
                    onChange={(e) => updateLine(i, { recipient: e.target.value })}
                  />
                ) : (
                  <select
                    className={cn(fieldClass, "md:col-span-4")}
                    value={line.recipient}
                    onChange={(e) => updateLine(i, { recipient: e.target.value })}
                    aria-label="Recipient"
                  >
                    <option value="">Select…</option>
                    {recipientOptions[line.recipientType].map((n) => (
                      <option key={n}>{n}</option>
                    ))}
                  </select>
                )}
                <input
                  className={cn(fieldClass, "font-mono md:col-span-3")}
                  type="number"
                  inputMode="decimal"
                  placeholder="Amount"
                  value={line.amount || ""}
                  onChange={(e) => updateLine(i, { amount: Number(e.target.value) })}
                />
                <select
                  className={cn(fieldClass, "md:col-span-2")}
                  value={line.currency}
                  onChange={(e) => updateLine(i, { currency: e.target.value as Currency })}
                  aria-label="Currency"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <div className="flex gap-2 md:col-span-12">
                  <input
                    className={fieldClass}
                    placeholder="Note (optional)"
                    value={line.note ?? ""}
                    onChange={(e) => updateLine(i, { note: e.target.value })}
                  />
                  {lines.length > 1 ? (
                    <button
                      type="button"
                      aria-label="Remove line"
                      onClick={() => setLines((ls) => ls.filter((_, idx) => idx !== i))}
                      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-danger hover:bg-danger/10"
                    >
                      <Trash2 size={16} />
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="glass"
              onClick={() => setLines((ls) => [...ls, { recipientType: "Agent", recipient: "", amount: 0, currency: "CNY" }])}
            >
              <Plus size={16} /> Add line
            </Button>
          </div>
        )}
        <Field label="Link to order (optional)">
          <select className={fieldClass} value={orderCode} onChange={(e) => setOrderCode(e.target.value)}>
            <option value="">No order — standalone</option>
            {activeOrders.map((o) => (
              <option key={o.id} value={o.code}>
                {o.code} · {o.client}
              </option>
            ))}
          </select>
        </Field>
      </Step>

      <Step n={3} title="Amount & currency">
        {direction === "IN" || !isMulti ? (
          direction === "IN" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Amount">
                <input
                  className={cn(fieldClass, "font-mono text-lg")}
                  type="number"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                />
              </Field>
              <Field label="Currency">
                <Toggle value={currency} onChange={setCurrency} options={CURRENCIES.map((c) => ({ value: c, label: c }))} />
              </Field>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Amount is taken from the payment line above.</p>
          )
        ) : (
          <div className="divide-y divide-border rounded-lg border border-border">
            {lines.map((l, i) => (
              <div key={i} className="flex justify-between px-4 py-2.5 text-sm">
                <span className="text-muted-foreground">{l.recipient || `Line ${i + 1}`}</span>
                <span className="font-mono">{money(l.amount || 0, l.currency)}</span>
              </div>
            ))}
            <div className="flex justify-between px-4 py-3 font-bold">
              <span>Total</span>
              <span className="glow-text font-mono text-accent">{money(primaryAmount, primaryCurrency)}</span>
            </div>
          </div>
        )}
        <div
          className={cn(
            "rounded-lg border p-4 font-mono text-sm",
            rateSource === "locked" ? "border-success/40 bg-success/5" : "border-warning/40 bg-warning/5",
          )}
        >
          <div className="grid grid-cols-[90px_1fr] gap-y-1.5">
            <span className="text-subtle">Original</span>
            <span>{money(primaryAmount, primaryCurrency)}</span>
            <span className="text-subtle">USD</span>
            <span className="text-accent">${totalUsd.toFixed(2)}</span>
            <span className="text-subtle">CNY</span>
            <span>¥{(totalUsd / r.cnyToUsd).toFixed(2)}</span>
            <span className="text-subtle">Rate</span>
            <span className="break-words">
              1 USD = {primaryCurrency === "KES" ? r.usdToKes : primaryCurrency === "CNY" ? (1 / r.cnyToUsd).toFixed(3) : 1} {primaryCurrency} = {(1 / r.cnyToUsd).toFixed(3)} CNY
            </span>
            <span className="text-subtle">Source</span>
            <span className={rateSource === "locked" ? "text-success" : "text-warning"}>
              {rateSource === "locked" ? `Locked from ${orderCode}` : "Live rate"}
            </span>
          </div>
        </div>
      </Step>

      <Step n={4} title="Payment details">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Method">
            <select className={fieldClass} value={method} onChange={(e) => setMethod(e.target.value as Method)}>
              {METHODS.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </Field>
          <Field label="Reference">
            <input
              className={cn(fieldClass, "font-mono")}
              value={reference}
              placeholder={method === "M-Pesa" ? "e.g. SJK3P8ZD5R" : "Transaction ID"}
              onChange={(e) => setReference(e.target.value)}
              onPaste={(e) => {
                const text = e.clipboardData.getData("text");
                if (text.length > 20) {
                  e.preventDefault();
                  applyParsed(text);
                }
              }}
            />
          </Field>
          <Field label="Payment date">
            <input className={fieldClass} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          {status === "PENDING" ? (
            <Field label="Expected date">
              <input className={fieldClass} type="date" value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)} />
            </Field>
          ) : null}
          <Field label="Note" className="md:col-span-2">
            <textarea
              className={cn(fieldClass, "min-h-24 py-2.5")}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </Field>
        </div>
      </Step>

      <Step n={5} title="Reference helper">
        <div className="grid gap-2 sm:grid-cols-2">
          <Button type="button" variant="glass" onClick={() => setPasteOpen((o) => !o)}>
            <ClipboardPaste size={16} /> Paste WhatsApp message
          </Button>
          <Button type="button" variant="glass" onClick={() => shotRef.current?.click()} disabled={images.length >= 5}>
            <Camera size={16} /> Upload screenshot
          </Button>
          <input
            ref={shotRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              if (e.target.files) void addFiles(e.target.files);
              setParseMsg("Screenshot saved as proof. Automatic reading of screenshots is coming later — type the reference above.");
              e.target.value = "";
            }}
          />
        </div>
        {pasteOpen ? (
          <div className="space-y-2">
            <textarea
              className={cn(fieldClass, "min-h-28 py-2.5 font-mono text-xs")}
              placeholder="SJK3P8ZD5R Confirmed. Ksh298,000.00 received from KILIMANI FASHION on 6/9/26 at 10:42 AM…"
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
            />
            <Button type="button" variant="accent" onClick={() => applyParsed(pasteText)}>
              Extract details
            </Button>
          </div>
        ) : null}
        {parseMsg ? <p className="rounded-md bg-accent/10 px-3 py-2 text-sm text-accent">{parseMsg}</p> : null}
      </Step>

      <Step n={6} title={`Proof images (${images.length}/5)`}>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            void addFiles(e.dataTransfer.files);
          }}
          disabled={images.length >= 5}
          className={cn(
            "flex min-h-28 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed text-sm text-muted-foreground transition-colors disabled:opacity-50",
            dragging ? "border-accent bg-accent/10" : "border-border hover:border-accent",
          )}
        >
          <ImagePlus size={22} />
          {images.length >= 5 ? "Maximum of 5 images reached" : "Drop images here or tap to upload"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files) void addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        {images.length ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {images.map((im) => (
              <div key={im.id} className="overflow-hidden rounded-lg border border-border bg-secondary/40">
                <div className="relative aspect-[4/3] bg-secondary">
                  {im.dataUrl ? (
                    <img src={im.dataUrl} alt={im.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-subtle">{im.name}</div>
                  )}
                  <button
                    type="button"
                    aria-label="Remove image"
                    onClick={() => setImages((imgs) => imgs.filter((x) => x.id !== im.id))}
                    className="absolute right-1 top-1 inline-flex min-h-11 min-w-11 items-center justify-center rounded-md bg-background/80 text-foreground"
                  >
                    <X size={16} />
                  </button>
                </div>
                <select
                  className="min-h-11 w-full border-t border-border bg-transparent px-2 text-xs"
                  value={im.tag}
                  onChange={(e) =>
                    setImages((imgs) => imgs.map((x) => (x.id === im.id ? { ...x, tag: e.target.value as ImageTag } : x)))
                  }
                  aria-label="Image type"
                >
                  {TAGS.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        ) : null}
      </Step>

      <Step n={7} title="Review & save">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm md:grid-cols-3">
          {[
            ["Direction", direction],
            ["Type", type],
            ["Status", status === "PENDING" ? "Pending" : direction === "IN" ? "Received" : "Sent"],
            ["Counterparty", counterparty || "—"],
            ["Amount", money(primaryAmount, primaryCurrency)],
            ["USD value", `$${totalUsd.toFixed(2)}`],
            ["Method", method],
            ["Reference", reference || "—"],
            ["Order", orderCode || "—"],
          ].map(([k, v]) => (
            <div key={k}>
              <Label>{k}</Label>
              <dd className="mt-1 break-words font-medium">{v}</dd>
            </div>
          ))}
        </dl>
        {errors.length ? (
          <ul className="space-y-1 rounded-md border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
            {errors.map((e) => (
              <li key={e}>• {e}</li>
            ))}
          </ul>
        ) : null}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={submit}>
            {submitLabel}
          </Button>
        </div>
      </Step>
    </div>
  );
}
