import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Sparkles, Trophy } from "lucide-react";
import { Badge, Button, Card, PageHeader, SectionTitle } from "@/components/kit";
import { FX, overall, quotes, sourcingRequests } from "@/lib/demo-data";

export const Route = createFileRoute("/app/sourcing/$id")({
  loader: ({ params }) => {
    const request = sourcingRequests.find((r) => r.id === params.id);
    if (!request) throw notFound();
    return request;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.code} — TradeHub` },
          { name: "description", content: `${loaderData.product} sourcing request for ${loaderData.client}.` },
          { property: "og:title", content: `${loaderData.code} — TradeHub` },
          { property: "og:description", content: `${loaderData.product} · ${loaderData.qty} units` },
        ]
      : [{ title: "Request not found — TradeHub" }, { name: "robots", content: "noindex" }],
  }),
  errorComponent: ({ error }) => <p role="alert" className="text-danger">{error.message}</p>,
  notFoundComponent: () => <p className="text-muted-foreground">That request does not exist.</p>,
  component: SourcingDetail,
});

function SourcingDetail() {
  const r = Route.useLoaderData();
  const ranked = [...quotes].sort((a, b) => overall(b) - overall(a));
  const winner = ranked[0]!;

  return (
    <>
      <Link to="/app/sourcing" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={15} /> All sourcing
      </Link>
      <PageHeader
        title={r.code}
        subtitle={`${r.client} · ${r.product} · ${r.qty.toLocaleString()} units · target $${r.targetPriceUsd.toFixed(2)}/unit`}
        actions={
          <>
            <Button variant="glass">Re-send RFQ</Button>
            <Button>Send client quotation</Button>
          </>
        }
      />

      <Card className="mb-6 border-accent/30 shadow-glow">
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone="accent">
            <Sparkles size={13} /> Recommended
          </Badge>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{winner.supplier}</span> via {winner.agent} —
            best overall at {overall(winner)}/10: strong quality score with a {winner.leadTimeDays}-day lead time
            and the most reliable agent history.
          </p>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-3">
        {ranked.map((q, i) => (
          <Card key={q.id} lift className={i === 0 ? "border-accent/40" : undefined}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold">{q.supplier}</p>
                <p className="text-sm text-muted-foreground">{q.agent}</p>
              </div>
              {i === 0 ? (
                <span className="text-accent">
                  <Trophy size={18} />
                </span>
              ) : null}
            </div>

            <p className="mt-4 font-mono text-3xl font-semibold">
              ¥{q.unitPriceCny}
              <span className="ml-2 text-sm text-subtle">
                ≈ ${(q.unitPriceCny * FX.cnyToUsd).toFixed(2)}
              </span>
            </p>

            <dl className="mt-4 space-y-2 text-sm">
              {[
                ["MOQ", q.moq.toLocaleString()],
                ["Lead time", `${q.leadTimeDays} days`],
                ["Agent fee", `${q.agentFeePct}%`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="font-mono">{v}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{q.qualityNote}</p>

            <div className="mt-4 space-y-2 border-t border-border pt-4">
              {[
                ["Price", q.priceScore],
                ["Quality", q.qualityScore],
                ["Speed", q.speedScore],
                ["Reliability", q.reliabilityScore],
              ].map(([k, v]) => (
                <div key={k as string} className="flex items-center gap-3">
                  <span className="w-20 text-xs text-subtle">{k}</span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                    <span
                      className="block h-full rounded-full bg-accent"
                      style={{ width: `${(v as number) * 10}%` }}
                    />
                  </span>
                  <span className="w-8 text-right font-mono text-xs">{v}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between rounded-md bg-secondary px-3 py-2.5">
              <span className="text-sm font-medium">Overall</span>
              <span className="font-mono text-lg font-bold text-accent">{overall(q)}</span>
            </div>

            <Button variant={i === 0 ? "primary" : "glass"} className="mt-4 w-full">
              Select this quote
            </Button>
          </Card>
        ))}
      </div>
    </>
  );
}
