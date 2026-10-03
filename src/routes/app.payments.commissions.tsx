import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckSquare, CircleDollarSign, Plus } from "lucide-react";
import { Button, Card, PageHeader, SectionTitle, Stat } from "@/components/kit";
import { agents, orders, payments } from "@/lib/demo-data";

export const Route = createFileRoute("/app/payments/commissions")({
  component: AgentCommissionsPage,
});

function AgentCommissionsPage() {
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const openOrders = orders.filter(
    (order) => order.status !== "DELIVERED" && order.status !== "CANCELLED",
  );
  const orderFee = (orderValue: number) => Math.round(orderValue * 0.045);
  const pendingTotal = openOrders.reduce((sum, order) => sum + orderFee(order.valueUsd), 0);

  return (
    <>
      <PageHeader
        title="Agent commissions"
        subtitle="Review sourcing fees and group earned commissions into payouts."
        actions={
          <a
            href={`/app/payments/new?bulk=${encodeURIComponent("Li Wei")}&orders=${selectedOrders.join(",")}`}
          >
            <Button type="button" disabled={!selectedOrders.length}>
              <Plus size={16} /> Pay bulk · {selectedOrders.length}
            </Button>
          </a>
        }
      />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Stat
          label="Pending fees"
          value={`$${pendingTotal.toLocaleString()}`}
          tone="warning"
          icon={<CircleDollarSign size={17} />}
        />
        <Stat label="Agents active" value={String(agents.length)} tone="accent" />
        <Stat label="Orders contributing" value={String(openOrders.length)} tone="primary" />
      </div>
      <div className="space-y-4">
        {agents.slice(0, 3).map((agent) => {
          const agentOrders = openOrders.filter((order) => order.agent === agent.name);
          const paidThisMonth = payments
            .filter(
              (payment) =>
                payment.direction === "OUT" &&
                payment.counterparty === agent.name &&
                payment.date.startsWith("2026-10"),
            )
            .reduce((sum, payment) => sum + payment.usdAmount, 0);
          const selectedAgentTotal = agentOrders
            .filter((order) => selectedOrders.includes(order.id))
            .reduce((sum, order) => sum + orderFee(order.valueUsd), 0);
          return (
            <Card key={agent.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{agent.name}</h2>
                  <p className="mt-1 text-sm text-fg-subtle">
                    {agent.city} · {agentOrders.length} active orders
                  </p>
                </div>
                <a
                  href={`/app/payments/new?bulk=${encodeURIComponent(agent.name)}&orders=${agentOrders.map((order) => order.id).join(",")}`}
                >
                  <Button type="button" variant="glass" disabled={!agentOrders.length}>
                    <Plus size={15} /> Pay selected
                  </Button>
                </a>
              </div>
              <div className="mt-4 grid gap-3 border-y border-border py-4 sm:grid-cols-3">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-fg-subtle">Total owed</p>
                  <p className="mt-1 font-mono text-lg text-warning">
                    ¥
                    {Math.round(
                      agentOrders.reduce((sum, order) => sum + orderFee(order.valueUsd), 0) /
                        0.1385,
                    ).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-fg-subtle">
                    Paid this month
                  </p>
                  <p className="mt-1 font-mono text-lg text-success">
                    ${paidThisMonth.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-fg-subtle">
                    Orders contributing
                  </p>
                  <p className="mt-1 font-mono text-lg">{agentOrders.length}</p>
                </div>
              </div>
              <SectionTitle>Pending order fees</SectionTitle>
              <div className="divide-y divide-border">
                {agentOrders.length ? (
                  agentOrders.map((order) => (
                    <label
                      key={order.id}
                      className="flex min-h-12 cursor-pointer items-center gap-3 py-2"
                    >
                      <input
                        className="h-4 w-4 accent-[var(--color-accent)]"
                        type="checkbox"
                        checked={selectedOrders.includes(order.id)}
                        onChange={(event) =>
                          setSelectedOrders((current) =>
                            event.target.checked
                              ? [...current, order.id]
                              : current.filter((id) => id !== order.id),
                          )
                        }
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block font-mono text-xs text-accent">{order.code}</span>
                        <span className="text-xs text-fg-subtle">{order.createdAt}</span>
                      </span>
                      <span className="font-mono text-sm">
                        ${orderFee(order.valueUsd).toLocaleString()}
                      </span>
                    </label>
                  ))
                ) : (
                  <p className="py-3 text-sm text-fg-subtle">No pending fees for this agent.</p>
                )}
              </div>
              {selectedAgentTotal > 0 ? (
                <p className="mt-3 flex items-center gap-2 text-sm text-accent">
                  <CheckSquare size={15} /> Selected fees: ${selectedAgentTotal.toLocaleString()}
                </p>
              ) : null}
            </Card>
          );
        })}
      </div>
    </>
  );
}
