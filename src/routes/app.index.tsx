import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  DollarSign,
  FileText,
  Package,
  Radio,
  Search,
  Send,
  Settings,
  Sparkles,
  TrendingUp,
  Truck,
} from "lucide-react";
import {
  Badge,
  Card,
  CardHeader,
  EmptyState,
  Stat,
  StatusPill,
  Table,
  TableSkeleton,
} from "@/components/kit";
import {
  FX,
  fxSeries,
  insights,
  kpis,
  orders,
  payments,
  statusMeta,
  usd,
  type Order,
} from "@/lib/demo-data";
import { usePersistentList } from "@/lib/use-persistent-list";

const quickActions = [
  { label: "New Order", icon: Package, to: "/app/orders" },
  { label: "New RFQ", icon: Search, to: "/app/sourcing" },
  { label: "Send Quote", icon: Send, to: "/app/sourcing" },
  { label: "Logistics", icon: Truck, to: "/app/logistics" },
  { label: "Invoices", icon: FileText, to: "/app/invoices" },
  { label: "FX Lock", icon: DollarSign, to: "/app/fx" },
  { label: "Reports", icon: TrendingUp, to: "/app/reports" },
  { label: "Settings", icon: Settings, to: "/app/settings" },
] as const;

const insightDestinations: Record<
  string,
  "/app/sourcing" | "/app/inbox" | "/app/logistics" | "/app/agents" | "/app/reports"
> = {
  "Lock pricing": "/app/sourcing",
  "Message client": "/app/inbox",
  "Book space": "/app/logistics",
  "Review agent": "/app/agents",
};

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "Dashboard — TradeHub" },
      {
        name: "description",
        content:
          "Live KPIs for the China to Kenya corridor: active orders, revenue, profit, FX impact and commissions.",
      },
      { property: "og:title", content: "TradeHub Dashboard" },
      {
        property: "og:description",
        content: "Active orders, revenue, profit and FX impact at a glance.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [range, setRange] = useState<7 | 30 | 90>(90);
  const orderCollection = usePersistentList("orders", orders);
  const paymentCollection = usePersistentList("payments", payments);
  const today = new Date();
  const rangeStart = new Date(today);
  rangeStart.setDate(today.getDate() - range);
  const recentOrders = orderCollection.records
    .filter((order) => new Date(order.createdAt) >= rangeStart)
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, 4);
  const customsCount = orderCollection.records.filter((order) => order.status === "CUSTOMS").length;
  const paidCommission = paymentCollection.records
    .filter(
      (payment) =>
        payment.direction === "OUT" && payment.type.toLocaleLowerCase().includes("commission"),
    )
    .reduce((sum, payment) => sum + payment.usdAmount, 0);
  const earnedCommission = kpis.commissionEarned;
  const pendingCommission = Math.max(earnedCommission - paidCommission, 0);
  const commissionTarget = 25600;
  const lastFx = fxSeries.at(-1) ?? { cny: 1 / FX.cnyToUsd, kes: FX.usdToKes };
  const previousFx = fxSeries.at(-2) ?? lastFx;
  const fxRows = [
    { label: "USD / CNY", rate: lastFx.cny, previous: previousFx.cny },
    { label: "USD / KES", rate: lastFx.kes, previous: previousFx.kes },
    {
      label: "CNY / KES",
      rate: lastFx.kes / lastFx.cny,
      previous: previousFx.kes / previousFx.cny,
    },
  ];
  const attentionItems = [
    { label: "RFQs near quote deadline", count: 2, to: "/app/sourcing" },
    { label: "Shipment awaiting customs", count: customsCount, to: "/app/logistics" },
  ].filter((item) => item.count > 0);
  const attentionCount = attentionItems.reduce((sum, item) => sum + item.count, 0);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-fg">Dashboard</h1>
          <p className="mt-1.5 text-sm text-fg-muted">
            {new Intl.DateTimeFormat("en-KE", {
              weekday: "long",
              day: "numeric",
              month: "short",
              year: "numeric",
            }).format(today)}
            {" · "}
            {kpis.activeOrders} active orders
          </p>
        </div>
        <div
          aria-label="Recent order date range"
          className="inline-flex items-center gap-1 rounded-md border border-border bg-bg-glass p-1"
          role="group"
        >
          {([7, 30, 90] as const).map((days) => (
            <button
              key={days}
              aria-pressed={range === days}
              className={`min-h-9 min-w-11 rounded px-3 text-xs font-semibold transition-colors ${range === days ? "bg-primary text-bg" : "text-fg-muted hover:bg-bg-glass-hover hover:text-fg"}`}
              onClick={() => setRange(days)}
              type="button"
            >
              {days}d
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {quickActions.map(({ label, icon: Icon, to }) => (
          <Link
            key={label}
            to={to}
            className="glass-card group min-h-[112px] p-3 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-glow"
          >
            <div className="flex h-full flex-col items-start justify-between gap-4">
              <span className="rounded-md bg-primary/10 p-2 text-primary transition-colors group-hover:bg-primary/15">
                <Icon aria-hidden="true" className="h-5 w-5" />
              </span>
              <span className="text-[13px] font-medium text-fg">{label}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Active orders"
          value={String(kpis.activeOrders)}
          sub="+6 this week"
          icon={<Boxes size={18} />}
          tone="primary"
          delta="+6 this week"
        />
        <Stat
          label="Revenue MTD"
          value={usd(kpis.revenueMtd)}
          sub="+14.7% vs Aug"
          tone="accent"
          icon={<DollarSign size={18} />}
          delta="+14.7%"
        />
        <Stat
          label="Profit MTD"
          value={usd(kpis.profitMtd)}
          sub="19.1% margin"
          tone="success"
          icon={<TrendingUp size={18} />}
          delta="19.1% margin"
        />
        <Stat
          label="FX impact"
          value={usd(kpis.fxImpact)}
          sub="KES weakened 1.0%"
          tone="warning"
          icon={<AlertTriangle size={18} />}
          delta="KES −1.0%"
        />
      </div>

      {attentionCount > 0 ? (
        <section
          aria-label="Items needing attention"
          className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-md border border-danger/25 bg-danger/5 px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <span className="rounded-md bg-danger/10 p-2 text-danger">
              <AlertTriangle aria-hidden="true" size={17} />
            </span>
            <div>
              <p className="text-sm font-semibold text-fg">
                {attentionCount} {attentionCount === 1 ? "item needs" : "items need"} your attention
              </p>
              <p className="text-xs text-fg-muted">Quote windows and customs progress</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {attentionItems.map((item) => (
              <Link
                key={item.label}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-fg hover:text-danger"
                to={item.to}
              >
                <span className="font-mono text-danger">{item.count}</span>
                {item.label}
                <ArrowRight aria-hidden="true" size={13} />
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <Card>
          <CardHeader
            title="Recent orders"
            subtitle={`Created in the last ${range} days`}
            action={
              <Link
                to="/app/orders"
                className="inline-flex min-h-9 items-center gap-1 text-sm font-medium text-accent"
              >
                View all <ArrowRight size={14} />
              </Link>
            }
          />
          {orderCollection.hydrated ? (
            recentOrders.length > 0 ? (
              <>
                <div className="hidden md:block">
                  <Table head={["Code", "Client", "Status", "Amount", "ETA"]}>
                    {recentOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="h-10 border-b border-border/60 last:border-0 hover:bg-bg-glass-hover"
                      >
                        <td className="px-4 py-2.5 font-mono text-sm text-accent">
                          <Link to="/app/orders/$id" params={{ id: order.id }}>
                            {order.code}
                          </Link>
                        </td>
                        <td className="px-4 py-2.5 text-sm text-fg">{order.client}</td>
                        <td className="px-4 py-2.5 text-right">
                          <Badge tone={statusMeta[order.status].tone}>
                            {statusMeta[order.status].label}
                          </Badge>
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono text-sm text-fg">
                          {usd(order.valueUsd)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-sm text-fg-muted">
                          {order.eta}
                        </td>
                      </tr>
                    ))}
                  </Table>
                </div>
                <div className="space-y-3 md:hidden">
                  {recentOrders.map((order) => (
                    <Link
                      key={order.id}
                      className="block rounded-md border border-border bg-bg-glass p-4 hover:bg-bg-glass-hover"
                      params={{ id: order.id }}
                      to="/app/orders/$id"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="font-mono text-sm text-accent">{order.code}</span>
                        <Badge tone={statusMeta[order.status].tone}>
                          {statusMeta[order.status].label}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-fg">{order.client}</p>
                      <div className="mt-3 flex justify-between gap-3 border-t border-border pt-3 text-xs">
                        <span className="font-mono text-fg">{usd(order.valueUsd)}</span>
                        <span className="text-fg-muted">ETA {order.eta}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <EmptyState
                description={`There are no orders in the selected ${range}-day window.`}
                icon={Package}
                title="No recent orders"
                action={
                  <Link className="text-sm font-semibold text-accent" to="/app/orders">
                    View all orders
                  </Link>
                }
              />
            )
          ) : (
            <TableSkeleton rows={4} />
          )}
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Live FX rates" subtitle="Market reference · 28 Sep 2026" />
            <div className="divide-y divide-border">
              {fxRows.map((row) => {
                const change = ((row.rate - row.previous) / row.previous) * 100;
                return (
                  <div
                    key={row.label}
                    className="flex items-center justify-between gap-3 py-3 first:pt-0"
                  >
                    <span className="text-xs font-medium text-fg-muted">{row.label}</span>
                    <span className="ml-auto font-mono text-sm text-fg">
                      {row.rate.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                    </span>
                    <span
                      className={`min-w-14 text-right font-mono text-[11px] ${change <= 0 ? "text-success" : "text-warning"}`}
                    >
                      {change > 0 ? "+" : ""}
                      {change.toFixed(2)}%
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="mt-1 text-[11px] text-fg-subtle">
              Locked{" "}
              {new Date(FX.lockedAt).toLocaleString("en-KE", {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "UTC",
              })}{" "}
              UTC
            </p>
          </Card>

          <Card>
            <CardHeader
              title="Commission tracker"
              subtitle={`Target ${usd(commissionTarget)}`}
              action={<Radio aria-hidden="true" className="text-accent" size={17} />}
            />
            {[
              { label: "Earned", amount: earnedCommission, color: "bg-accent" },
              { label: "Pending", amount: pendingCommission, color: "bg-warning" },
              { label: "Paid", amount: paidCommission, color: "bg-success" },
            ].map((item) => (
              <div key={item.label} className="mb-3 last:mb-0">
                <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                  <span className="text-fg-muted">{item.label}</span>
                  <span className="font-mono text-fg">{usd(item.amount)}</span>
                </div>
                <div
                  aria-label={`${item.label} commission`}
                  aria-valuemax={commissionTarget}
                  aria-valuemin={0}
                  aria-valuenow={Math.round(item.amount)}
                  className="h-1.5 overflow-hidden rounded-full bg-bg-elev-2"
                  role="progressbar"
                >
                  <span
                    className={`block h-full rounded-full ${item.color}`}
                    style={{ width: `${Math.min((item.amount / commissionTarget) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>

      <section className="mt-6" aria-labelledby="recommendations-title">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 id="recommendations-title" className="text-base font-semibold text-fg">
              AI recommendations
            </h2>
            <p className="mt-1 text-xs text-fg-muted">
              Prioritized actions across your trade pipeline
            </p>
          </div>
          <Sparkles aria-hidden="true" className="text-accent" size={18} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {insights.slice(0, 4).map((insight) => {
            const destination = insightDestinations[insight.action] ?? "/app/reports";
            const highPriority = insight.priority === "HIGH";
            return (
              <article key={insight.action} className="glass-card flex min-h-[190px] flex-col p-4">
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-md bg-accent/10 p-2 text-accent">
                    <Sparkles aria-hidden="true" size={16} />
                  </span>
                  <span
                    className={`rounded-full border px-2 py-1 text-[10px] font-semibold tracking-wider ${highPriority ? "border-danger/25 bg-danger/10 text-danger" : "border-warning/25 bg-warning/10 text-warning"}`}
                  >
                    {insight.priority}
                  </span>
                </div>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-fg-muted">{insight.text}</p>
                <Link
                  className="mt-3 inline-flex min-h-9 items-center gap-1 text-xs font-semibold text-fg hover:text-accent"
                  to={destination}
                >
                  {insight.action} <ArrowRight aria-hidden="true" size={13} />
                </Link>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
