import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownLeft, ArrowUpRight, Plus, Search, Wallet } from "lucide-react";
import { Button, Card, PageHeader, Stat, Table } from "@/components/kit";
import { PaymentAmount, PaymentStatusPill } from "@/components/payments/shared";
import { Input } from "@/components/ui/input";
import { payments, type Payment } from "@/lib/demo-data";
import { usePersistentList } from "@/lib/use-persistent-list";

export const Route = createFileRoute("/app/payments/")({ component: PaymentsPage });

type FilterTab = "All" | "Received" | "Sent" | "Pending" | "Refunds";
const tabs: FilterTab[] = ["All", "Received", "Sent", "Pending", "Refunds"];
const formatDate = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

function PaymentsPage() {
  const collection = usePersistentList<Payment>("payments", payments);
  const [activeTab, setActiveTab] = useState<FilterTab>("All");
  const [search, setSearch] = useState("");
  const [client, setClient] = useState("All clients");
  const [supplier, setSupplier] = useState("All suppliers");
  const [currency, setCurrency] = useState("All currencies");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const filtered = collection.records.filter((payment) => {
    const matchesTab =
      activeTab === "All" ||
      (activeTab === "Received" && payment.direction === "IN" && payment.status !== "pending") ||
      (activeTab === "Sent" && payment.direction === "OUT") ||
      (activeTab === "Pending" && payment.status === "pending") ||
      (activeTab === "Refunds" && (payment.type === "Refund" || payment.status === "refunded"));
    const matchesQuery =
      `${payment.code} ${payment.counterparty} ${payment.reference} ${payment.type}`
        .toLowerCase()
        .includes(search.toLowerCase());
    const matchesClient =
      client === "All clients" || (payment.direction === "IN" && payment.counterparty === client);
    const matchesSupplier =
      supplier === "All suppliers" ||
      (payment.direction === "OUT" && payment.counterparty.includes(supplier));
    return (
      matchesTab &&
      matchesQuery &&
      matchesClient &&
      matchesSupplier &&
      (currency === "All currencies" || payment.currency === currency) &&
      (!fromDate || payment.date >= fromDate) &&
      (!toDate || payment.date <= toDate)
    );
  });

  const thisMonth = collection.records.filter((payment) => payment.date.startsWith("2026-10"));
  const incoming = thisMonth
    .filter((payment) => payment.direction === "IN" && payment.status === "received")
    .reduce((sum, payment) => sum + (payment.currency === "KES" ? payment.amount : 0), 0);
  const outgoing = thisMonth
    .filter((payment) => payment.direction === "OUT" && payment.status === "sent")
    .reduce((sum, payment) => sum + (payment.currency === "CNY" ? payment.amount : 0), 0);
  const netUsd = thisMonth.reduce(
    (sum, payment) => sum + (payment.direction === "IN" ? payment.usdAmount : -payment.usdAmount),
    0,
  );
  const pendingCount = collection.records.filter((payment) => payment.status === "pending").length;

  return (
    <>
      <PageHeader
        title="Payments"
        subtitle="Record, reconcile, and track every transfer across the trade lifecycle."
        actions={
          <a href="/app/payments/new">
            <Button type="button">
              <Plus size={17} /> New payment
            </Button>
          </a>
        }
      />
      <div className="mb-5 flex gap-1 overflow-x-auto border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`min-h-11 shrink-0 border-b-2 px-3 text-sm ${activeTab === tab ? "border-primary text-fg" : "border-transparent text-fg-muted hover:text-fg"}`}
          >
            {tab}
            <span className="ml-2 text-xs text-fg-subtle">
              {tab === "All"
                ? collection.records.length
                : tab === "Pending"
                  ? collection.records.filter((payment) => payment.status === "pending").length
                  : tab === "Refunds"
                    ? collection.records.filter((payment) => payment.type === "Refund").length
                    : collection.records.filter((payment) =>
                        tab === "Received"
                          ? payment.direction === "IN"
                          : payment.direction === "OUT",
                      ).length}
            </span>
          </button>
        ))}
      </div>
      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="This month in · KES"
          value={`KSh ${incoming.toLocaleString()}`}
          tone="success"
          icon={<ArrowDownLeft size={17} />}
        />
        <Stat
          label="This month out · CNY"
          value={`¥${outgoing.toLocaleString()}`}
          tone="primary"
          icon={<ArrowUpRight size={17} />}
        />
        <Stat
          label="Net movement · USD"
          value={`$${netUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          tone="accent"
          icon={<Wallet size={17} />}
        />
        <Stat
          label="Pending payments"
          value={String(pendingCount)}
          sub="Awaiting confirmation"
          tone="warning"
        />
      </div>
      <Card className="mb-5 !p-3 sm:!p-4">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
          <label className="text-[11px] uppercase tracking-wider text-fg-subtle">
            From
            <Input
              aria-label="From date"
              className="mt-1"
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
            />
          </label>
          <label className="text-[11px] uppercase tracking-wider text-fg-subtle">
            To
            <Input
              aria-label="To date"
              className="mt-1"
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
            />
          </label>
          <select
            aria-label="Client filter"
            className="min-h-11 rounded-md border border-border-strong bg-bg-elev-1 px-3 text-sm"
            value={client}
            onChange={(event) => setClient(event.target.value)}
          >
            <option>All clients</option>
            {[
              ...new Set(
                collection.records
                  .filter((payment) => payment.direction === "IN")
                  .map((payment) => payment.counterparty),
              ),
            ].map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
          <select
            aria-label="Supplier filter"
            className="min-h-11 rounded-md border border-border-strong bg-bg-elev-1 px-3 text-sm"
            value={supplier}
            onChange={(event) => setSupplier(event.target.value)}
          >
            <option>All suppliers</option>
            {[
              ...new Set(
                collection.records
                  .filter((payment) => payment.direction === "OUT")
                  .map(
                    (payment) =>
                      payment.lines?.map((line) => line.recipient) ?? [payment.counterparty],
                  )
                  .flat(),
              ),
            ].map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
          <select
            aria-label="Currency filter"
            className="min-h-11 rounded-md border border-border-strong bg-bg-elev-1 px-3 text-sm"
            value={currency}
            onChange={(event) => setCurrency(event.target.value)}
          >
            <option>All currencies</option>
            {["KES", "CNY", "USD"].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
          <label className="relative">
            <Search className="absolute left-3 top-3.5 text-fg-subtle" size={15} />
            <Input
              aria-label="Search payments"
              className="pl-9"
              placeholder="Search payments"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
        </div>
      </Card>
      <div className="hidden lg:block">
        <Table
          head={[
            "Direction",
            "Payment · counterparty",
            "Type",
            "Amount",
            "USD value",
            "Method",
            "Reference",
            "Date",
            "Proof",
          ]}
        >
          {filtered.map((payment) => (
            <PaymentTableRow key={payment.id} payment={payment} />
          ))}
        </Table>
      </div>
      <div className="grid gap-3 lg:hidden">
        {filtered.map((payment) => (
          <a
            key={payment.id}
            href={`/app/payments/${payment.id}`}
            className="glass-card block p-4 hover:border-border-strong"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="font-mono text-sm text-fg">{payment.code}</span>
              <PaymentStatusPill status={payment.status} />
            </div>
            <p className="mt-1 text-sm text-fg-muted">{payment.counterparty}</p>
            <div className="mt-4 flex items-end justify-between gap-3">
              <PaymentAmount payment={payment} className="text-lg font-bold" />
              <span className="font-mono text-xs text-fg-muted">
                ${payment.usdAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })} USD
              </span>
            </div>
            <div className="mt-3 flex justify-between border-t border-border pt-3 text-xs text-fg-subtle">
              <span>{formatDate(payment.date)}</span>
              <span>
                {payment.images.length} proof{payment.images.length === 1 ? "" : "s"}
              </span>
            </div>
          </a>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="py-12 text-center text-sm text-fg-muted">
          No payments match these filters.
        </div>
      ) : null}
    </>
  );
}

function PaymentTableRow({ payment }: { payment: Payment }) {
  const direction =
    payment.direction === "IN" ? (
      <span className="text-success">IN</span>
    ) : (
      <span className="text-primary">OUT</span>
    );
  return (
    <tr
      className="cursor-pointer border-b border-border/60 transition-colors hover:bg-bg-glass-hover"
      onClick={() => {
        window.location.href = `/app/payments/${payment.id}`;
      }}
    >
      <td className="px-4 py-3 font-semibold">{direction}</td>
      <td className="px-4 py-3">
        <a
          className="font-mono text-xs text-accent hover:underline"
          href={`/app/payments/${payment.id}`}
        >
          {payment.code}
        </a>
        <p className="mt-1 text-xs text-fg-muted">{payment.counterparty}</p>
      </td>
      <td className="px-4 py-3 text-xs text-fg-muted">{payment.type}</td>
      <td className="px-4 py-3 text-sm">
        <PaymentAmount payment={payment} />
      </td>
      <td className="px-4 py-3 font-mono text-xs">
        ${payment.usdAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}
      </td>
      <td className="px-4 py-3 text-xs">{payment.method}</td>
      <td className="max-w-32 truncate px-4 py-3 font-mono text-xs text-fg-muted">
        {payment.reference || "—"}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-xs">{formatDate(payment.date)}</td>
      <td className="px-4 py-3 text-center text-xs">{payment.images.length}</td>
    </tr>
  );
}
