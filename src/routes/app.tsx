import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Bell,
  Boxes,
  Building2,
  CircleDollarSign,
  Factory,
  Gauge,
  Globe2,
  Home,
  Inbox,
  LineChart,
  Menu,
  MessageSquare,
  MoreHorizontal,
  PackageSearch,
  Search,
  Receipt,
  Settings,
  Ship,
  Truck,
  Users,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/kit";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const PREFERENCES_EVENT = "tradehub:preferences-change";

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

const mobilePrimaryNav = [
  { to: "/app", label: "Home", icon: Home, exact: true },
  { to: "/app/sourcing", label: "Sourcing", icon: Search },
  { to: "/app/orders", label: "Orders", icon: Boxes },
  { to: "/app/inbox", label: "Inbox", icon: MessageSquare },
] as const;

const mobileMoreNav = nav.filter(
  (item) => !mobilePrimaryNav.some((primaryItem) => primaryItem.to === item.to),
);

function AdminLayout() {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsRead, setNotificationsRead] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const [displayName, setDisplayName] = useState("Joan Mwangi");

  useEffect(() => {
    const loadDisplayName = () => {
      try {
        const serialized = window.localStorage.getItem("tradehub:preferences:v1");
        if (serialized) {
          const preferences: unknown = JSON.parse(serialized);
          if (
            typeof preferences === "object" &&
            preferences !== null &&
            "name" in preferences &&
            typeof preferences.name === "string"
          ) {
            setDisplayName(preferences.name);
            return;
          }
        }
      } catch {
        window.localStorage.removeItem("tradehub:preferences:v1");
      }
      setDisplayName("Joan Mwangi");
    };

    loadDisplayName();
    window.addEventListener(PREFERENCES_EVENT, loadDisplayName);
    return () => window.removeEventListener(PREFERENCES_EVENT, loadDisplayName);
  }, []);

  return (
    <div className="min-h-screen bg-bridge">
      <div className="pointer-events-none fixed inset-0 grid-overlay opacity-40" />
      <div className="relative flex">
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-sidebar/70 md:flex">
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
                  className: "bg-primary/15 text-foreground border-primary/30",
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
          <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-border bg-background/70 px-4 py-3.5 backdrop-blur-xl md:px-6">
            <button
              aria-label="Open navigation"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground md:hidden"
              onClick={() => setMobileMenuOpen(true)}
              type="button"
            >
              <Menu size={20} />
            </button>
            <div className="ml-auto flex items-center gap-3">
              <button
                aria-label="Open notifications"
                className="relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                onClick={() => setNotificationsOpen(true)}
                type="button"
              >
                <Bell size={18} />
                {!notificationsRead ? (
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
                ) : null}
              </button>
              <Link
                to="/app/settings"
                className="flex min-h-11 items-center gap-2.5 rounded-md bg-secondary px-2.5 py-1.5 hover:bg-secondary/80"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                  {displayName
                    .split(/\s+/)
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)
                    .toLocaleUpperCase()}
                </span>
                <span className="hidden text-sm font-medium sm:block">{displayName}</span>
              </Link>
            </div>
          </header>

          <main className="min-w-0 flex-1 px-4 py-6 pb-20 md:px-6 md:py-8 md:pb-8">
            <Outlet />
          </main>
        </div>
      </div>
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-[min(86vw,20rem)] px-4">
          <SheetHeader className="px-1 text-left">
            <SheetTitle>TradeHub navigation</SheetTitle>
            <SheetDescription>Move through the workspace.</SheetDescription>
          </SheetHeader>
          <nav className="mt-6 space-y-1 overflow-y-auto">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: "exact" in item ? item.exact : false }}
                activeProps={{ className: "bg-primary/15 text-foreground border-primary/30" }}
                inactiveProps={{ className: "text-muted-foreground border-transparent" }}
                className="flex min-h-11 items-center gap-3 rounded-md border px-3 text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon size={17} />
                {item.label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
      <Sheet open={mobileMoreOpen} onOpenChange={setMobileMoreOpen}>
        <SheetContent side="left" className="w-[min(86vw,20rem)] px-4">
          <SheetHeader className="px-1 text-left">
            <SheetTitle>More workspace tools</SheetTitle>
            <SheetDescription>Manage the rest of your corridor operations.</SheetDescription>
          </SheetHeader>
          <nav className="mt-6 space-y-1 overflow-y-auto">
            {mobileMoreNav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "bg-primary/15 text-foreground" }}
                onClick={() => setMobileMoreOpen(false)}
              >
                <item.icon size={17} />
                {item.label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-background/95 px-2 pb-[env(safe-area-inset-bottom)] md:hidden">
        {mobilePrimaryNav.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={{ exact: "exact" in item ? item.exact : false }}
            activeProps={{ className: "text-primary" }}
            className="flex min-h-11 flex-col items-center justify-center gap-0.5 py-2 text-[11px] text-muted-foreground"
          >
            <item.icon size={18} />
            {item.label}
          </Link>
        ))}
        <button
          className="flex min-h-11 flex-col items-center justify-center gap-0.5 py-2 text-[11px] text-muted-foreground"
          onClick={() => setMobileMoreOpen(true)}
          type="button"
        >
          <MoreHorizontal size={18} />
          More
        </button>
      </nav>
      <Dialog open={notificationsOpen} onOpenChange={setNotificationsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notifications</DialogTitle>
            <DialogDescription>Recent updates from the TradeHub workspace.</DialogDescription>
          </DialogHeader>
          <div className="divide-y divide-border">
            {[
              [
                "Order milestone",
                "KE-2026-0847 cleared Mombasa port; Nairobi delivery is scheduled for 12 Oct.",
              ],
              ["Payment received", "Nairobi Home Depot deposit was recorded against KE-2026-0846."],
              ["New quote", "Li Wei submitted a supplier quote for SR-2026-0912."],
            ].map(([title, detail]) => (
              <div key={title} className="py-3">
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="glass"
              onClick={() => {
                setNotificationsRead(true);
                setNotificationsOpen(false);
              }}
            >
              Mark all as read
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
