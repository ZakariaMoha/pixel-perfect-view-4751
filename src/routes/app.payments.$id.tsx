import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Button, Card, PageHeader, SectionTitle } from "@/components/kit";
import { PaymentForm } from "@/components/payments/PaymentForm";
import { Field, PaymentAmount, PaymentStatusPill } from "@/components/payments/shared";
import { payments, type Payment } from "@/lib/demo-data";
import { usePersistentList } from "@/lib/use-persistent-list";

export const Route = createFileRoute("/app/payments/$id")({ component: PaymentDetailPage });

function PaymentDetailPage() {
  const { id } = Route.useParams();
  const collection = usePersistentList<Payment>("payments", payments);
  const payment = collection.records.find((record) => record.id === id);
  const [editing, setEditing] = useState(false);

  if (!payment)
    return (
      <div className="py-12 text-center">
        <p className="text-fg">Payment not found</p>
        <a
          className="mt-3 inline-flex min-h-11 items-center text-sm text-accent"
          href="/app/payments"
        >
          <ArrowLeft size={15} className="mr-2" />
          Back to payments
        </a>
      </div>
    );
  if (editing)
    return (
      <PaymentForm
        initial={payment}
        onSave={(updated) => {
          collection.update(payment.id, updated);
          setEditing(false);
        }}
      />
    );

  const originalPayment = payment.relatedPaymentId
    ? collection.records.find((record) => record.id === payment.relatedPaymentId)
    : undefined;
  const remove = () => {
    if (window.confirm(`Delete ${payment.code}? This cannot be undone.`)) {
      collection.remove(payment.id);
      window.location.href = "/app/payments";
    }
  };

  return (
    <>
      <PageHeader
        title={payment.code}
        subtitle={`${payment.direction === "IN" ? "Money received" : "Money sent"} · ${new Date(`${payment.date}T00:00:00`).toLocaleDateString("en-KE", { dateStyle: "long" })}`}
        actions={
          <>
            <a
              href="/app/payments"
              className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm text-fg-muted hover:bg-bg-glass-hover"
            >
              <ArrowLeft size={16} /> Payments
            </a>
            <Button variant="glass" onClick={() => setEditing(true)}>
              <Pencil size={15} /> Edit
            </Button>
            <Button variant="ghost" className="text-danger" onClick={remove}>
              <Trash2 size={15} /> Delete
            </Button>
          </>
        }
      />
      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <Card className="border-border-accent">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-fg-subtle">Original amount</p>
              <PaymentAmount
                payment={payment}
                className="mt-2 block text-3xl font-bold glow-text sm:text-4xl"
              />
            </div>
            <PaymentStatusPill status={payment.status} />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-4">
            <Field label="USD equivalent">
              ${payment.usdAmount.toLocaleString("en-US", { maximumFractionDigits: 2 })}
            </Field>
            <Field label="CNY equivalent">
              ¥
              {(payment.usdAmount * payment.cnyPerUsd).toLocaleString("en-US", {
                maximumFractionDigits: 2,
              })}
            </Field>
            <Field label="Rate used">
              1 USD = {payment.usdToCurrencyRate.toLocaleString()} {payment.currency}
            </Field>
            <Field label="Rate source">
              <span
                className={
                  payment.fxSource === "locked from order" ? "text-success" : "text-warning"
                }
              >
                {payment.fxSource}
              </span>
            </Field>
          </div>
        </Card>
        <Card>
          <SectionTitle>Payment details</SectionTitle>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-5">
            <Field label="Counterparty">{payment.counterparty}</Field>
            <Field label="Type">{payment.type}</Field>
            <Field label="Method">{payment.method}</Field>
            <Field label="Reference">
              <span className="break-all font-mono">{payment.reference || "—"}</span>
            </Field>
            <Field label="Payment date">{payment.date}</Field>
            <Field label="Expected date">{payment.expectedDate ?? "—"}</Field>
          </dl>
        </Card>
        {payment.lines?.length ? (
          <Card className="xl:col-span-2">
            <SectionTitle>Payment lines</SectionTitle>
            <div className="divide-y divide-border">
              {payment.lines.map((line, index) => (
                <div
                  key={`${line.recipient}-${index}`}
                  className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium">{line.recipient}</p>
                    <p className="mt-1 text-xs text-fg-subtle">
                      {line.recipientType} · {line.note}
                    </p>
                  </div>
                  <span className="font-mono text-sm">
                    {line.amount.toLocaleString()} {line.currency}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between border-t border-border pt-4 text-sm font-bold">
              <span>Total</span>
              <span className="font-mono text-accent">
                {payment.amount.toLocaleString()} {payment.currency}
              </span>
            </div>
          </Card>
        ) : null}
        {payment.orderCode ? (
          <Card>
            <SectionTitle>Linked order</SectionTitle>
            <a
              href={`/app/orders/${payment.orderCode}`}
              className="font-mono text-accent hover:underline"
            >
              {payment.orderCode}
            </a>
            <p className="mt-2 text-xs text-fg-subtle">
              FX{" "}
              {payment.fxSource === "locked from order"
                ? "locked at order creation"
                : "estimated using live reference rates"}
              .
            </p>
          </Card>
        ) : null}
        {originalPayment ? (
          <Card>
            <SectionTitle>Refund link</SectionTitle>
            <p className="text-sm text-fg-muted">Refunded from</p>
            <a
              className="mt-2 inline-block font-mono text-accent hover:underline"
              href={`/app/payments/${originalPayment.id}`}
            >
              {originalPayment.code} · {originalPayment.amount.toLocaleString()}{" "}
              {originalPayment.currency}
            </a>
          </Card>
        ) : null}
        <Card className="xl:col-span-2">
          <SectionTitle>Proof images</SectionTitle>
          {payment.images.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {payment.images.map((image, index) =>
                image.startsWith("data:image") ? (
                  <a href={image} target="_blank" rel="noreferrer" key={index}>
                    <img
                      className="aspect-square w-full rounded-md border border-border object-cover"
                      src={image}
                      alt={`Payment proof ${index + 1}`}
                    />
                  </a>
                ) : (
                  <div
                    key={index}
                    className="flex aspect-square items-center justify-center rounded-md border border-dashed border-border bg-bg-elev-1 text-xs text-fg-subtle"
                  >
                    Proof image {index + 1}
                  </div>
                ),
              )}
            </div>
          ) : (
            <p className="text-sm text-fg-subtle">No proof images attached.</p>
          )}
        </Card>
        {payment.note ? (
          <Card className="xl:col-span-2">
            <SectionTitle>Notes</SectionTitle>
            <p className="whitespace-pre-wrap text-sm text-fg-muted">{payment.note}</p>
          </Card>
        ) : null}
        <Card className="xl:col-span-2">
          <SectionTitle>Audit log</SectionTitle>
          <ol className="space-y-4 border-l border-border pl-4">
            <li className="relative">
              <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-accent" />
              <p className="text-sm">Payment recorded · {payment.status}</p>
              <p className="mt-1 text-xs text-fg-subtle">{payment.date} · TradeHub workspace</p>
            </li>
            {payment.status === "pending" ? (
              <li className="relative">
                <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-warning" />
                <p className="text-sm">Awaiting payment</p>
                <p className="mt-1 text-xs text-fg-subtle">
                  Expected {payment.expectedDate ?? "date not set"}
                </p>
              </li>
            ) : null}
          </ol>
        </Card>
      </div>
    </>
  );
}
