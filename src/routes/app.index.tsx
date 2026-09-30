import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  DollarSign,
  FileText,
  Package,
  Search,
  Send,
  Settings,
  Sparkles,
  TrendingUp,
  Truck,
} from "lucide-react";
import {
  Card,
  DataCard,
  PageHeader,
  SectionTitle,
  Stat,
  StatusPill,
  Table,
} from "@/components/kit";
import { usePersistentList } from "@/lib/use-persistent-list";
import { orders, statusMeta, usd } from "@/lib/demo-data";

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
  const recentOrders = orderCollection.records.slice(0, 4);

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Monday 28 September 2026 · Nairobi 14:18 · Shanghai 22:18"
      />

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {quickActions.map(({ label, icon: Icon, to }) => (
          <Link
            key={label}
            to={to}
            className="glass-card min-h-[72px] p-3 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-glow"
          >
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <Icon className="h-6 w-6 text-primary" />
              <span className="text-[13px] font-medium text-fg">{label}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Active orders"
          value={String(42)}
          sub="+6 this week"
          icon={<Boxes size={18} />}
          tone="primary"
        />
        <Stat
          label="Revenue MTD"
          value={usd(486200)}
          sub="+14.7% vs Aug"
          tone="accent"
          icon={<DollarSign size={18} />}
        />
        <Stat
          label="Profit MTD"
          value={usd(92840)}
          sub="19.1% margin"
          tone="success"
          icon={<TrendingUp size={18} />}
        />
        <Stat
          label="FX impact"
          value={usd(-3120)}
          sub="KES weakened 1.0%"
          tone="warning"
          icon={<AlertTriangle size={18} />}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Card>
            <div className="mb-4 flex items-center justify-between gap-3">
              <SectionTitle>Recent orders</SectionTitle>
              <Link
                to="/app/orders"
                className="inline-flex items-center gap-1 text-sm font-medium text-accent"
              >
                View all <ArrowRight size={14} />
              </Link>
            </div>

            <div className="hidden md:block">
              <Table head={["Code", "Client", "Status", "Value", "ETA"]}>
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="h-10 border-b border-border/60 last:border-0 hover:bg-bg-glass-hover"
                  >
                    <td className="px-5 py-3 font-mono text-sm text-accent">
                      <Link to="/app/orders/$id" params={{ id: order.id }}>
                        {order.code}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-sm text-fg">{order.client}</td>
                    <td className="px-5 py-3">
                      <StatusPill
                        status={
                          order.status === "DELIVERED"
                            ? "delivered"
                            : order.status === "IN_TRANSIT"
                              ? "in_transit"
                              : order.status === "PRODUCTION"
                                ? "production"
                                : order.status === "CANCELLED"
                                  ? "cancelled"
                                  : "pending"
                        }
                      />
                    </td>
                    <td className="px-5 py-3 font-mono text-sm text-fg">{usd(order.valueUsd)}</td>
                    <td className="px-5 py-3 text-sm text-fg-muted">{order.eta}</td>
                  </tr>
                ))}
              </Table>
            </div>

            <div className="space-y-3 md:hidden">
              {recentOrders.map((order) => (
                <DataCard
                  key={order.id}
                  title={order.code}
                  subtitle={order.client}
                  status={
                    order.status === "DELIVERED"
                      ? "delivered"
                      : order.status === "IN_TRANSIT"
                        ? "in_transit"
                        : order.status === "PRODUCTION"
                          ? "production"
                          : order.status === "CANCELLED"
                            ? "cancelled"
                            : "pending"
                  }
                  fields={[
                    { label: "Value", value: usd(order.valueUsd), mono: true },
                    { label: "Product", value: order.product },
                    { label: "ETA", value: order.eta },
                  ]}
                  onClick={() => undefined}
                />
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <SectionTitle>Live FX rates</SectionTitle>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-[11px] uppercase tracking-[0.12em] text-fg-subtle">
                  CNY → USD
                </span>
                <span className="font-mono text-lg text-fg">0.1385</span>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-[11px] uppercase tracking-[0.12em] text-fg-subtle">
                  USD → KES
                </span>
                <span className="font-mono text-lg text-fg">129.40</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.12em] text-fg-subtle">
                  Locked
                </span>
                <span className="font-mono text-sm text-fg-muted">26 Sep 08:00 UTC</span>
              </div>
            </div>
          </Card>

          <Card>
            <SectionTitle>Commission tracker</SectionTitle>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.12em] text-fg-subtle">
                  Earned
                </span>
                <span className="font-mono text-xl text-fg">{usd(18450)}</span>
              </div>
              <div className="h-2 rounded-full bg-bg-glass">
                <div className="h-full w-[72%] rounded-full bg-accent" />
              </div>
              <div className="flex items-center justify-between text-sm text-fg-muted">
                <span>Target</span>
                <span className="font-mono text-fg">{usd(25600)}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-6">
        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <SectionTitle>AI recommendations</SectionTitle>
            <Sparkles className="h-5 w-5 text-accent" />
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                priority: "High",
                title: "Lock pricing",
                description: "Two sourcing RFQs are within 12 hours of the target quote window.",
                to: "/app/sourcing",
              },
              {
                priority: "Medium",
                title: "Review agent",
                description: "A supplier agent has a 3.2% better win rate than last month.",
                to: "/app/agents",
              },
              {
                priority: "High",
                title: "Book space",
                description:
                  "Air freight capacity is tightening before the next Nairobi delivery window.",
                to: "/app/logistics",
              },
              {
                priority: "Low",
                title: "Monitor FX",
                description:
                  "The locked KES rate remains favorable with a small pricing buffer left.",
                to: "/app/fx",
              },
            ].map((item) => (
              <div key={item.title} className="glass-card min-h-[160px] p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="inline-flex rounded-full border border-border bg-bg-glass px-2 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-accent">
                    {item.priority}
                  </span>
                  <Sparkles className="h-4 w-4 text-accent" />
                </div>
                <h3 className="mb-2 text-base font-semibold text-fg">{item.title}</h3>
                <p className="text-sm leading-relaxed text-fg-muted">{item.description}</p>
                <Link
                  to={item.to}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent"
                >
                  Open <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
