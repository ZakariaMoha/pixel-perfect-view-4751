import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/kit";
import { BrandLogo } from "@/components/brand";
import { PaymentStatusPill } from "@/components/payments/shared";
import { clients, payments } from "@/lib/demo-data";

export const Route = createFileRoute("/portal/$token")({ component: ClientPortalPage });

function ClientPortalPage() {
  const { token } = Route.useParams();
  const [tab, setTab] = useState<"Overview" | "Orders" | "Payments">("Payments");
  const client =
    clients.find(
      (item) => item.id === token || item.name.toLowerCase().replaceAll(" ", "-") === token,
    ) ?? clients[0];
  const visiblePayments = payments.filter(
    (payment) => payment.direction === "IN" && payment.counterparty === client?.name,
  );
  const linkedOrders = [
    ...new Set(
      visiblePayments
        .map((payment) => payment.orderCode)
        .filter((code): code is string => Boolean(code)),
    ),
  ];

  if (!client)
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center text-fg-muted">
        This client link is no longer available.
      </main>
    );

  return (
    <main className="min-h-screen bg-bg px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-4xl">
        <header className="flex items-center justify-between border-b border-border pb-5">
          <a href="/" className="flex min-h-11 items-center gap-2 text-fg">
            <BrandLogo size={36} />
          </a>
          <span className="text-xs text-fg-subtle">Secure client portal</span>
        </header>
        <div className="py-8">
          <p className="text-[11px] uppercase tracking-wider text-accent">Client account</p>
          <h1 className="mt-2 text-2xl font-bold">{client.name}</h1>
          <p className="mt-1 text-sm text-fg-muted">{client.city}, Kenya</p>
        </div>
        <nav aria-label="Client portal" className="mb-5 flex gap-1 border-b border-border">
          {(["Overview", "Orders", "Payments"] as const).map((view) => (
            <button
              key={view}
              type="button"
              onClick={() => setTab(view)}
              className={`min-h-11 border-b-2 px-4 text-sm ${tab === view ? "border-primary text-fg" : "border-transparent text-fg-muted"}`}
            >
              {view}
            </button>
          ))}
        </nav>
        {tab === "Payments" ? (
          <>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold">Payments</h2>
                <p className="mt-1 text-sm text-fg-subtle">
                  Payments received and awaiting confirmation
                </p>
              </div>
              <span className="text-xs text-fg-subtle">Amounts shown in KES</span>
            </div>
            <div className="space-y-3">
              {visiblePayments.map((payment) => (
                <Card key={payment.id} className="!p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs text-fg-subtle">{payment.code}</p>
                      <p className="mt-2 font-mono text-xl font-bold text-success">
                        KSh {payment.amount.toLocaleString("en-KE")}
                      </p>
                    </div>
                    <PaymentStatusPill status={payment.status} />
                  </div>
                  <div className="mt-4 grid gap-3 border-t border-border pt-3 text-sm sm:grid-cols-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-fg-subtle">Method</p>
                      <p className="mt-1">{payment.method}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-fg-subtle">Date</p>
                      <p className="mt-1">{payment.date}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-fg-subtle">
                        Reference
                      </p>
                      <p className="mt-1 break-all font-mono text-xs">
                        {payment.reference || "Awaiting confirmation"}
                      </p>
                    </div>
                  </div>
                  {payment.orderCode ? (
                    <button
                      type="button"
                      className="mt-4 inline-flex min-h-11 items-center gap-1 text-sm text-accent"
                      onClick={() => {
                        setTab("Orders");
                        window.history.replaceState(
                          {},
                          "",
                          `?tab=orders&order=${payment.orderCode}`,
                        );
                      }}
                    >
                      <ArrowUpRight size={15} /> Order {payment.orderCode}
                    </button>
                  ) : null}
                </Card>
              ))}
              {visiblePayments.length === 0 ? (
                <p className="py-10 text-center text-sm text-fg-subtle">No payment activity yet.</p>
              ) : null}
            </div>
          </>
        ) : tab === "Orders" ? (
          <Card>
            <h2 className="text-lg font-semibold">Your orders</h2>
            <div className="mt-4 divide-y divide-border">
              {linkedOrders.map((code) => (
                <div
                  id={`order-${code}`}
                  key={code}
                  className="flex min-h-14 items-center justify-between gap-3 py-3"
                >
                  <span className="font-mono text-sm">{code}</span>
                  <button
                    type="button"
                    onClick={() => setTab("Payments")}
                    className="text-sm text-accent"
                  >
                    View payments
                  </button>
                </div>
              ))}
              {linkedOrders.length === 0 ? (
                <p className="py-4 text-sm text-fg-subtle">No linked orders.</p>
              ) : null}
            </div>
          </Card>
        ) : (
          <Card>
            <h2 className="text-lg font-semibold">Account overview</h2>
            <p className="mt-2 text-sm text-fg-muted">
              {client.orders} orders managed with TradeHub.
            </p>
            <button
              type="button"
              onClick={() => setTab("Payments")}
              className="mt-4 inline-flex min-h-11 items-center text-sm text-accent"
            >
              View payment activity
            </button>
          </Card>
        )}
      </div>
    </main>
  );
}
