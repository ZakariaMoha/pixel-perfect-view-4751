// Demo dataset for TradeHub. Realistic sample data so every screen is alive.
// Swap for real backend queries later.

export type OrderStatus =
  | "QUOTED"
  | "DEPOSIT_PAID"
  | "PRODUCTION"
  | "QC"
  | "WAREHOUSE"
  | "IN_TRANSIT"
  | "CUSTOMS"
  | "DELIVERED"
  | "CANCELLED";

export const FX = { cnyToUsd: 0.1385, usdToKes: 129.4, lockedAt: "2026-09-26T08:00:00Z" };

export const usd = (n: number) => `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
export const kes = (n: number) => `KSh ${Math.round(n * FX.usdToKes).toLocaleString("en-US")}`;

export const kpis = {
  activeOrders: 42,
  revenueMtd: 486200,
  profitMtd: 92840,
  fxImpact: -3120,
  commissionEarned: 18450,
  avgOrderValue: 11580,
  onTimeRate: 93.4,
  agentWinRate: 38.2,
  supplierPassRate: 96.1,
};

export const revenueSeries = [
  { month: "Apr", revenue: 268000, profit: 48000, orders: 24 },
  { month: "May", revenue: 312000, profit: 57400, orders: 29 },
  { month: "Jun", revenue: 298000, profit: 52100, orders: 27 },
  { month: "Jul", revenue: 361000, profit: 68900, orders: 33 },
  { month: "Aug", revenue: 424000, profit: 81200, orders: 38 },
  { month: "Sep", revenue: 486200, profit: 92840, orders: 42 },
];

export const fxSeries = [
  { day: "Jul 01", cny: 7.24, kes: 128.1 },
  { day: "Jul 15", cny: 7.21, kes: 128.6 },
  { day: "Aug 01", cny: 7.18, kes: 129.0 },
  { day: "Aug 15", cny: 7.15, kes: 129.9 },
  { day: "Sep 01", cny: 7.22, kes: 130.4 },
  { day: "Sep 15", cny: 7.26, kes: 129.8 },
  { day: "Sep 28", cny: 7.22, kes: 129.4 },
];

export const categoryTrends = [
  { category: "Electronics", orders: 58, revenue: 214000 },
  { category: "Home & Kitchen", orders: 44, revenue: 138000 },
  { category: "Apparel", orders: 39, revenue: 96000 },
  { category: "Auto Parts", orders: 27, revenue: 121000 },
  { category: "Beauty", orders: 21, revenue: 47000 },
  { category: "Hardware", orders: 16, revenue: 38000 },
];

export const seasonal = [
  { month: "Jan", orders: 18 },
  { month: "Feb", orders: 11 },
  { month: "Mar", orders: 21 },
  { month: "Apr", orders: 24 },
  { month: "May", orders: 29 },
  { month: "Jun", orders: 27 },
  { month: "Jul", orders: 33 },
  { month: "Aug", orders: 38 },
  { month: "Sep", orders: 42 },
  { month: "Oct", orders: 51 },
  { month: "Nov", orders: 57 },
  { month: "Dec", orders: 34 },
];

export type Order = {
  id: string;
  code: string;
  client: string;
  product: string;
  category: string;
  status: OrderStatus;
  valueUsd: number;
  profitUsd: number;
  agent: string;
  supplier: string;
  eta: string;
  createdAt: string;
  route: string;
  weightKg: number;
  cbm: number;
};

export const orders: Order[] = [
  {
    id: "1",
    code: "KE-2026-0847",
    client: "Amani Electronics",
    product: "Bluetooth speakers 20W · 500 units",
    category: "Electronics",
    status: "IN_TRANSIT",
    valueUsd: 18400,
    profitUsd: 3720,
    agent: "Li Wei",
    supplier: "Shenzhen AudioTech",
    eta: "12 Oct 2026",
    createdAt: "02 Sep 2026",
    route: "Yiwu → Mombasa",
    weightKg: 1240,
    cbm: 8.4,
  },
  {
    id: "2",
    code: "KE-2026-0846",
    client: "Nairobi Home Depot",
    product: "Stainless cookware sets · 300 sets",
    category: "Home & Kitchen",
    status: "PRODUCTION",
    valueUsd: 12250,
    profitUsd: 2480,
    agent: "Zhang Min",
    supplier: "Guangdong KitchenPro",
    eta: "28 Oct 2026",
    createdAt: "09 Sep 2026",
    route: "Guangzhou → Nairobi",
    weightKg: 2100,
    cbm: 14.2,
  },
  {
    id: "3",
    code: "KE-2026-0845",
    client: "Tuskys Auto Spares",
    product: "Brake pads assorted · 1,200 pcs",
    category: "Auto Parts",
    status: "CUSTOMS",
    valueUsd: 9800,
    profitUsd: 2110,
    agent: "Chen Hao",
    supplier: "Hebei AutoLine",
    eta: "01 Oct 2026",
    createdAt: "21 Aug 2026",
    route: "Tianjin → Mombasa",
    weightKg: 3400,
    cbm: 6.1,
  },
  {
    id: "4",
    code: "KE-2026-0844",
    client: "Zawadi Beauty",
    product: "Hair extensions bundle · 800 packs",
    category: "Beauty",
    status: "QC",
    valueUsd: 7400,
    profitUsd: 1890,
    agent: "Li Wei",
    supplier: "Xuchang HairCo",
    eta: "18 Oct 2026",
    createdAt: "14 Sep 2026",
    route: "Yiwu → Nairobi (air)",
    weightKg: 420,
    cbm: 3.2,
  },
  {
    id: "5",
    code: "KE-2026-0843",
    client: "Kilimani Fashion House",
    product: "Winter jackets · 600 pcs",
    category: "Apparel",
    status: "DELIVERED",
    valueUsd: 15600,
    profitUsd: 3980,
    agent: "Zhang Min",
    supplier: "Hangzhou Garments",
    eta: "22 Sep 2026",
    createdAt: "04 Aug 2026",
    route: "Ningbo → Mombasa",
    weightKg: 1800,
    cbm: 22.6,
  },
  {
    id: "6",
    code: "KE-2026-0842",
    client: "Mombasa Hardware Ltd",
    product: "Power tool kits · 250 kits",
    category: "Hardware",
    status: "WAREHOUSE",
    valueUsd: 11200,
    profitUsd: 2320,
    agent: "Chen Hao",
    supplier: "Jinhua ToolWorks",
    eta: "20 Oct 2026",
    createdAt: "11 Sep 2026",
    route: "Yiwu → Mombasa",
    weightKg: 2750,
    cbm: 9.8,
  },
  {
    id: "7",
    code: "KE-2026-0841",
    client: "Amani Electronics",
    product: "Solar power banks · 1,000 units",
    category: "Electronics",
    status: "DEPOSIT_PAID",
    valueUsd: 14300,
    profitUsd: 3010,
    agent: "Li Wei",
    supplier: "Shenzhen SolarOne",
    eta: "05 Nov 2026",
    createdAt: "22 Sep 2026",
    route: "Shenzhen → Nairobi",
    weightKg: 980,
    cbm: 5.4,
  },
];

export const statusMeta: Record<OrderStatus, { label: string; tone: string }> = {
  QUOTED: { label: "Quoted", tone: "info" },
  DEPOSIT_PAID: { label: "Deposit paid", tone: "accent" },
  PRODUCTION: { label: "In production", tone: "warning" },
  QC: { label: "Quality check", tone: "warning" },
  WAREHOUSE: { label: "At warehouse", tone: "accent" },
  IN_TRANSIT: { label: "In transit", tone: "primary" },
  CUSTOMS: { label: "Customs", tone: "primary" },
  DELIVERED: { label: "Delivered", tone: "success" },
  CANCELLED: { label: "Cancelled", tone: "danger" },
};

export type SourcingRequest = {
  id: string;
  selectedQuoteId?: string;
  code: string;
  client: string;
  product: string;
  category: string;
  qty: number;
  stage: string;
  quotes: number;
  targetPriceUsd: number;
  deadline: string;
  createdAt: string;
};

export const sourcingRequests: SourcingRequest[] = [
  {
    id: "1",
    code: "SR-2026-0912",
    client: "Amani Electronics",
    product: "Wireless earbuds ANC",
    category: "Electronics",
    qty: 1500,
    stage: "Quotes in",
    quotes: 3,
    targetPriceUsd: 8.5,
    deadline: "29 Sep 2026",
    createdAt: "27 Sep 2026",
  },
  {
    id: "2",
    code: "SR-2026-0911",
    client: "Nairobi Home Depot",
    product: "Non-stick frying pans 28cm",
    category: "Home & Kitchen",
    qty: 800,
    stage: "RFQ sent",
    quotes: 1,
    targetPriceUsd: 4.2,
    deadline: "30 Sep 2026",
    createdAt: "27 Sep 2026",
  },
  {
    id: "3",
    code: "SR-2026-0910",
    client: "Zawadi Beauty",
    product: "Lash extension kits",
    category: "Beauty",
    qty: 2000,
    stage: "New inquiry",
    quotes: 0,
    targetPriceUsd: 1.9,
    deadline: "01 Oct 2026",
    createdAt: "28 Sep 2026",
  },
  {
    id: "4",
    code: "SR-2026-0909",
    client: "Tuskys Auto Spares",
    product: "LED headlight bulbs H4",
    category: "Auto Parts",
    qty: 3000,
    stage: "Quoted to client",
    quotes: 4,
    targetPriceUsd: 3.4,
    deadline: "26 Sep 2026",
    createdAt: "24 Sep 2026",
  },
];

export type Quote = {
  id: string;
  sourcingRequestId: string;
  agent: string;
  supplier: string;
  unitPriceCny: number;
  moq: number;
  leadTimeDays: number;
  agentFeePct: number;
  qualityNote: string;
  priceScore: number;
  qualityScore: number;
  speedScore: number;
  reliabilityScore: number;
};

export const quotes: Quote[] = [
  {
    id: "q1",
    sourcingRequestId: "1",
    agent: "Li Wei",
    supplier: "Shenzhen AudioTech",
    unitPriceCny: 58,
    moq: 500,
    leadTimeDays: 18,
    agentFeePct: 4,
    qualityNote: "Factory audited, ANC chip verified, 2-year warranty",
    priceScore: 8.4,
    qualityScore: 9.2,
    speedScore: 8.0,
    reliabilityScore: 9.4,
  },
  {
    id: "q2",
    sourcingRequestId: "2",
    agent: "Zhang Min",
    supplier: "Dongguan SoundLab",
    unitPriceCny: 52,
    moq: 1000,
    leadTimeDays: 25,
    agentFeePct: 5,
    qualityNote: "Cheapest option, samples acceptable, packaging basic",
    priceScore: 9.6,
    qualityScore: 7.1,
    speedScore: 6.4,
    reliabilityScore: 8.1,
  },
  {
    id: "q3",
    sourcingRequestId: "4",
    agent: "Chen Hao",
    supplier: "Shenzhen VoxPro",
    unitPriceCny: 64,
    moq: 300,
    leadTimeDays: 12,
    agentFeePct: 4.5,
    qualityNote: "Premium build, fastest line, higher unit cost",
    priceScore: 7.0,
    qualityScore: 9.5,
    speedScore: 9.6,
    reliabilityScore: 8.9,
  },
];

export const overall = (q: Quote) =>
  +(
    q.priceScore * 0.35 +
    q.qualityScore * 0.3 +
    q.speedScore * 0.2 +
    q.reliabilityScore * 0.15
  ).toFixed(1);

export const clients = [
  {
    id: "1",
    name: "Amani Electronics",
    city: "Nairobi",
    orders: 24,
    lifetimeUsd: 186400,
    lastOrder: "22 Sep 2026",
    tier: "Gold",
    risk: "Low",
  },
  {
    id: "2",
    name: "Nairobi Home Depot",
    city: "Nairobi",
    orders: 17,
    lifetimeUsd: 121300,
    lastOrder: "09 Sep 2026",
    tier: "Gold",
    risk: "Low",
  },
  {
    id: "3",
    name: "Tuskys Auto Spares",
    city: "Nakuru",
    orders: 12,
    lifetimeUsd: 88900,
    lastOrder: "21 Aug 2026",
    tier: "Silver",
    risk: "Medium",
  },
  {
    id: "4",
    name: "Zawadi Beauty",
    city: "Mombasa",
    orders: 9,
    lifetimeUsd: 54200,
    lastOrder: "14 Sep 2026",
    tier: "Silver",
    risk: "Low",
  },
  {
    id: "5",
    name: "Kilimani Fashion House",
    city: "Nairobi",
    orders: 7,
    lifetimeUsd: 47800,
    lastOrder: "04 Aug 2026",
    tier: "Bronze",
    risk: "High",
  },
  {
    id: "6",
    name: "Mombasa Hardware Ltd",
    city: "Mombasa",
    orders: 6,
    lifetimeUsd: 39600,
    lastOrder: "11 Sep 2026",
    tier: "Bronze",
    risk: "Low",
  },
];

export const agents = [
  {
    id: "1",
    name: "Li Wei",
    city: "Shenzhen",
    rating: 4.8,
    winRate: 44,
    avgResponseHrs: 2.1,
    quotes: 118,
    active: 9,
  },
  {
    id: "2",
    name: "Zhang Min",
    city: "Guangzhou",
    rating: 4.5,
    winRate: 36,
    avgResponseHrs: 3.8,
    quotes: 96,
    active: 7,
  },
  {
    id: "3",
    name: "Chen Hao",
    city: "Yiwu",
    rating: 4.6,
    winRate: 33,
    avgResponseHrs: 5.2,
    quotes: 84,
    active: 6,
  },
  {
    id: "4",
    name: "Wang Fei",
    city: "Hangzhou",
    rating: 4.1,
    winRate: 21,
    avgResponseHrs: 11.4,
    quotes: 41,
    active: 2,
  },
];

export const suppliers = [
  {
    id: "1",
    name: "Shenzhen AudioTech",
    category: "Electronics",
    passRate: 98,
    onTime: 95,
    orders: 31,
    priceTrend: "stable",
  },
  {
    id: "2",
    name: "Guangdong KitchenPro",
    category: "Home & Kitchen",
    passRate: 94,
    onTime: 89,
    orders: 22,
    priceTrend: "rising",
  },
  {
    id: "3",
    name: "Hebei AutoLine",
    category: "Auto Parts",
    passRate: 91,
    onTime: 84,
    orders: 18,
    priceTrend: "rising",
  },
  {
    id: "4",
    name: "Xuchang HairCo",
    category: "Beauty",
    passRate: 97,
    onTime: 92,
    orders: 15,
    priceTrend: "falling",
  },
];

export const logisticsPartners = [
  {
    id: "1",
    name: "Sino-Africa Freight",
    type: "Sea LCL",
    ratePerKg: 3.1,
    ratePerCbm: 148,
    reliability: 94,
    shipments: 63,
  },
  {
    id: "2",
    name: "Eagle Air Cargo",
    type: "Air",
    ratePerKg: 7.4,
    ratePerCbm: 0,
    reliability: 97,
    shipments: 41,
  },
  {
    id: "3",
    name: "Mombasa Line Logistics",
    type: "Sea FCL",
    ratePerKg: 2.2,
    ratePerCbm: 112,
    reliability: 89,
    shipments: 28,
  },
];

export const conversations = [
  {
    id: "1",
    name: "Amani Electronics",
    channel: "WHATSAPP",
    preview: "Can we add 200 more units to KE-2026-0847?",
    unread: 2,
    time: "09:42",
    order: "KE-2026-0847",
  },
  {
    id: "2",
    name: "Li Wei (Agent)",
    channel: "WECHAT",
    preview: "工厂说下周一可以出货 · Factory ships Monday",
    unread: 1,
    time: "08:17",
    order: "SR-2026-0912",
  },
  {
    id: "3",
    name: "Nairobi Home Depot",
    channel: "WHATSAPP",
    preview: "Deposit sent via M-Pesa, ref QGH7X2",
    unread: 0,
    time: "Yesterday",
    order: "KE-2026-0846",
  },
  {
    id: "4",
    name: "Zhang Min (Agent)",
    channel: "WECHAT",
    preview: "报价已提交 · Quote submitted",
    unread: 0,
    time: "Yesterday",
    order: "SR-2026-0911",
  },
];

export const thread = [
  {
    id: "m1",
    from: "Amani Electronics",
    dir: "IN",
    channel: "WHATSAPP",
    text: "Good morning! Any update on the speakers?",
    time: "09:31",
  },
  {
    id: "m2",
    from: "You",
    dir: "OUT",
    channel: "WHATSAPP",
    text: "Morning! Container cleared Mombasa port last night. ETA Nairobi 12 Oct.",
    time: "09:36",
  },
  {
    id: "m3",
    from: "Amani Electronics",
    dir: "IN",
    channel: "WHATSAPP",
    text: "Can we add 200 more units to KE-2026-0847?",
    time: "09:42",
  },
  {
    id: "m4",
    from: "Li Wei",
    dir: "IN",
    channel: "WECHAT",
    text: "工厂还有 300 台现货 (Factory has 300 units in stock)",
    time: "09:50",
  },
];

export const invoices = [
  {
    id: "1",
    number: "INV-2026-0311",
    client: "Amani Electronics",
    amountUsd: 18400,
    type: "Final",
    status: "Paid",
    date: "24 Sep 2026",
  },
  {
    id: "2",
    number: "INV-2026-0310",
    client: "Nairobi Home Depot",
    amountUsd: 6125,
    type: "Deposit",
    status: "Paid",
    date: "19 Sep 2026",
  },
  {
    id: "3",
    number: "INV-2026-0309",
    client: "Zawadi Beauty",
    amountUsd: 7400,
    type: "Final",
    status: "Pending",
    date: "17 Sep 2026",
  },
  {
    id: "4",
    number: "INV-2026-0308",
    client: "Mombasa Hardware Ltd",
    amountUsd: 5600,
    type: "Deposit",
    status: "Overdue",
    date: "02 Sep 2026",
  },
];

export const insights = [
  {
    priority: "HIGH",
    text: "Electronics unit prices rose 6.2% week-over-week in Shenzhen. Lock supplier pricing on SR-2026-0912 before Friday.",
    action: "Lock pricing",
  },
  {
    priority: "HIGH",
    text: "Kilimani Fashion House has not ordered in 55 days (KSh 6.2M lifetime). Send a WhatsApp check-in.",
    action: "Message client",
  },
  {
    priority: "MEDIUM",
    text: "Pre-Chinese-New-Year rush starts in 9 weeks. Pre-book container space for Oct–Nov peak (51+ orders forecast).",
    action: "Book space",
  },
  {
    priority: "MEDIUM",
    text: "Wang Fei averages 11.4h response time and a 21% win rate — below agent benchmark.",
    action: "Review agent",
  },
  {
    priority: "LOW",
    text: "KES weakened 1.0% this month. Locking FX now saves an estimated $1,840 on pending orders.",
    action: "Lock FX",
  },
];

export const timeline = [
  {
    label: "Inquiry received",
    detail: "WhatsApp images + specs from Amani Electronics",
    date: "02 Sep",
    done: true,
  },
  {
    label: "RFQ sent to 3 agents",
    detail: "WeChat Work push · 24h deadline",
    date: "02 Sep",
    done: true,
  },
  {
    label: "Quotes collected",
    detail: "3 quotes scored, Shenzhen AudioTech selected",
    date: "03 Sep",
    done: true,
  },
  {
    label: "Client quotation sent",
    detail: "PDF via WhatsApp · FX locked at 129.4 KES",
    date: "04 Sep",
    done: true,
  },
  { label: "Deposit received", detail: "M-Pesa 30% · KSh 714,096", date: "06 Sep", done: true },
  {
    label: "Production complete",
    detail: "500 units, photos uploaded",
    date: "21 Sep",
    done: true,
  },
  {
    label: "Pre-shipment inspection",
    detail: "PASS · 2 minor packaging notes",
    date: "23 Sep",
    done: true,
  },
  {
    label: "Departed Yiwu",
    detail: "Sino-Africa Freight · container SAFU2281",
    date: "25 Sep",
    done: true,
  },
  { label: "Arrive Mombasa", detail: "Customs clearance scheduled", date: "08 Oct", done: false },
  {
    label: "Delivered Nairobi",
    detail: "Final invoice + client review",
    date: "12 Oct",
    done: false,
  },
];
