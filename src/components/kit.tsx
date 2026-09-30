import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
  lift,
}: {
  children: ReactNode;
  className?: string;
  lift?: boolean;
}) {
  return (
    <div className={cn("glass rounded-xl p-5", lift && "card-lift", className)}>{children}</div>
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
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-medium tracking-[0.02em]",
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
    <Card lift className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-subtle">{label}</p>
        {icon ? <span className={ring[tone]}>{icon}</span> : null}
      </div>
      <p className="mt-3 font-mono text-3xl font-semibold tracking-tight">{value}</p>
      {sub ? <p className={cn("mt-1 text-sm", ring[tone])}>{sub}</p> : null}
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
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        {subtitle ? <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p> : null}
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
    <div className="glass overflow-hidden rounded-xl">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border">
              {head.map((h) => (
                <th
                  key={h}
                  className="px-5 py-3.5 text-left text-[12px] font-semibold uppercase tracking-[0.08em] text-subtle"
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
    <tr className="border-b border-border/60 transition-colors last:border-0 hover:bg-secondary/60">
      {children}
    </tr>
  );
}

export function Cell({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={cn("px-5 py-4 align-middle", className)}>{children}</td>;
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="mb-4 text-lg font-semibold tracking-tight">{children}</h2>;
}
