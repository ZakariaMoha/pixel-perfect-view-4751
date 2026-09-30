import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({
  children,
  className = "",
  lift,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { lift?: boolean }) {
  return (
    <div className={cn("glass-card", lift && "card-lift", className)} {...props}>
      {children}
    </div>
  );
}

const tones: Record<string, string> = {
  primary: "bg-primary/15 text-primary border-primary/30",
  accent: "bg-accent/15 text-accent border-accent/30",
  success: "bg-success/15 text-success border-success/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  danger: "bg-danger/15 text-danger border-danger/30",
  info: "bg-info/15 text-info border-info/30",
  muted: "bg-secondary text-muted-foreground border-border",
};

export function StatusPill({
  status,
}: {
  status:
    "delivered" | "shipped" | "in_transit" | "production" | "pending" | "failed" | "cancelled";
}) {
  const config = {
    delivered: { color: "success", label: "Delivered" },
    shipped: { color: "info", label: "Shipped" },
    in_transit: { color: "info", label: "In Transit" },
    production: { color: "warn", label: "Production" },
    pending: { color: "muted", label: "Pending" },
    failed: { color: "danger", label: "Failed" },
    cancelled: { color: "muted", label: "Cancelled" },
  }[status];

  const pillClasses = {
    success: "bg-status-success/10 text-status-success",
    info: "bg-status-info/10 text-status-info",
    warn: "bg-status-warn/10 text-status-warn",
    danger: "bg-status-danger/10 text-status-danger",
    muted: "bg-status-muted/10 text-status-muted",
  } as const;

  const dotClasses = {
    success: "bg-status-success",
    info: "bg-status-info",
    warn: "bg-status-warn",
    danger: "bg-status-danger",
    muted: "bg-status-muted",
  } as const;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        pillClasses[config.color as keyof typeof pillClasses],
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          dotClasses[config.color as keyof typeof dotClasses],
        )}
      />
      {config.label}
    </span>
  );
}

export function DataCard({
  title,
  subtitle,
  status,
  fields,
  onClick,
}: {
  title: string;
  subtitle?: string;
  status?: Parameters<typeof StatusPill>[0]["status"];
  fields: Array<{ label: string; value: string; mono?: boolean }>;
  onClick?: () => void;
}) {
  return (
    <div className="glass-card min-h-[88px] cursor-pointer" onClick={onClick}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <span className="font-mono text-sm text-fg">{title}</span>
        {status ? <StatusPill status={status} /> : null}
      </div>
      {subtitle ? <p className="mb-3 text-sm text-fg-muted">{subtitle}</p> : null}
      <div className="space-y-1.5">
        {fields.map((field, index) => (
          <div key={`${field.label}-${index}`} className="flex items-center justify-between gap-3">
            <span className="text-xs text-fg-subtle">{field.label}</span>
            <span className={cn("text-sm text-fg", field.mono && "font-mono")}>{field.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Badge({
  children,
  tone = "muted",
  className,
}: {
  children: ReactNode;
  tone?: keyof typeof tones | string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.08em]",
        tones[tone] ?? tones["muted"],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Stat({
  label,
  value,
  sub,
  tone = "accent",
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "accent" | "primary" | "success" | "danger" | "warning";
  icon?: ReactNode;
}) {
  const ring: Record<string, string> = {
    accent: "text-accent",
    primary: "text-primary",
    success: "text-success",
    danger: "text-danger",
    warning: "text-warning",
  };
  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] uppercase tracking-[0.12em] text-fg-subtle">{label}</p>
        {icon ? (
          <span className={cn("rounded-md bg-bg-elev-2 p-2", ring[tone])}>{icon}</span>
        ) : null}
      </div>
      <p className="mt-3 font-mono text-3xl font-semibold tracking-tight text-fg">{value}</p>
      {sub ? <p className={cn("mt-1 text-xs text-fg-muted", ring[tone])}>{sub}</p> : null}
    </Card>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-fg">{title}</h1>
        {subtitle ? <p className="mt-1.5 text-sm text-fg-muted">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "glass" | "ghost" | "accent";
}) {
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary-hover shadow-primary",
    accent: "bg-accent text-accent-foreground hover:bg-accent-hover",
    glass: "glass text-foreground hover:border-border-strong",
    ghost: "text-muted-foreground hover:text-foreground hover:bg-secondary",
  };
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition-all active:scale-[0.98]",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-bg-glass backdrop-blur-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border">
              {head.map((h) => (
                <th
                  key={h}
                  className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-fg-subtle"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}

export function Row({ children }: { children: ReactNode }) {
  return (
    <tr className="h-10 border-b border-border/60 transition-colors last:border-0 hover:bg-bg-glass-hover">
      {children}
    </tr>
  );
}

export function Cell({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={cn("px-5 py-3 align-middle", className)}>{children}</td>;
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="mb-4 text-lg font-semibold tracking-tight text-fg">{children}</h2>;
}
