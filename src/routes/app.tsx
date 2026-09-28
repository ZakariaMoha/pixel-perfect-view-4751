import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import {
  Bell,
  Boxes,
  Building2,
  CircleDollarSign,
  Factory,
  Gauge,
  Globe2,
  Inbox,
  LineChart,
  PackageSearch,
  Receipt,
  Settings,
  Ship,
  Truck,
  Users,
  Wifi,
} from "lucide-react";
import { Badge } from "@/components/kit";

export const Route = createFileRoute("/app")({
  component: AdminLayout,
});

const nav = [
  { to: "/app", label: "Dashboard", icon: Gauge, exact: true },
  { to: "/app/sourcing", label: "Sourcing", icon: PackageSearch },
  { to: "/app/orders", label: "Orders", icon: Boxes },
  { to: "/app/inbox", label: "Inbox", icon: Inbox },
  { to: "/app/clients", label: "Clients", icon: Users },
  { to: "/app/agents", label: "Agents", icon: Building2 },
  { to: "/app/suppliers", label: "Suppliers", icon: Factory },
  { to: "/app/logistics", label: "Logistics", icon: Truck },
  { to: "/app/market", label: "Market analysis", icon: LineChart },
  { to: "/app/reports", label: "Reports & profit", icon: Ship },
  { to: "/app/fx", label: "FX & currency", icon: CircleDollarSign },
  { to: "/app/invoices", label: "Invoices", icon: Receipt },
  { to: "/app/settings", label: "Settings", icon: Settings },
] as const;

function AdminLayout() {
  return (
    <div className="min-h-screen bg-bridge">
      <div className="pointer-events-none fixed inset-0 grid-overlay opacity-40" />
      <div className="relative flex">
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-sidebar/70 backdrop-blur-xl lg:flex">
          <Link to="/" className="flex items-center gap-2.5 px-5 py-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Globe2 size={18} />
            </span>
            <span className="text-lg font-bold tracking-tight">TradeHub</span>
          </Link>
          <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-6">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: "exact" in item ? item.exact : false }}
                activeProps={{
                  className:
                    "bg-primary/15 text-foreground border-primary/30",
                }}
                inactiveProps={{
                  className:
                    "text-muted-foreground border-transparent hover:bg-secondary hover:text-foreground",
                }}
                className="flex items-center gap-3 rounded-md border px-3 py-2.5 text-sm font-medium transition-colors"
              >
                <item.icon size={17} />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="border-t border-border px-5 py-4 text-xs text-subtle">
            <p className="font-mono">CNY 7.22 · KES 129.4</p>
            <p className="mt-1">Rates locked 26 Sep</p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-border bg-background/70 px-6 py-3.5 backdrop-blur-xl">
            <div className="flex items-center gap-3 overflow-x-auto lg:hidden">
              {nav.slice(0, 5).map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="whitespace-nowrap text-sm text-muted-foreground"
                  activeProps={{ className: "text-foreground font-semibold" }}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-3">
              <Badge tone="success">
                <Wifi size={13} /> Synced
              </Badge>
              <button className="relative rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                <Bell size={18} />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
              </button>
              <div className="flex items-center gap-2.5 rounded-md bg-secondary px-2.5 py-1.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                  JM
                </span>
                <span className="hidden text-sm font-medium sm:block">Joan Mwangi</span>
              </div>
            </div>
          </header>

          <main className="min-w-0 flex-1 px-6 py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
