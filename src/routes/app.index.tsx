import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Boxes, Clock, DollarSign, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { Badge, Card, PageHeader, SectionTitle, Stat } from "@/components/kit";
import { usePersistentList } from "@/lib/use-persistent-list";
import { insights, kpis, orders, revenueSeries, statusMeta, usd } from "@/lib/demo-data";

const insightDestinations = {
  "Lock pricing": "/app/sourcing",
  "Message client": "/app/inbox",
  "Book space": "/app/logistics",
  "Review agent": "/app/agents",
  "Lock FX": "/app/fx",
} as const;

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
  const orderCollection = usePersistentList("orders", orders);

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Monday 28 September 2026 · Nairobi 14:18 · Shanghai 22:18"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Active orders"
          value={String(kpis.activeOrders)}
          sub="+6 this week"
          icon={<Boxes size={18} />}
        />
        <Stat
          label="Revenue MTD"
          value={usd(kpis.revenueMtd)}
          sub="+14.7% vs Aug"
          tone="success"
          icon={<TrendingUp size={18} />}
        />
        <Stat
          label="Profit MTD"
          value={usd(kpis.profitMtd)}
          sub="19.1% margin"
          tone="primary"
          icon={<DollarSign size={18} />}
        />
        <Stat
          label="FX impact"
          value={usd(kpis.fxImpact)}
          sub="KES weakened 1.0%"
          tone="danger"
          icon={<TrendingDown size={18} />}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Commission earned"
          value={usd(kpis.commissionEarned)}
          sub="Across 12 shipments"
        />
        <Stat label="Avg order value" value={usd(kpis.avgOrderValue)} sub="Last 30 days" />
        <Stat
          label="On-time rate"
          value={`${kpis.onTimeRate}%`}
          sub="Target 90%"
          tone="success"
          icon={<Clock size={18} />}
        />
        <Stat
          label="Supplier pass rate"
          value={`${kpis.supplierPassRate}%`}
          sub="Inspections passed"
          tone="success"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionTitle>Revenue & profit</SectionTitle>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSeries}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="prof" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="var(--subtle)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--subtle)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${v / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--background-alt)",
                    border: "1px solid var(--border-strong)",
                    borderRadius: 12,
                    color: "var(--foreground)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--primary)"
                  fill="url(#rev)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="var(--accent)"
                  fill="url(#prof)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <SectionTitle>AI recommendations</SectionTitle>
          <div className="space-y-3">
            {insights.map((i) => (
              <div key={i.text} className="rounded-md border border-border bg-secondary/60 p-3.5">
                <Badge
                  tone={
                    i.priority === "HIGH" ? "danger" : i.priority === "MEDIUM" ? "warning" : "info"
                  }
                >
                  <Sparkles size={12} /> {i.priority}
                </Badge>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{i.text}</p>
                <Link
                  to={insightDestinations[i.action as keyof typeof insightDestinations]}
                  className="mt-2 inline-block text-sm font-semibold text-accent hover:text-accent-hover"
                >
                  {i.action} →
                </Link>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <SectionTitle>Orders in motion</SectionTitle>
          <Link
            to="/app/orders"
            className="text-sm font-semibold text-accent hover:text-accent-hover"
          >
            View all →
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {orderCollection.records.slice(0, 6).map((o) => (
            <Link key={o.id} to="/app/orders/$id" params={{ id: o.id }}>
              <Card lift className="h-full">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm text-accent">{o.code}</p>
                    <p className="mt-1 font-semibold">{o.client}</p>
                  </div>
                  <Badge tone={statusMeta[o.status].tone}>{statusMeta[o.status].label}</Badge>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{o.product}</p>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-sm">
                  <span className="font-mono font-semibold">{usd(o.valueUsd)}</span>
                  <span className="text-subtle">ETA {o.eta}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
