import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react";
import { Badge, Button, Card, PageHeader, SectionTitle } from "@/components/kit";
import { FX, kes, orders, statusMeta, timeline, usd } from "@/lib/demo-data";

export const Route = createFileRoute("/app/orders/$id")({
  loader: ({ params }) => {
    const order = orders.find((o) => o.id === params.id);
    if (!order) throw notFound();
    return order;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.code} — TradeHub` },
          { name: "description", content: `${loaderData.product} for ${loaderData.client}, ${loaderData.route}.` },
          { property: "og:title", content: `${loaderData.code} — TradeHub` },
          { property: "og:description", content: `${loaderData.product} · ${loaderData.route}` },
        ]
      : [
          { title: "Order not found — TradeHub" },
          { name: "robots", content: "noindex" },
        ],
  }),
  errorComponent: ({ error }) => <p role="alert" className="text-danger">{error.message}</p>,
  notFoundComponent: () => <p className="text-muted-foreground">That order does not exist.</p>,
  component: OrderDetail,
});

function OrderDetail() {
  const o = Route.useLoaderData();
  return (
    <>
      <Link to="/app/orders" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={15} /> All orders
      </Link>
      <PageHeader
        title={o.code}
        subtitle={`${o.client} · ${o.route}`}
        actions={
          <>
            <Badge tone={statusMeta[o.status].tone}>{statusMeta[o.status].label}</Badge>
            <Button variant="glass">Message client</Button>
            <Button>Advance stage</Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <SectionTitle>Order summary</SectionTitle>
            <dl className="grid gap-4 sm:grid-cols-2">
              {[
                ["Product", o.product],
                ["Category", o.category],
                ["Agent", o.agent],
                ["Supplier", o.supplier],
                ["Created", o.createdAt],
                ["ETA", o.eta],
                ["Weight", `${o.weightKg.toLocaleString()} kg`],
                ["Volume", `${o.cbm} CBM`],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[12px] uppercase tracking-[0.08em] text-subtle">{k}</dt>
                  <dd className="mt-1 text-sm font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card>
            <SectionTitle>Timeline</SectionTitle>
            <ol className="relative space-y-5 pl-6">
              <span className="absolute left-[7px] top-2 h-[calc(100%-1rem)] w-px bg-border" />
              {timeline.map((t) => (
                <li key={t.label} className="relative">
                  <span className={`absolute -left-6 top-0.5 ${t.done ? "text-success" : "text-subtle"}`}>
                    {t.done ? <CheckCircle2 size={15} /> : <Circle size={15} />}
                  </span>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm font-semibold">{t.label}</p>
                    <span className="font-mono text-xs text-subtle">{t.date}</span>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{t.detail}</p>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <SectionTitle>Financials</SectionTitle>
            <div className="space-y-3 text-sm">
              {[
                ["Order value", usd(o.valueUsd)],
                ["In KES (locked)", kes(o.valueUsd)],
                ["Net profit", usd(o.profitUsd)],
                ["Margin", `${((o.profitUsd / o.valueUsd) * 100).toFixed(1)}%`],
                ["Freight commission", usd(Math.round(o.valueUsd * 0.04))],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between border-b border-border pb-2.5 last:border-0">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-mono font-semibold">{v}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-subtle">
              FX locked at CNY {(1 / FX.cnyToUsd).toFixed(2)}/USD · KES {FX.usdToKes}/USD
            </p>
          </Card>

          <Card>
            <SectionTitle>Inspection</SectionTitle>
            <Badge tone="success">PASS</Badge>
            <p className="mt-3 text-sm text-muted-foreground">
              Pre-shipment inspection completed with 2 minor packaging notes. 18 photos attached.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="aspect-square rounded-md border border-border bg-background-elev" />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
