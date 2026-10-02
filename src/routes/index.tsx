import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Boxes,
  Clock,
  Eye,
  Gauge,
  Globe2,
  MessageSquare,
  Receipt,
  ShieldCheck,
  Ship,
  TrendingUp,
  WifiOff,
} from "lucide-react";
import { Badge, Button, Card } from "@/components/kit";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TradeHub — From 1688 to Nairobi. Tracked. Trusted. Delivered." },
      {
        name: "description",
        content:
          "TradeHub is the trade and logistics platform for the China to Kenya import corridor: sourcing, RFQs, orders, shipments, FX and payments in one workspace.",
      },
      {
        property: "og:title",
        content: "TradeHub — China to Kenya trade, in one place",
      },
      {
        property: "og:description",
        content:
          "Source from 1688, compare agent quotes, track shipments to Nairobi and invoice in KES from one operating workspace.",
      },
    ],
  }),
  component: Landing,
});

const problems = [
  {
    icon: MessageSquare,
    title: "Scattered across chats",
    text: "Orders live in WhatsApp threads, WeChat groups and spreadsheets nobody trusts.",
  },
  {
    icon: Eye,
    title: "No visibility",
    text: "Clients call daily asking where their goods are. Nobody has a straight answer.",
  },
  {
    icon: TrendingUp,
    title: "FX eats the margin",
    text: "CNY, USD and KES move between quote and delivery. Profit disappears silently.",
  },
  {
    icon: WifiOff,
    title: "Connections drop",
    text: "Ports, warehouses and markets are exactly where the network fails.",
  },
];

const solutions = [
  {
    icon: Boxes,
    title: "One sourcing engine",
    text: "Inquiry to RFQ to scored agent quotes to a client quotation, with codes on every step.",
  },
  {
    icon: Ship,
    title: "Shipment tracking",
    text: "Production, QC, warehouse, transit, customs, delivery — with photos at every milestone.",
  },
  {
    icon: Gauge,
    title: "Live profit & KPIs",
    text: "Revenue, margin, FX impact, commissions and on-time rate, updated as orders move.",
  },
  {
    icon: WifiOff,
    title: "Built for the corridor",
    text: "Keep sourcing, shipment, FX and payment work visible in one operational workspace.",
  },
];

const steps = [
  {
    n: "01",
    t: "Client inquiry",
    d: "Photos and specs arrive on WhatsApp and become a sourcing request.",
  },
  { n: "02", t: "RFQ to agents", d: "Pushed to your China agents on WeChat with a deadline." },
  { n: "03", t: "Scored quotes", d: "Price, quality, speed and reliability ranked side by side." },
  { n: "04", t: "Quote the client", d: "Markup, service fee and locked FX, sent as a PDF." },
  {
    n: "05",
    t: "Produce & inspect",
    d: "1688 purchase, production photos, pre-shipment inspection.",
  },
  {
    n: "06",
    t: "Ship & deliver",
    d: "Warehouse, freight, customs, Nairobi delivery, final invoice.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-hero">
      <header className="sticky top-0 z-40 glass-strong">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Globe2 size={18} />
            </span>
            <span className="text-lg font-bold tracking-tight">TradeHub</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#problem" className="transition-colors hover:text-foreground">
              Problem
            </a>
            <a href="#solution" className="transition-colors hover:text-foreground">
              Platform
            </a>
            <a href="#flow" className="transition-colors hover:text-foreground">
              How it works
            </a>
          </nav>
          <Link to="/app">
            <Button>
              Open dashboard <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 grid-overlay opacity-60" />
        <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-china-red/20 blur-[100px] float-orb" />
        <div className="pointer-events-none absolute -right-20 top-40 h-96 w-96 rounded-full bg-kenya-green/20 blur-[110px] float-orb" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/15 blur-[120px]" />

        <div className="relative mx-auto max-w-5xl px-6 py-28 text-center">
          <Badge tone="accent" className="mx-auto">
            <ShieldCheck size={13} /> Trusted by 120+ Kenyan importers
          </Badge>
          <h1 className="mt-7 text-5xl font-bold leading-[1.05] tracking-[-0.04em] md:text-7xl">
            From China to Nairobi.
            <br />
            <span className="gradient-text">Tracked. Trusted. Delivered.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            One workspace for the China–Kenya import corridor: sourcing requests, agent quotes,
            production, freight, customs, FX and invoicing — and it keeps working when the network
            doesn't.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link to="/app">
              <Button className="px-6 py-3 text-base">
                Open the dashboard <ArrowRight size={18} />
              </Button>
            </Link>
            <a href="#flow">
              <Button variant="glass" className="px-6 py-3 text-base">
                See the workflow
              </Button>
            </a>
          </div>

          <div className="mx-auto mt-16 flex max-w-2xl items-center gap-4">
            <div className="text-right">
              <p className="font-mono text-sm font-semibold text-china-gold">CHINA</p>
              <p className="text-xs text-subtle">Shenzhen · Yiwu · Guangzhou</p>
            </div>
            <div className="relative h-px flex-1 overflow-hidden bg-border-strong">
              <span className="absolute inset-y-0 left-0 w-12 bg-accent data-flow" />
            </div>
            <div className="text-left">
              <p className="font-mono text-sm font-semibold text-kenya-green">KENYA</p>
              <p className="text-xs text-subtle">Mombasa · Nairobi · Nakuru</p>
            </div>
          </div>
        </div>
      </section>

      <section id="problem" className="mx-auto max-w-7xl px-6 py-20">
        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-china-red">
          The problem
        </p>
        <h2 className="mt-3 max-w-2xl text-4xl font-semibold tracking-[-0.02em]">
          Importing from China is run on memory and group chats
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {problems.map((p) => (
            <Card key={p.title} lift>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-china-red/15 text-china-red">
                <p.icon size={19} />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section id="solution" className="bg-bridge">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-accent">
            The platform
          </p>
          <h2 className="mt-3 max-w-2xl text-4xl font-semibold tracking-[-0.02em]">
            One bridge between your suppliers and your clients
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {solutions.map((s) => (
              <Card key={s.title} lift className="shadow-glow">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-accent/15 text-accent">
                  <s.icon size={19} />
                </span>
                <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="flow" className="mx-auto max-w-7xl px-6 py-20">
        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-kenya-sunset">
          How it works
        </p>
        <h2 className="mt-3 text-4xl font-semibold tracking-[-0.02em]">
          Ten stages, one trail of record
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((s) => (
            <Card key={s.n} lift>
              <span className="font-mono text-sm font-semibold text-accent">{s.n}</span>
              <h3 className="mt-2 text-lg font-semibold">{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
            </Card>
          ))}
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {[
            { icon: Clock, k: "93.4%", l: "On-time delivery rate" },
            { icon: Receipt, k: "$486K", l: "Tracked this month" },
            { icon: Ship, k: "132", l: "Shipments managed" },
          ].map((m) => (
            <Card key={m.l} className="text-center">
              <m.icon className="mx-auto text-accent" size={20} />
              <p className="mt-3 font-mono text-3xl font-bold">{m.k}</p>
              <p className="mt-1 text-sm text-muted-foreground">{m.l}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <Card className="relative overflow-hidden rounded-xl p-12 text-center">
          <div className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
          <div className="relative">
            <h2 className="text-4xl font-semibold tracking-[-0.02em]">
              Put your whole corridor on one screen
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Explore the full workspace with live demo data — dashboard, sourcing, orders, inbox,
              market analysis and reports.
            </p>
            <Link to="/app">
              <Button className="mt-7 px-6 py-3 text-base">
                Open dashboard <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
        </Card>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-8 text-sm text-subtle">
          <span>TradeHub · China ↔ Kenya trade management</span>
          <span>Nairobi · Shenzhen · Mombasa</span>
        </div>
      </footer>
    </div>
  );
}
