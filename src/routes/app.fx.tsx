import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, PageHeader, SectionTitle, Stat } from "@/components/kit";
import { Input } from "@/components/ui/input";
import { FX, fxSeries } from "@/lib/demo-data";

export const Route = createFileRoute("/app/fx")({
  component: FxPage,
});

function FxPage() {
  const [amount, setAmount] = useState("1000");
  const [cnyPerUsd, setCnyPerUsd] = useState(1 / FX.cnyToUsd);
  const [kesPerUsd, setKesPerUsd] = useState(FX.usdToKes);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const savedRates = window.localStorage.getItem("tradehub:fx-rates:v1");
      if (savedRates) {
        const parsed: unknown = JSON.parse(savedRates);
        if (
          typeof parsed === "object" &&
          parsed !== null &&
          "cnyPerUsd" in parsed &&
          "kesPerUsd" in parsed
        ) {
          const rates = parsed as { cnyPerUsd: number; kesPerUsd: number };
          if (Number.isFinite(rates.cnyPerUsd) && Number.isFinite(rates.kesPerUsd)) {
            setCnyPerUsd(rates.cnyPerUsd);
            setKesPerUsd(rates.kesPerUsd);
          }
        }
      }
    } catch {
      window.localStorage.removeItem("tradehub:fx-rates:v1");
    }
  }, []);

  const numericAmount = Math.max(0, Number(amount) || 0);
  const usdAmount = numericAmount / cnyPerUsd;
  const saveRates = () => {
    window.localStorage.setItem(
      "tradehub:fx-rates:v1",
      JSON.stringify({ cnyPerUsd, kesPerUsd, savedAt: new Date().toISOString() }),
    );
    setSaved(true);
  };

  return (
    <>
      <PageHeader
        title="FX & currency"
        subtitle="Working conversion estimates and locally saved rate assumptions"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Stat
          label="CNY per USD"
          value={cnyPerUsd.toFixed(4)}
          sub={`USD 1 = CNY ${cnyPerUsd.toFixed(4)}`}
          tone="primary"
        />
        <Stat
          label="KES per USD"
          value={kesPerUsd.toFixed(2)}
          sub={`USD 1 = KSh ${kesPerUsd.toFixed(2)}`}
          tone="success"
        />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle>Currency converter</SectionTitle>
          <label className="block space-y-2 text-sm font-medium" htmlFor="cny-amount">
            Amount in CNY
          </label>
          <Input
            id="cny-amount"
            className="mt-2 max-w-sm font-mono"
            inputMode="decimal"
            min="0"
            type="number"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
          <dl className="mt-6 space-y-3">
            <div className="flex justify-between border-b border-border pb-3">
              <dt className="text-muted-foreground">USD estimate</dt>
              <dd className="font-mono font-semibold">
                $
                {usdAmount.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </dd>
            </div>
            <div className="flex justify-between border-b border-border pb-3">
              <dt className="text-muted-foreground">KES estimate</dt>
              <dd className="font-mono font-semibold">
                KSh {(usdAmount * kesPerUsd).toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Assumption</dt>
              <dd className="text-right text-xs text-subtle">
                Excludes transfer fees and bank spreads
              </dd>
            </div>
          </dl>
        </Card>
        <Card>
          <SectionTitle>Rate assumptions</SectionTitle>
          <div className="space-y-4">
            <label className="block space-y-2 text-sm font-medium" htmlFor="cny-rate">
              CNY per USD
              <Input
                id="cny-rate"
                min="0.0001"
                step="0.0001"
                type="number"
                value={cnyPerUsd}
                onChange={(event) => {
                  setCnyPerUsd(Number(event.target.value));
                  setSaved(false);
                }}
              />
            </label>
            <label className="block space-y-2 text-sm font-medium" htmlFor="kes-rate">
              KES per USD
              <Input
                id="kes-rate"
                min="0.0001"
                step="0.01"
                type="number"
                value={kesPerUsd}
                onChange={(event) => {
                  setKesPerUsd(Number(event.target.value));
                  setSaved(false);
                }}
              />
            </label>
            <button
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
              type="button"
              onClick={saveRates}
            >
              Save rate assumptions
            </button>
            {saved ? (
              <p role="status" className="text-sm text-success">
                Rates saved in this browser.
              </p>
            ) : null}
            <p className="text-xs text-subtle">
              Demo reference rates are based on {FX.lockedAt.slice(0, 10)}. Saved assumptions do not
              update historical order locks.
            </p>
          </div>
        </Card>
      </div>
      <Card className="mt-6">
        <SectionTitle>Recent market reference</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {fxSeries.slice(-4).map((point) => (
            <div key={point.day} className="border-l-2 border-accent pl-3">
              <p className="text-xs text-subtle">{point.day}</p>
              <p className="mt-1 font-mono text-sm">USD/CNY {point.cny.toFixed(2)}</p>
              <p className="font-mono text-sm">USD/KES {point.kes.toFixed(1)}</p>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
