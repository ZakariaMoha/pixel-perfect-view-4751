import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Button, Card, PageHeader, SectionTitle } from "@/components/kit";
import { Input } from "@/components/ui/input";

type Preferences = {
  name: string;
  email: string;
  timezone: string;
  currency: string;
  orderUpdates: boolean;
  paymentAlerts: boolean;
  weeklyReport: boolean;
  largeFont: boolean;
};

const defaultPreferences: Preferences = {
  name: "Joan Mwangi",
  email: "joan@tradehub.example",
  timezone: "Africa/Nairobi",
  currency: "KES",
  orderUpdates: true,
  paymentAlerts: true,
  weeklyReport: false,
  largeFont: false,
};

const PREFERENCES_EVENT = "tradehub:preferences-change";

export const Route = createFileRoute("/app/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const serialized = window.localStorage.getItem("tradehub:preferences:v1");
      if (serialized) {
        const parsed: unknown = JSON.parse(serialized);
        if (typeof parsed === "object" && parsed !== null) {
          setPreferences({ ...defaultPreferences, ...(parsed as Partial<Preferences>) });
        }
      }
    } catch {
      window.localStorage.removeItem("tradehub:preferences:v1");
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.fontSize = preferences.largeFont ? "18px" : "";
  }, [preferences.largeFont]);

  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    window.localStorage.setItem("tradehub:preferences:v1", JSON.stringify(preferences));
    window.dispatchEvent(new Event(PREFERENCES_EVENT));
    setSaved(true);
  };

  const reset = () => {
    setPreferences(defaultPreferences);
    window.localStorage.removeItem("tradehub:preferences:v1");
    window.dispatchEvent(new Event(PREFERENCES_EVENT));
    setSaved(false);
  };

  const update = <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
    setPreferences((current) => ({ ...current, [key]: value }));
    setSaved(false);
  };

  return (
    <>
      <PageHeader title="Settings" subtitle="Workspace profile and notification preferences" />
      <form className="max-w-3xl space-y-6" onSubmit={save}>
        <Card>
          <SectionTitle>Profile</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium">
              Display name
              <Input
                required
                value={preferences.name}
                onChange={(event) => update("name", event.target.value)}
              />
            </label>
            <label className="space-y-2 text-sm font-medium">
              Email address
              <Input
                required
                type="email"
                value={preferences.email}
                onChange={(event) => update("email", event.target.value)}
              />
            </label>
            <label className="space-y-2 text-sm font-medium">
              Timezone
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={preferences.timezone}
                onChange={(event) => update("timezone", event.target.value)}
              >
                <option value="Africa/Nairobi">Africa/Nairobi</option>
                <option value="Asia/Shanghai">Asia/Shanghai</option>
                <option value="UTC">UTC</option>
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium">
              Preferred display currency
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={preferences.currency}
                onChange={(event) => update("currency", event.target.value)}
              >
                <option value="KES">KES · Kenyan shilling</option>
                <option value="USD">USD · US dollar</option>
                <option value="CNY">CNY · Chinese yuan</option>
              </select>
            </label>
          </div>
        </Card>
        <Card>
          <SectionTitle>Notifications</SectionTitle>
          <div className="divide-y divide-border">
            {(
              [
                [
                  "orderUpdates",
                  "Order updates",
                  "Production, inspection, and shipment milestones",
                ],
                ["paymentAlerts", "Payment alerts", "Deposits, invoices, and overdue payments"],
                ["weeklyReport", "Weekly report", "A summary of sales and operations each Monday"],
              ] as const
            ).map(([key, label, description]) => (
              <label
                key={key}
                className="flex cursor-pointer items-center justify-between gap-4 py-4"
              >
                <span>
                  <span className="block text-sm font-medium">{label}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">{description}</span>
                </span>
                <input
                  aria-label={label}
                  checked={preferences[key]}
                  className="h-4 w-4 accent-primary"
                  type="checkbox"
                  onChange={(event) => update(key, event.target.checked)}
                />
              </label>
            ))}
            <label className="flex cursor-pointer items-center justify-between gap-4 py-4">
              <span>
                <span className="block text-sm font-medium">Large Font (Accessibility)</span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  Increase base font size for easier reading.
                </span>
              </span>
              <input
                aria-label="Large Font (Accessibility)"
                checked={preferences.largeFont}
                className="h-4 w-4 accent-primary"
                type="checkbox"
                onChange={(event) => update("largeFont", event.target.checked)}
              />
            </label>
          </div>
        </Card>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit">Save preferences</Button>
          <Button type="button" variant="glass" onClick={reset}>
            Reset defaults
          </Button>
          {saved ? (
            <span role="status" className="text-sm text-success">
              Preferences saved in this browser.
            </span>
          ) : null}
        </div>
      </form>
    </>
  );
}
