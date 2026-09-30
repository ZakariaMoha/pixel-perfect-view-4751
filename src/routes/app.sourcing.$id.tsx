import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Sparkles, Trophy } from "lucide-react";
import { Badge, Button, Card, PageHeader, SectionTitle } from "@/components/kit";
import { FX, overall, quotes, sourcingRequests } from "@/lib/demo-data";
import { usePersistentList } from "@/lib/use-persistent-list";

export const Route = createFileRoute("/app/sourcing/$id")({
  notFoundComponent: () => <p className="text-muted-foreground">That request does not exist.</p>,
  component: SourcingDetail,
});

function SourcingDetail() {
  const { id } = Route.useParams();
  const collection = usePersistentList("sourcing-requests", sourcingRequests);
  const r = collection.records.find((request) => request.id === id);
  if (!r) return <p className="text-muted-foreground">That request does not exist.</p>;

  const ranked = quotes
    .filter((quote) => quote.sourcingRequestId === r.id)
    .sort((a, b) => overall(b) - overall(a));
  const winner = ranked[0];

  return (
    <>
      <Link
        to="/app/sourcing"
        className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={15} /> All sourcing
      </Link>
      <PageHeader
        title={r.code}
        subtitle={`${r.client} · ${r.product} · ${r.qty.toLocaleString()} units · target $${r.targetPriceUsd.toFixed(2)}/unit`}
        actions={
          <>
            <Button variant="glass" onClick={() => collection.update(r.id, { stage: "RFQ sent" })}>
              Re-send RFQ
            </Button>
            <Button
              disabled={!winner}
              onClick={() => {
                if (winner)
                  collection.update(r.id, {
                    stage: "Quoted to client",
                    selectedQuoteId: winner.id,
                  });
              }}
            >
              Send client quotation
            </Button>
          </>
        }
      />

      {winner ? (
        <Card className="mb-6 border-accent/30 shadow-glow">
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone="accent">
              <Sparkles size={13} /> Recommended
            </Badge>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{winner.supplier}</span> via{" "}
              {winner.agent} — best overall at {overall(winner)}/10: strong quality score with a{" "}
              {winner.leadTimeDays}-day lead time and the most reliable agent history.
            </p>
          </div>
        </Card>
      ) : null}

      {ranked.length === 0 ? (
        <Card>No quotes have been submitted for this sourcing request yet.</Card>
      ) : (
        <div className="grid gap-5 lg:grid-cols-3">
          {ranked.map((q, i) => (
            <Card
              key={q.id}
              lift
              className={
                r.selectedQuoteId === q.id || (!r.selectedQuoteId && i === 0)
                  ? "border-accent/40"
                  : ""
              }
            >
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

              <Button
                variant={r.selectedQuoteId === q.id ? "accent" : i === 0 ? "primary" : "glass"}
                className="mt-4 w-full"
                onClick={() =>
                  collection.update(r.id, { selectedQuoteId: q.id, stage: "Quotes in" })
                }
              >
                {r.selectedQuoteId === q.id ? "Selected quote" : "Select this quote"}
              </Button>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
