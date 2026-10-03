import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bell,
  Boxes,
  Building2,
  CircleDollarSign,
  DollarSign,
  Factory,
  FileText,
  Gauge,
  Home,
  Inbox,
  Menu,
  MessageSquare,
  MoreHorizontal,
  Package,
  PackageSearch,
  Search,
  Settings,
  TrendingUp,
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
import { BrandLogo } from "@/components/brand";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

const PREFERENCES_EVENT = "tradehub:preferences-change";

export const Route = createFileRoute("/app")({
  component: AdminLayout,
});

const navigationSections = [
  {
    title: "OPERATIONS",
    items: [
      { to: "/app", label: "Dashboard", icon: Gauge, exact: true },
      { to: "/app/sourcing", label: "Sourcing", icon: Search },
      { to: "/app/orders", label: "Orders", icon: Package },
      { to: "/app/market", label: "Market analysis", icon: TrendingUp },
      { to: "/app/inbox", label: "Inbox", icon: MessageSquare },
    ],
  },
  {
    title: "PARTNERS",
    items: [
      { to: "/app/logistics", label: "Logistics", icon: Truck },
      { to: "/app/suppliers", label: "Suppliers", icon: Factory },
    ],
  },
  {
    title: "MONEY",
    items: [
      { to: "/app/reports", label: "Reports", icon: BarChart },
      { to: "/app/fx", label: "FX", icon: DollarSign },
      { to: "/app/payments", label: "Payments", icon: CircleDollarSign },
      { to: "/app/invoices", label: "Invoices", icon: FileText },
    ],
  },
  {
    title: "SYSTEM",
    items: [{ to: "/app/settings", label: "Settings", icon: Settings }],
  },
] as const;

const moreNav = [
  { to: "/app/inbox", label: "Inbox", icon: MessageSquare },
  { to: "/app/clients", label: "Clients", icon: Users },
  { to: "/app/agents", label: "Agents", icon: Building2 },
  { to: "/app/suppliers", label: "Suppliers", icon: Factory },
  { to: "/app/logistics", label: "Logistics", icon: Truck },
  { to: "/app/market", label: "Market analysis", icon: TrendingUp },
  { to: "/app/reports", label: "Reports", icon: BarChart },
  { to: "/app/fx", label: "FX", icon: DollarSign },
  { to: "/app/payments", label: "Payments", icon: CircleDollarSign },
  { to: "/app/invoices", label: "Invoices", icon: FileText },
  { to: "/app/settings", label: "Settings", icon: Settings },
] as const;

const mobilePrimaryNav = [
  { to: "/app", label: "Home", icon: Home, exact: true },
  { to: "/app/sourcing", label: "Sourcing", icon: Search },
  { to: "/app/orders", label: "Orders", icon: Package },
  { to: "/app/logistics", label: "Logistics", icon: Truck },
  { to: "/app/suppliers", label: "Suppliers", icon: Factory },
] as const;

function AdminLayout() {
  const isMobile = useIsMobile();
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
    <div className="min-h-screen w-full overflow-x-clip bg-bg">
      <div className="pointer-events-none fixed inset-0 grid-overlay opacity-40" />
      <div className="relative flex min-w-0 w-full">
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-bg-glass/70 md:flex">
          <Link to="/" className="flex items-center gap-2.5 px-5 py-5">
            <BrandLogo />
          </Link>
          <nav className="flex-1 space-y-4 overflow-y-auto px-3 pb-6">
            {navigationSections.map((section) => (
              <div key={section.title}>
                <p className="px-3 py-2 text-[11px] uppercase tracking-[0.12em] text-fg-faint">
                  {section.title}
                </p>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      activeOptions={{ exact: "exact" in item ? item.exact : false }}
                      activeProps={{ className: "border-primary/30 bg-primary/15 text-fg" }}
                      inactiveProps={{
                        className:
                          "border-transparent text-fg-muted hover:bg-bg-glass-hover hover:text-fg",
                      }}
                      className="flex min-h-11 items-center gap-3 rounded-md border px-3 text-sm font-medium transition-colors"
                    >
                      <item.icon size={17} />
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
          <div className="border-t border-border px-5 py-4 text-xs text-fg-subtle">
            <p className="font-mono text-fg">CNY 7.22 · KES 129.4</p>
            <p className="mt-1 text-fg-muted">Rates locked 26 Sep</p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-border bg-bg/70 px-4 py-3.5 backdrop-blur-xl md:px-6">
            {isMobile ? (
              <div className="flex items-center gap-2">
                <button
                  aria-label="Open navigation"
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-fg-muted hover:bg-bg-glass-hover hover:text-fg"
                  onClick={() => setMobileMenuOpen(true)}
                  type="button"
                >
                  <Menu size={20} />
                </button>
                <BrandLogo size={24} />
              </div>
            ) : (
              <div className="h-11 w-11" aria-hidden="true" />
            )}
            <div className="ml-auto flex items-center gap-3">
              <button
                aria-label="Open notifications"
                className="relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-md p-2 text-fg-muted transition-colors hover:bg-bg-glass-hover hover:text-fg"
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
                className="flex min-h-11 items-center gap-2.5 rounded-md bg-bg-glass px-2.5 py-1.5 hover:bg-bg-glass-hover"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-bg">
                  {displayName
                    .split(/\s+/)
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)
                    .toLocaleUpperCase()}
                </span>
                <span className="hidden text-sm font-medium text-fg sm:block">{displayName}</span>
              </Link>
            </div>
          </header>

          <main className="min-w-0 flex-1 px-4 py-6 pb-20 md:px-6 md:py-8 md:pb-8">
            <Outlet />
          </main>
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-4 text-xs text-fg-subtle md:px-6">
            <BrandLogo size={28} />
            <span>China to Kenya trade operations</span>
          </footer>
        </div>
      </div>

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-[280px] px-4">
          <SheetHeader className="px-1 text-left">
            <SheetTitle>TradeHub navigation</SheetTitle>
            <SheetDescription>Move through the workspace.</SheetDescription>
          </SheetHeader>
          <nav className="mt-6 max-h-[calc(100dvh-9rem)] space-y-4 overflow-y-auto pb-4">
            {navigationSections.map((section) => (
              <div key={section.title}>
                <p className="px-3 py-2 text-[11px] uppercase tracking-[0.12em] text-fg-faint">
                  {section.title}
                </p>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      activeOptions={{ exact: "exact" in item ? item.exact : false }}
                      activeProps={{ className: "bg-primary/15 text-fg border-primary/30" }}
                      inactiveProps={{ className: "text-fg-muted border-transparent" }}
                      className="flex min-h-11 items-center gap-3 rounded-md border px-3 text-sm font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <item.icon size={17} />
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      <Sheet open={mobileMoreOpen} onOpenChange={setMobileMoreOpen}>
        <SheetContent side="left" className="w-[280px] px-4">
          <SheetHeader className="px-1 text-left">
            <SheetTitle>More tools</SheetTitle>
            <SheetDescription>Client, agent, and operational views.</SheetDescription>
          </SheetHeader>
          <nav className="mt-6 max-h-[calc(100dvh-9rem)] space-y-1 overflow-y-auto pb-4">
            {moreNav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-fg-muted hover:bg-bg-glass-hover hover:text-fg"
                activeProps={{ className: "bg-primary/15 text-fg" }}
                onClick={() => setMobileMoreOpen(false)}
              >
                <item.icon size={17} />
                {item.label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-6 border-t border-border px-1 pb-[env(safe-area-inset-bottom)] md:hidden"
        style={{
          height: "56px",
          background: "rgba(15, 23, 42, 0.95)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        {mobilePrimaryNav.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={{ exact: "exact" in item ? item.exact : false }}
            activeProps={{ className: "text-primary" }}
            inactiveProps={{ className: "text-fg-muted" }}
            className="flex min-h-11 flex-col items-center justify-center gap-0.5 py-2 text-[10px]"
          >
            <item.icon size={18} />
            {item.label}
          </Link>
        ))}
        <button
          className="flex min-h-11 flex-col items-center justify-center gap-0.5 py-2 text-[10px] text-fg-muted"
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
                <p className="text-sm font-semibold text-fg">{title}</p>
                <p className="mt-1 text-sm text-fg-muted">{detail}</p>
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
