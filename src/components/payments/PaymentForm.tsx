import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, Clipboard, ImagePlus, Plus, Trash2, Upload } from "lucide-react";
import { Button, Card, PageHeader, SectionTitle } from "@/components/kit";
import { Input } from "@/components/ui/input";
import {
  FX,
  clients,
  orders,
  payments,
  suppliers,
  agents,
  type Payment,
  type PaymentCurrency,
  type PaymentLine,
  type PaymentRecipientType,
} from "@/lib/demo-data";
import { parsePaymentReference } from "@/lib/payment-reference";

type PaymentFormProps = { initial?: Payment; onSave: (payment: Payment) => void };
type ProofImage = { url: string; type: string };

const inputClass =
  "min-h-11 rounded-md border border-border-strong bg-bg-elev-1 px-3 text-sm text-fg placeholder:text-fg-faint";
const labelClass =
  "block space-y-1.5 text-[11px] font-semibold uppercase tracking-wider text-fg-subtle";
const paymentTypes = {
  IN: ["Deposit", "Balance", "Refund", "Other"],
  OUT: ["Supplier payment", "Agent commission", "Logistics", "Warehouse fee", "Other"],
};
const currencies: PaymentCurrency[] = ["KES", "CNY", "USD"];
const recipientOptions: Record<PaymentRecipientType, string[]> = {
  Supplier: suppliers.map((supplier) => supplier.name),
  Agent: agents.map((agent) => agent.name),
  Logistics: ["East Africa Cargo", "Mombasa Freight Link"],
  Other: ["Yiwu Central Warehouse", "Other recipient"],
};

function compactImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Unable to read image"));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("Unable to preview image"));
      image.onload = () => {
        const scale = Math.min(1, 1200 / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        const context = canvas.getContext("2d");
        if (!context) return reject(new Error("Image compression is unavailable"));
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.78));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export function PaymentForm({ initial, onSave }: PaymentFormProps) {
  const [direction, setDirection] = useState<Payment["direction"]>(initial?.direction ?? "IN");
  const [status, setStatus] = useState<Payment["status"]>(initial?.status ?? "received");
  const [type, setType] = useState(initial?.type ?? "Deposit");
  const [counterparty, setCounterparty] = useState(initial?.counterparty ?? clients[0]?.name ?? "");
  const [amount, setAmount] = useState(String(initial?.amount ?? ""));
  const [currency, setCurrency] = useState<PaymentCurrency>(initial?.currency ?? "KES");
  const [method, setMethod] = useState(initial?.method ?? "M-Pesa");
  const [reference, setReference] = useState(initial?.reference ?? "");
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().slice(0, 10));
  const [expectedDate, setExpectedDate] = useState(initial?.expectedDate ?? "");
  const [orderCode, setOrderCode] = useState(initial?.orderCode ?? "");
  const [relatedPaymentId, setRelatedPaymentId] = useState(initial?.relatedPaymentId ?? "");
  const [note, setNote] = useState(initial?.note ?? "");
  const [lines, setLines] = useState<PaymentLine[]>(
    initial?.lines ?? [
      {
        recipientType: "Supplier",
        recipient: suppliers[0]?.name ?? "",
        amount: 0,
        currency: "CNY",
        note: "",
      },
    ],
  );
  const [pasteText, setPasteText] = useState("");
  const [proofs, setProofs] = useState<ProofImage[]>(
    initial?.images
      .filter((image) => image.startsWith("data:image"))
      .map((url, index) => ({ url, type: initial.imageTypes?.[index] ?? "Other" })) ?? [],
  );
  const [error, setError] = useState("");

  const isMultiLine = direction === "OUT";
  const activeLines = lines.filter((line) => Number(line.amount) > 0);
  const lineCurrencies = [...new Set(activeLines.map((line) => line.currency))];
  const paymentCurrency = isMultiLine
    ? lineCurrencies.length === 1
      ? (lineCurrencies[0] ?? "CNY")
      : "USD"
    : currency;
  const toUsd = (value: number, unit: PaymentCurrency) =>
    unit === "KES" ? value / FX.usdToKes : unit === "CNY" ? value * FX.cnyToUsd : value;
  const total = isMultiLine
    ? lineCurrencies.length <= 1
      ? activeLines.reduce((sum, line) => sum + line.amount, 0)
      : activeLines.reduce((sum, line) => sum + toUsd(line.amount, line.currency), 0)
    : Number(amount) || 0;
  const totalUsd = isMultiLine
    ? activeLines.reduce((sum, line) => sum + toUsd(line.amount, line.currency), 0)
    : toUsd(total, currency);
  const cny = totalUsd / FX.cnyToUsd;
  const currentType = paymentTypes[direction].includes(type)
    ? type
    : (paymentTypes[direction][0] ?? "Other");

  useEffect(() => {
    if (initial) return;
    const params = new URLSearchParams(window.location.search);
    const requestedDirection = params.get("direction");
    const recipient = params.get("recipient");
    const agentName = params.get("bulk");
    const selectedOrderIds = (params.get("orders") ?? "").split(",").filter(Boolean);
    if (requestedDirection === "OUT" || recipient || agentName) {
      setDirection("OUT");
      setCurrency("CNY");
      setStatus("sent");
      setType(agentName ? "Agent commission" : "Supplier payment");
    }
    if (agentName && selectedOrderIds.length) {
      const selectedOrders = orders.filter(
        (order) => selectedOrderIds.includes(order.id) && order.agent === agentName,
      );
      if (selectedOrders.length) {
        setLines(
          selectedOrders.map((order) => ({
            recipientType: "Agent",
            recipient: agentName,
            amount: Math.round((order.valueUsd * 0.045) / FX.cnyToUsd),
            currency: "CNY",
            note: `Commission · ${order.code}`,
          })),
        );
        setNote(`Commission payout for ${selectedOrders.length} selected orders.`);
      }
    } else if (recipient) {
      const recipientType: PaymentRecipientType = agents.some((agent) => agent.name === recipient)
        ? "Agent"
        : suppliers.some((supplier) => supplier.name === recipient)
          ? "Supplier"
          : "Other";
      setLines([{ recipientType, recipient, amount: 0, currency: "CNY", note: "" }]);
    }
  }, [initial]);

  const changeDirection = (next: Payment["direction"]) => {
    setDirection(next);
    setType(paymentTypes[next][0] ?? "Other");
    setStatus(next === "IN" ? "received" : "sent");
    setCurrency(next === "IN" ? "KES" : "CNY");
  };

  const addProofs = async (files: FileList | null) => {
    if (!files) return;
    const room = 5 - proofs.length;
    if (room <= 0) return setError("A payment can have up to 5 proof images.");
    try {
      const added = await Promise.all(
        Array.from(files)
          .slice(0, room)
          .map(async (file) => ({ url: await compactImage(file), type: "Other" })),
      );
      setProofs((current) => [...current, ...added].slice(0, 5));
      setError("");
    } catch {
      setError("One or more images could not be processed.");
    }
  };

  const parsePaste = () => {
    const parsed = parsePaymentReference(pasteText);
    if (parsed.reference) setReference(parsed.reference);
    if (parsed.amount !== undefined) setAmount(String(parsed.amount));
    if (parsed.date) setDate(parsed.date);
    if (!parsed.reference && parsed.amount === undefined && !parsed.date)
      setError("No reference, amount, or date found. You can enter these manually.");
    else setError("");
  };

  const save = () => {
    if (!total || total < 0 || !date || (direction === "IN" && !counterparty)) {
      setError("Choose a counterparty, payment date, and amount greater than zero.");
      return;
    }
    if (proofs.length > 5) return setError("A payment can have up to 5 proof images.");
    const nowId = initial?.id ?? `pay-${crypto.randomUUID()}`;
    const usdAmount = totalUsd;
    const code =
      initial?.code ??
      `PM-${new Date().getFullYear()}-${String(payments.length + 1).padStart(4, "0")}`;
    const lineRecipients = isMultiLine ? lines.filter((line) => line.amount > 0) : [];
    const record: Payment = {
      id: nowId,
      code,
      direction,
      status,
      counterparty: isMultiLine
        ? [...new Set(lineRecipients.map((line) => line.recipient))].join(" + ")
        : counterparty,
      type: currentType,
      amount: total,
      currency: paymentCurrency,
      usdAmount,
      method,
      reference,
      date,
      ...(status === "pending" && expectedDate ? { expectedDate } : {}),
      ...(orderCode ? { orderCode } : {}),
      images: [
        ...(initial?.images.filter((image) => !image.startsWith("data:image")) ?? []),
        ...proofs.map((proof) => proof.url),
      ],
      imageTypes: [
        ...(initial?.imageTypes?.slice(
          0,
          initial.images.filter((image) => !image.startsWith("data:image")).length,
        ) ?? []),
        ...proofs.map((proof) => proof.type),
      ],
      ...(lineRecipients.length > 1 ? { lines: lineRecipients } : {}),
      ...(note ? { note } : {}),
      ...(relatedPaymentId && currentType === "Refund" ? { relatedPaymentId } : {}),
      fxSource: orderCode ? "locked from order" : "live",
      usdToCurrencyRate:
        paymentCurrency === "KES" ? FX.usdToKes : paymentCurrency === "CNY" ? 1 / FX.cnyToUsd : 1,
      cnyPerUsd: 1 / FX.cnyToUsd,
    };
    onSave(record);
  };

  const updateLine = (index: number, changes: Partial<PaymentLine>) =>
    setLines((current) =>
      current.map((line, lineIndex) => (lineIndex === index ? { ...line, ...changes } : line)),
    );

  return (
    <>
      <PageHeader
        title={initial ? "Edit payment" : "Record payment"}
        subtitle="Capture a transfer, attach proof, and lock its reference."
        actions={
          <a
            href="/app/payments"
            className="inline-flex min-h-11 items-center rounded-md px-4 text-sm text-fg-muted hover:bg-bg-glass-hover"
          >
            Cancel
          </a>
        }
      />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <Card>
            <SectionTitle>01 · Direction & type</SectionTitle>
            <div className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-bg-elev-1 p-1">
              {(["IN", "OUT"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => changeDirection(value)}
                  className={`min-h-11 rounded-md text-sm font-bold ${direction === value ? (value === "IN" ? "bg-success/15 text-success" : "bg-primary/15 text-primary") : "text-fg-muted"}`}
                >
                  {value} · {value === "IN" ? "Money in" : "Money out"}
                </button>
              ))}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className={labelClass}>
                Payment type
                <select
                  className={`${inputClass} w-full`}
                  value={currentType}
                  onChange={(event) => setType(event.target.value)}
                >
                  {paymentTypes[direction].map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
              <label className={labelClass}>
                Status
                <select
                  className={`${inputClass} w-full`}
                  value={status}
                  onChange={(event) => setStatus(event.target.value as Payment["status"])}
                >
                  <option value={direction === "IN" ? "received" : "sent"}>
                    {direction === "IN" ? "Received" : "Sent"}
                  </option>
                  <option value="pending">Pending</option>
                  {initial?.status === "failed" ? <option value="failed">Failed</option> : null}
                </select>
              </label>
            </div>
          </Card>

          <Card>
            <SectionTitle>02 · Counterparty & order</SectionTitle>
            {direction === "IN" ? (
              <label className={labelClass}>
                Client
                <select
                  className={`${inputClass} w-full`}
                  value={counterparty}
                  onChange={(event) => setCounterparty(event.target.value)}
                >
                  {clients.map((client) => (
                    <option key={client.id}>{client.name}</option>
                  ))}
                </select>
              </label>
            ) : (
              <div className="space-y-3">
                {lines.map((line, index) => (
                  <div
                    key={index}
                    className="grid gap-2 rounded-md border border-border p-3 sm:grid-cols-[1fr_1.4fr_1fr_90px_40px]"
                  >
                    <label className={labelClass}>
                      Recipient type
                      <select
                        className={`${inputClass} w-full`}
                        value={line.recipientType}
                        onChange={(event) => {
                          const recipientType = event.target.value as PaymentRecipientType;
                          updateLine(index, {
                            recipientType,
                            recipient: recipientOptions[recipientType][0] ?? "",
                          });
                        }}
                      >
                        {Object.keys(recipientOptions).map((option) => (
                          <option key={option}>{option}</option>
                        ))}
                      </select>
                    </label>
                    <label className={labelClass}>
                      Recipient
                      <select
                        className={`${inputClass} w-full`}
                        value={line.recipient}
                        onChange={(event) => updateLine(index, { recipient: event.target.value })}
                      >
                        {recipientOptions[line.recipientType].map((option) => (
                          <option key={option}>{option}</option>
                        ))}
                      </select>
                    </label>
                    <label className={labelClass}>
                      Amount
                      <Input
                        className="font-mono"
                        min="0"
                        type="number"
                        value={line.amount || ""}
                        onChange={(event) =>
                          updateLine(index, { amount: Number(event.target.value) })
                        }
                      />
                    </label>
                    <label className={labelClass}>
                      Currency
                      <select
                        className={`${inputClass} w-full`}
                        value={line.currency}
                        onChange={(event) =>
                          updateLine(index, { currency: event.target.value as PaymentCurrency })
                        }
                      >
                        {currencies.map((option) => (
                          <option key={option}>{option}</option>
                        ))}
                      </select>
                    </label>
                    <button
                      aria-label="Remove line"
                      type="button"
                      className="mt-5 inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-danger hover:bg-danger/10"
                      onClick={() =>
                        setLines((current) =>
                          current.length > 1
                            ? current.filter((_, lineIndex) => lineIndex !== index)
                            : current,
                        )
                      }
                    >
                      <Trash2 size={16} />
                    </button>
                    <Input
                      className="sm:col-span-5"
                      placeholder="Line note"
                      value={line.note}
                      onChange={(event) => updateLine(index, { note: event.target.value })}
                    />
                  </div>
                ))}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Button
                    type="button"
                    variant="glass"
                    onClick={() =>
                      setLines((current) => [
                        ...current,
                        {
                          recipientType: "Supplier",
                          recipient: suppliers[0]?.name ?? "",
                          amount: 0,
                          currency: "CNY",
                          note: "",
                        },
                      ])
                    }
                  >
                    <Plus size={16} /> Add line
                  </Button>
                  <p className="font-mono text-sm font-bold text-accent">
                    Total {total.toLocaleString()} {paymentCurrency}
                  </p>
                </div>
              </div>
            )}
            <label className={`${labelClass} mt-4`}>
              Order link · optional
              <select
                className={`${inputClass} w-full`}
                value={orderCode}
                onChange={(event) => setOrderCode(event.target.value)}
              >
                <option value="">Standalone payment</option>
                {orders
                  .filter((order) => order.status !== "DELIVERED" && order.status !== "CANCELLED")
                  .map((order) => (
                    <option key={order.id} value={order.code}>
                      {order.code} · {order.client}
                    </option>
                  ))}
              </select>
            </label>
          </Card>

          <Card>
            <SectionTitle>03 · Amount & currency</SectionTitle>
            {!isMultiLine ? (
              <div className="grid gap-3 sm:grid-cols-[1fr_160px]">
                <label className={labelClass}>
                  Amount
                  <Input
                    className="font-mono"
                    min="0"
                    step="0.01"
                    type="number"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                  />
                </label>
                <label className={labelClass}>
                  Currency
                  <select
                    className={`${inputClass} w-full`}
                    value={currency}
                    onChange={(event) => setCurrency(event.target.value as PaymentCurrency)}
                  >
                    {currencies.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </label>
              </div>
            ) : (
              <div className="rounded-md border border-border-accent bg-accent/5 p-3">
                <p className="text-[11px] uppercase tracking-wider text-fg-subtle">
                  Combined amount
                </p>
                <p className="mt-1 font-mono text-2xl font-bold text-accent">
                  {total.toLocaleString()} {currency}
                </p>
              </div>
            )}
            <div
              className={`mt-4 rounded-md border p-4 ${orderCode ? "border-success/35 bg-success/5" : "border-warning/35 bg-warning/5"}`}
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider text-fg-subtle">
                FX estimate · {orderCode ? "Locked from order" : "Live reference"}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <span className="text-fg-muted">Original</span>
                <span className="text-right font-mono">
                  {total.toLocaleString()} {paymentCurrency}
                </span>
                <span className="text-fg-muted">USD equivalent</span>
                <span className="text-right font-mono text-accent">
                  ${totalUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
                <span className="text-fg-muted">CNY equivalent</span>
                <span className="text-right font-mono">
                  ¥{cny.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
                <span className="text-fg-muted">Rate</span>
                <span className="text-right font-mono">
                  1 USD ={" "}
                  {paymentCurrency === "KES"
                    ? FX.usdToKes
                    : paymentCurrency === "CNY"
                      ? (1 / FX.cnyToUsd).toFixed(2)
                      : 1}{" "}
                  {paymentCurrency} = {(1 / FX.cnyToUsd).toFixed(2)} CNY
                </span>
              </div>
            </div>
          </Card>

          <Card>
            <SectionTitle>04 · Payment details</SectionTitle>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className={labelClass}>
                Method
                <select
                  className={`${inputClass} w-full`}
                  value={method}
                  onChange={(event) => setMethod(event.target.value)}
                >
                  {["M-Pesa", "Bank", "WeChat Pay", "Alipay", "Cash", "Stripe"].map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
              <label className={labelClass}>
                Reference
                <Input
                  value={reference}
                  onChange={(event) => setReference(event.target.value)}
                  placeholder="Transaction reference"
                />
              </label>
              <label className={labelClass}>
                Payment date
                <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
              </label>
              {status === "pending" ? (
                <label className={labelClass}>
                  Expected date
                  <Input
                    type="date"
                    value={expectedDate}
                    onChange={(event) => setExpectedDate(event.target.value)}
                  />
                </label>
              ) : null}
            </div>
            {currentType === "Refund" ? (
              <label className={`${labelClass} mt-3`}>
                Original payment
                <select
                  className={`${inputClass} w-full`}
                  value={relatedPaymentId}
                  onChange={(event) => setRelatedPaymentId(event.target.value)}
                >
                  <option value="">Select original payment</option>
                  {payments
                    .filter(
                      (payment) => payment.direction === "IN" && payment.status !== "refunded",
                    )
                    .map((payment) => (
                      <option key={payment.id} value={payment.id}>
                        {payment.code} · {payment.counterparty} · {payment.amount.toLocaleString()}{" "}
                        {payment.currency}
                      </option>
                    ))}
                </select>
              </label>
            ) : null}
            <label className={`${labelClass} mt-3`}>
              Note
              <textarea
                className={`${inputClass} min-h-20 w-full py-2`}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Add context for your team"
              />
            </label>
          </Card>

          <Card>
            <SectionTitle>05 · Reference helper</SectionTitle>
            <label className={labelClass}>
              Paste WhatsApp or transaction message
              <textarea
                className={`${inputClass} min-h-24 w-full py-2`}
                value={pasteText}
                onChange={(event) => setPasteText(event.target.value)}
                placeholder="e.g. RKT8M4Q2PL Confirmed. Ksh685,000.00 received on 01/10/2026"
              />
            </label>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="glass"
                onClick={async () => {
                  try {
                    setPasteText(await navigator.clipboard.readText());
                  } catch {
                    setError("Clipboard access is unavailable. Paste the message into the field.");
                  }
                }}
              >
                <Clipboard size={16} /> Paste message
              </Button>
              <Button type="button" variant="accent" onClick={parsePaste}>
                <Check size={16} /> Extract details
              </Button>
              <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-border px-4 text-sm text-fg-muted hover:bg-bg-glass-hover">
                <ImagePlus size={16} /> Upload screenshot
                <input
                  className="sr-only"
                  type="file"
                  accept="image/*"
                  onChange={(event) => addProofs(event.target.files)}
                />
              </label>
            </div>
            <p className="mt-2 text-xs text-fg-subtle">
              Image OCR is not enabled. Screenshots are stored as proof images.
            </p>
          </Card>

          <Card>
            <SectionTitle>
              06 · Proof images{" "}
              <span className="text-sm font-normal text-fg-subtle">{proofs.length}/5</span>
            </SectionTitle>
            <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border-strong text-sm text-fg-muted hover:border-accent/50">
              <Upload size={18} /> Drop or choose image files
              <input
                className="sr-only"
                type="file"
                accept="image/*"
                multiple
                onChange={(event) => addProofs(event.target.files)}
              />
            </label>
            {proofs.length ? (
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {proofs.map((proof, index) => (
                  <div
                    key={`${index}-${proof.url.slice(0, 20)}`}
                    className="relative overflow-hidden rounded-md border border-border"
                  >
                    <img
                      className="aspect-square w-full object-cover"
                      src={proof.url}
                      alt={`Payment proof ${index + 1}`}
                    />
                    <select
                      aria-label={`Image ${index + 1} type`}
                      className="w-full bg-bg-elev-1 p-2 text-xs"
                      value={proof.type}
                      onChange={(event) =>
                        setProofs((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, type: event.target.value } : item,
                          ),
                        )
                      }
                    >
                      {["M-Pesa", "Bank", "WeChat", "Invoice", "Other"].map((option) => (
                        <option key={option}>{option}</option>
                      ))}
                    </select>
                    <button
                      aria-label="Remove image"
                      type="button"
                      className="absolute right-2 top-2 inline-flex min-h-11 min-w-11 items-center justify-center rounded-md bg-bg/80 text-fg"
                      onClick={() =>
                        setProofs((current) =>
                          current.filter((_, itemIndex) => itemIndex !== index),
                        )
                      }
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </Card>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <Card>
            <SectionTitle>07 · Review & save</SectionTitle>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-fg-subtle">Direction</span>
                <span className={direction === "IN" ? "text-success" : "text-primary"}>
                  {direction}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-fg-subtle">Counterparty</span>
                <span className="max-w-40 text-right">
                  {direction === "IN"
                    ? counterparty
                    : lines
                        .map((line) => line.recipient)
                        .filter(Boolean)
                        .join(", ") || "Payment lines"}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-fg-subtle">Status</span>
                <span className={status === "pending" ? "text-warning" : "text-success"}>
                  {status}
                </span>
              </div>
              <div className="flex justify-between gap-3 border-t border-border pt-3">
                <span className="text-fg-subtle">Amount</span>
                <span className="font-mono font-bold text-accent">
                  {total.toLocaleString()} {currency}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-fg-subtle">USD value</span>
                <span className="font-mono">
                  ${totalUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-fg-subtle">Proof images</span>
                <span>{proofs.length}</span>
              </div>
            </div>
            {error ? (
              <p role="alert" className="mt-4 text-sm text-danger">
                {error}
              </p>
            ) : null}
            <div className="mt-5 flex flex-col gap-2">
              <Button type="button" onClick={save}>
                Save payment
              </Button>
              <a
                href="/app/payments"
                className="inline-flex min-h-11 items-center justify-center text-sm text-fg-muted hover:text-fg"
              >
                Cancel
              </a>
            </div>
          </Card>
          <div className="flex items-start gap-2 px-1 text-xs text-fg-subtle">
            <Check className="mt-0.5 shrink-0 text-success" size={14} /> Drafts save locally in this
            browser when submitted. No bank transfer is initiated.
          </div>
        </aside>
      </div>
    </>
  );
}
