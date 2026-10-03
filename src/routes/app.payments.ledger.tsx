import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, Plus } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button, Card, PageHeader, SectionTitle, Stat, Table } from "@/components/kit";
import { PaymentAmount } from "@/components/payments/shared";
import { orders, payments, suppliers, type Payment } from "@/lib/demo-data";
import { usePersistentList } from "@/lib/use-persistent-list";

export const Route = createFileRoute("/app/payments/ledger")({ component: SupplierLedgerPage });
const openingOwed: Record<string, number> = {
  "Shenzhen AudioTech": 12400,
  "Guangdong KitchenPro": 0,
  "Hebei AutoLine": 6800,
  "Xuchang HairCo": 0,
  "Yiwu Central Warehouse": 0,
};

function SupplierLedgerPage() {
  const collection = usePersistentList<Payment>("payments", payments);
  const [selected, setSelected] = useState("");
  const suppliersWithPayments = [
    ...new Set(
      collection.records
        .filter((payment) => payment.direction === "OUT")
        .flatMap(
          (payment) =>
            payment.lines
              ?.filter((line) => line.recipientType === "Supplier")
              .map((line) => line.recipient) ?? [payment.counterparty],
        )
        .filter((name) => suppliers.some((supplier) => supplier.name === name)),
    ),
  ];
  const activeSupplier = suppliersWithPayments.find((name) => name === selected);
  const supplierPayments = collection.records.filter(
    (payment) =>
      payment.direction === "OUT" &&
      (payment.counterparty === activeSupplier ||
        payment.lines?.some(
          (line) => line.recipientType === "Supplier" && line.recipient === activeSupplier,
        )),
  );
  const totalPaid = supplierPayments.reduce(
    (sum, payment) =>
      sum +
      (payment.currency === "CNY"
        ? (payment.lines
            ?.filter((line) => line.recipient === activeSupplier)
            .reduce((lineSum, line) => lineSum + line.amount, 0) ?? payment.amount)
        : 0),
    0,
  );
  const owed = activeSupplier ? (openingOwed[activeSupplier] ?? 0) : 0;
  const monthly = ["Aug", "Sep", "Oct"].map((month) => ({
    month,
    paid: supplierPayments
      .filter(
        (payment) =>
          new Date(`${payment.date}T00:00:00`).toLocaleString("en-US", { month: "short" }) ===
          month,
      )
      .reduce((sum, payment) => sum + (payment.currency === "CNY" ? payment.amount : 0), 0),
  }));

  return (
    <>
      <PageHeader
        title="Supplier ledger"
        subtitle="Outstanding balances and settlement history in CNY."
        actions={
          <a href="/app/payments/new?direction=OUT">
            <Button type="button">
              <Plus size={16} /> New payment
            </Button>
          </a>
        }
      />
      {activeSupplier ? (
        <>
          <button
            type="button"
            onClick={() => setSelected("")}
            className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm text-fg-muted hover:text-fg"
          >
            <ArrowLeft size={16} /> All suppliers
          </button>
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">{activeSupplier}</h2>
            <a
              href={`/app/payments/new?direction=OUT&recipient=${encodeURIComponent(activeSupplier)}`}
            >
              <Button variant="glass">
                <Plus size={15} /> New payment
              </Button>
            </a>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat
              label="Owed"
              value={`¥${owed.toLocaleString()}`}
              tone={owed ? "danger" : "success"}
            />
            <Stat label="Paid YTD" value={`¥${totalPaid.toLocaleString()}`} tone="accent" />
            <Stat
              label="Average payment"
              value={`¥${Math.round(totalPaid / Math.max(supplierPayments.length, 1)).toLocaleString()}`}
              tone="primary"
              sub={`${supplierPayments.length} recorded payments`}
            />
          </div>
          <Card className="mt-5">
            <SectionTitle>Payment history · CNY</SectionTitle>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthly}>
                  <CartesianGrid stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="month" stroke="var(--color-fg-subtle)" />
                  <YAxis stroke="var(--color-fg-subtle)" />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-bg-elev-1)",
                      border: "1px solid var(--color-border-strong)",
                      borderRadius: 8,
                    }}
                  />
                  <Bar dataKey="paid" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <div className="mt-5">
            <Table head={["Payment", "Order", "Date", "Amount", "Status"]}>
              {supplierPayments.map((payment) => (
                <tr key={payment.id} className="border-b border-border/60">
                  <td className="px-4 py-3">
                    <a
                      href={`/app/payments/${payment.id}`}
                      className="font-mono text-xs text-accent"
                    >
                      {payment.code}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-xs">{payment.orderCode ?? "—"}</td>
                  <td className="px-4 py-3 text-xs">{payment.date}</td>
                  <td className="px-4 py-3">
                    <PaymentAmount payment={payment} />
                  </td>
                  <td className="px-4 py-3 text-xs">{payment.status}</td>
                </tr>
              ))}
            </Table>
          </div>
        </>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {suppliersWithPayments.map((name) => {
            const supplierPayments = collection.records.filter(
              (payment) =>
                payment.direction === "OUT" &&
                (payment.counterparty === name ||
                  payment.lines?.some(
                    (line) => line.recipientType === "Supplier" && line.recipient === name,
                  )),
            );
            const paid = supplierPayments.reduce(
              (sum, payment) =>
                sum +
                (payment.currency === "CNY"
                  ? (payment.lines
                      ?.filter((line) => line.recipient === name)
                      .reduce((lineSum, line) => lineSum + line.amount, 0) ?? payment.amount)
                  : 0),
              0,
            );
            const supplierOrders = orders.filter((order) => order.supplier === name).length;
            return (
              <Card key={name}>
                <button
                  type="button"
                  onClick={() => setSelected(name)}
                  className="w-full text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-semibold">{name}</h2>
                    <span
                      className={`font-mono text-sm ${openingOwed[name] ? "text-danger" : "text-success"}`}
                    >
                      ¥{(openingOwed[name] ?? 0).toLocaleString()} owed
                    </span>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-fg-subtle">
                        Paid YTD
                      </p>
                      <p className="mt-1 font-mono text-accent">¥{paid.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-fg-subtle">Orders</p>
                      <p className="mt-1 font-mono">{supplierOrders}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[11px] uppercase tracking-wider text-fg-subtle">
                        Last payment
                      </p>
                      <p className="mt-1">
                        {supplierPayments.sort((left, right) =>
                          right.date.localeCompare(left.date),
                        )[0]?.date ?? "No history"}
                      </p>
                    </div>
                  </div>
                </button>
                <div className="mt-4 flex gap-2">
                  <Button
                    type="button"
                    variant="glass"
                    className="flex-1"
                    onClick={() => setSelected(name)}
                  >
                    View payments
                  </Button>
                  <a
                    className="flex-1"
                    href={`/app/payments/new?direction=OUT&recipient=${encodeURIComponent(name)}`}
                  >
                    <Button type="button" variant="ghost" className="w-full">
                      <Plus size={14} /> New
                    </Button>
                  </a>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
