import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarClock, Pause, Pencil, Play, Plus, Trash2 } from "lucide-react";
import { Button, Card, PageHeader } from "@/components/kit";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/app/payments/recurring")({
  component: RecurringExpensesPage,
});

type RecurringTemplate = {
  id: string;
  name: string;
  direction: "IN" | "OUT";
  type: string;
  recipient: string;
  amount: number;
  currency: "KES" | "CNY" | "USD";
  frequency: string;
  dueDate: string;
  active: boolean;
  note: string;
};
const seededTemplates: RecurringTemplate[] = [
  {
    id: "rent",
    name: "Yiwu warehouse rent",
    direction: "OUT",
    type: "Warehouse fee",
    recipient: "Yiwu Central Warehouse",
    amount: 3500,
    currency: "CNY",
    frequency: "Monthly",
    dueDate: "2026-10-05",
    active: true,
    note: "Storage unit 4B",
  },
  {
    id: "software",
    name: "Operations software",
    direction: "OUT",
    type: "Software",
    recipient: "Trade software subscription",
    amount: 49,
    currency: "USD",
    frequency: "Monthly",
    dueDate: "2026-10-12",
    active: true,
    note: "Monthly workspace subscription",
  },
];
const STORAGE_KEY = "tradehub:recurring-payments:v1";

function RecurringExpensesPage() {
  const [templates, setTemplates] = useState<RecurringTemplate[]>(seededTemplates);
  const [editing, setEditing] = useState<RecurringTemplate | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setTemplates(JSON.parse(saved) as RecurringTemplate[]);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const saveTemplates = (next: RecurringTemplate[]) => {
    setTemplates(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const next: RecurringTemplate = {
      id: editing?.id ?? crypto.randomUUID(),
      name: String(form.get("name") ?? ""),
      direction: String(form.get("direction") ?? "OUT") as "IN" | "OUT",
      type: String(form.get("type") ?? "Other"),
      recipient: String(form.get("recipient") ?? ""),
      amount: Number(form.get("amount") ?? 0),
      currency: String(form.get("currency") ?? "CNY") as RecurringTemplate["currency"],
      frequency: String(form.get("frequency") ?? "Monthly"),
      dueDate: String(form.get("dueDate") ?? ""),
      active: form.get("active") === "on",
      note: String(form.get("note") ?? ""),
    };
    saveTemplates(
      editing
        ? templates.map((template) => (template.id === editing.id ? next : template))
        : [...templates, next],
    );
    setEditing(null);
    setFormOpen(false);
  };

  return (
    <>
      <PageHeader
        title="Recurring expenses"
        subtitle="Reusable schedules for predictable supplier and operating costs."
        actions={
          <Button
            type="button"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus size={16} /> New template
          </Button>
        }
      />
      {formOpen ? (
        <Card className="mb-5">
          <form onSubmit={submit}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">{editing ? "Edit template" : "New template"}</h2>
              <label className="flex min-h-11 items-center gap-2 text-sm">
                <input name="active" type="checkbox" defaultChecked={editing?.active ?? true} />{" "}
                Active
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <label className="space-y-1 text-xs text-fg-subtle">
                Name
                <Input required name="name" defaultValue={editing?.name} />
              </label>
              <label className="space-y-1 text-xs text-fg-subtle">
                Direction
                <select
                  name="direction"
                  defaultValue={editing?.direction ?? "OUT"}
                  className="min-h-11 w-full rounded-md border border-border-strong bg-bg-elev-1 px-3 text-sm"
                >
                  <option>OUT</option>
                  <option>IN</option>
                </select>
              </label>
              <label className="space-y-1 text-xs text-fg-subtle">
                Type
                <Input required name="type" defaultValue={editing?.type} />
              </label>
              <label className="space-y-1 text-xs text-fg-subtle">
                Recipient
                <Input required name="recipient" defaultValue={editing?.recipient} />
              </label>
              <label className="space-y-1 text-xs text-fg-subtle">
                Amount
                <Input
                  required
                  min="0"
                  name="amount"
                  type="number"
                  defaultValue={editing?.amount}
                />
              </label>
              <label className="space-y-1 text-xs text-fg-subtle">
                Currency
                <select
                  name="currency"
                  defaultValue={editing?.currency ?? "CNY"}
                  className="min-h-11 w-full rounded-md border border-border-strong bg-bg-elev-1 px-3 text-sm"
                >
                  <option>CNY</option>
                  <option>KES</option>
                  <option>USD</option>
                </select>
              </label>
              <label className="space-y-1 text-xs text-fg-subtle">
                Frequency
                <select
                  name="frequency"
                  defaultValue={editing?.frequency ?? "Monthly"}
                  className="min-h-11 w-full rounded-md border border-border-strong bg-bg-elev-1 px-3 text-sm"
                >
                  {["Weekly", "Monthly", "Quarterly", "Yearly", "Custom"].map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-1 text-xs text-fg-subtle">
                Next due date
                <Input required name="dueDate" type="date" defaultValue={editing?.dueDate} />
              </label>
              <label className="space-y-1 text-xs text-fg-subtle">
                Notes
                <Input name="note" defaultValue={editing?.note} />
              </label>
            </div>
            <div className="mt-4 flex gap-2">
              <Button type="submit">Save template</Button>
              <Button
                type="button"
                variant="glass"
                onClick={() => {
                  setFormOpen(false);
                  setEditing(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      ) : null}
      <div className="space-y-3">
        {templates.map((template) => (
          <Card key={template.id} className="!p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex min-w-0 items-start gap-3">
                <span className="mt-1 rounded-md bg-accent/10 p-2 text-accent">
                  <CalendarClock size={18} />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold">{template.name}</h2>
                    <span
                      className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-wider ${template.active ? "bg-success/10 text-success" : "bg-secondary text-fg-subtle"}`}
                    >
                      {template.active ? "Active" : "Paused"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-fg-muted">
                    {template.recipient} · {template.frequency.toLowerCase()}
                  </p>
                  <p className="mt-1 text-xs text-fg-subtle">
                    Next due {template.dueDate}
                    {template.note ? ` · ${template.note}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="mr-2 font-mono text-lg text-primary">
                  {template.currency === "CNY" ? "¥" : template.currency === "USD" ? "$" : "KSh "}
                  {template.amount.toLocaleString()}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  aria-label="Edit template"
                  onClick={() => {
                    setEditing(template);
                    setFormOpen(true);
                  }}
                >
                  <Pencil size={16} />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  aria-label={template.active ? "Pause template" : "Resume template"}
                  onClick={() =>
                    saveTemplates(
                      templates.map((item) =>
                        item.id === template.id ? { ...item, active: !item.active } : item,
                      ),
                    )
                  }
                >
                  {template.active ? <Pause size={16} /> : <Play size={16} />}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="text-danger"
                  aria-label="Delete template"
                  onClick={() => saveTemplates(templates.filter((item) => item.id !== template.id))}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {!templates.length ? (
        <p className="py-12 text-center text-sm text-fg-muted">No recurring templates yet.</p>
      ) : null}
    </>
  );
}
