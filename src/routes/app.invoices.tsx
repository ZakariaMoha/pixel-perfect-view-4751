import { useMemo, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  CheckCircle2,
  Download,
  FileText,
  PackageCheck,
  Plus,
  Printer,
  Search,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import { Button, Card, PageHeader, Stat, Table } from "@/components/kit";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createDocumentPdf } from "@/lib/document-pdf";
import { FX, invoices, orders, type Order } from "@/lib/demo-data";
import { usePersistentList } from "@/lib/use-persistent-list";

export const Route = createFileRoute("/app/invoices")({ component: DocumentsPage });

type DocumentKind =
  "Invoice" | "Proforma invoice" | "Packing list" | "Delivery note" | "Sales contract";
type DocumentRecord = {
  id: string;
  number: string;
  client: string;
  amountUsd: number;
  type: string;
  status: string;
  date: string;
  kind?: DocumentKind;
  orderCode?: string;
  description?: string;
  dueDate?: string;
};

const documentKinds: DocumentKind[] = [
  "Invoice",
  "Proforma invoice",
  "Packing list",
  "Delivery note",
  "Sales contract",
];
const money = (amount: number, currency = "USD") =>
  new Intl.NumberFormat("en-KE", { style: "currency", currency, maximumFractionDigits: 2 }).format(
    amount,
  );
const today = () => new Date().toISOString().slice(0, 10);
const isFinancialDocument = (record: DocumentRecord) =>
  record.kind ? record.kind === "Invoice" || record.kind === "Proforma invoice" : true;
const hasDocumentValue = (record: DocumentRecord) =>
  isFinancialDocument(record) || record.kind === "Sales contract";
const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character] ?? character;
  });

function nextDocumentNumber(records: DocumentRecord[], kind: DocumentKind) {
  const year = new Date().getFullYear();
  const prefix =
    kind === "Packing list"
      ? "PKL"
      : kind === "Delivery note"
        ? "DN"
        : kind === "Proforma invoice"
          ? "PRO"
          : kind === "Sales contract"
            ? "CTR"
            : "INV";
  const highestSequence = records.reduce((highest, record) => {
    const match = record.number.match(new RegExp(`^${prefix}-${year}-(\\d+)$`));
    return Math.max(highest, match ? Number(match[1]) : 0);
  }, 0);
  return `${prefix}-${year}-${String(highestSequence + 1).padStart(4, "0")}`;
}

function printDocument(record: DocumentRecord, order?: Order) {
  const printWindow = window.open("", "_blank", "width=900,height=720");
  if (!printWindow) {
    toast.error("Allow pop-ups to print or save this document as PDF.");
    return;
  }

  const kind = record.kind ?? `${record.type} invoice`;
  const isFinancial = isFinancialDocument(record);
  const quantityLine = order
    ? `<tr><td>${escapeHtml(order.product)}</td><td>${order.weightKg.toLocaleString()} kg</td><td>${order.cbm.toLocaleString()} m³</td></tr>`
    : `<tr><td>${escapeHtml(record.description ?? "TradeHub order")}</td><td>—</td><td>—</td></tr>`;
  const total = money(record.amountUsd);
  const kesTotal = money(record.amountUsd * FX.usdToKes, "KES");

  printWindow.document
    .write(`<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(record.number)}</title><style>
    *{box-sizing:border-box}body{margin:0;padding:48px;color:#17202b;font:14px/1.5 Arial,sans-serif}.sheet{max-width:800px;margin:auto}.top{display:flex;justify-content:space-between;border-bottom:2px solid #ff6b35;padding-bottom:24px}.brand-lockup{display:flex;align-items:center;gap:12px}.brand-mark{width:48px;height:48px}.brand{font-size:22px;font-weight:700}.muted{color:#65717d}.kind{text-transform:uppercase;letter-spacing:2px;font-size:12px;color:#65717d}.number{font:700 22px monospace;margin:4px 0 0}.grid{display:grid;grid-template-columns:1fr 1fr;gap:30px;margin:32px 0}.label{font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#65717d}.value{font-weight:600;margin-top:4px}table{width:100%;border-collapse:collapse;margin:32px 0}th,td{text-align:left;padding:12px 10px;border-bottom:1px solid #dce1e5}th{font-size:11px;text-transform:uppercase;color:#65717d}.total{margin-left:auto;width:270px}.total div{display:flex;justify-content:space-between;padding:7px 0}.grand{font-size:18px;font-weight:700;border-top:2px solid #17202b;margin-top:8px;padding-top:12px!important}.foot{border-top:1px solid #dce1e5;margin-top:55px;padding-top:16px;color:#65717d;font-size:12px}@media print{body{padding:24px}}
  </style></head><body><main class="sheet"><header class="top"><div class="brand-lockup"><img class="brand-mark" src="${window.location.origin}/tradehub-mark.svg" alt=""><div><div class="brand">TradeHub</div><div class="muted">Global sourcing & logistics</div></div></div><div style="text-align:right"><div class="kind">${escapeHtml(kind)}</div><div class="number">${escapeHtml(record.number)}</div></div></header><section class="grid"><div><div class="label">${isFinancial ? "Bill to" : "Prepared for"}</div><div class="value">${escapeHtml(record.client)}</div><div class="muted">Kenya</div></div><div><div class="label">Document date</div><div class="value">${escapeHtml(record.date)}</div><div class="label" style="margin-top:12px">Order reference</div><div class="value">${escapeHtml(record.orderCode ?? "—")}</div></div></section><table><thead><tr><th>Description</th><th>Gross weight</th><th>Volume</th></tr></thead><tbody>${quantityLine}</tbody></table>${isFinancial ? `<section class="total"><div><span>Amount (USD)</span><strong>${total}</strong></div><div><span>Reference (KES)</span><strong>${kesTotal}</strong></div><div class="grand"><span>Total</span><span>${total}</span></div></section>` : ""}<footer class="foot">${isFinancial ? `${record.dueDate ? `Payment due: ${escapeHtml(record.dueDate)} · ` : ""}FX reference: 1 USD = ${FX.usdToKes} KES. Please quote the document number with your payment.` : "This document is for shipment handling and is not a tax invoice."}</footer></main><script>window.addEventListener('load',()=>window.print())</script></body></html>`);
  printWindow.document.close();
}

function pdfForDocument(record: DocumentRecord, order?: Order) {
  return createDocumentPdf({
    number: record.number,
    kind: record.kind ?? `${record.type} invoice`,
    client: record.client,
    ...(order?.supplier ? { supplier: order.supplier } : {}),
    amountUsd: record.amountUsd,
    usdToKes: FX.usdToKes,
    ...(record.orderCode ? { orderCode: record.orderCode } : {}),
    ...(order?.product || record.description
      ? { description: order?.product ?? record.description }
      : {}),
    date: record.date,
    ...(record.dueDate ? { dueDate: record.dueDate } : {}),
    ...(order?.route ? { route: order.route } : {}),
    ...(order?.eta ? { eta: order.eta } : {}),
    ...(order ? { weightKg: order.weightKg, cbm: order.cbm } : {}),
  });
}

function downloadDocument(record: DocumentRecord, order?: Order) {
  const url = URL.createObjectURL(pdfForDocument(record, order));
  const anchor = window.document.createElement("a");
  anchor.href = url;
  anchor.download = `${record.number.toLocaleLowerCase()}.pdf`;
  window.document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function shareDocument(record: DocumentRecord, order?: Order) {
  const file = new File([pdfForDocument(record, order)], `${record.number}.pdf`, {
    type: "application/pdf",
  });
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: record.number });
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        toast.error("Could not share this PDF. Download it to share from your device.");
      }
    }
    return;
  }
  downloadDocument(record, order);
  toast.success("PDF downloaded. Share it from your device.");
}

function DocumentsPage() {
  const collection = usePersistentList<DocumentRecord>("invoices", invoices);
  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState("All documents");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(orders[0]?.id ?? "");
  const [selectedKind, setSelectedKind] = useState<DocumentKind>("Invoice");
  const [dueDate, setDueDate] = useState("");

  const visibleRecords = useMemo(
    () =>
      collection.records.filter((record) => {
        const kind = record.kind ?? `${record.type} invoice`;
        return (
          (kindFilter === "All documents" || kind === kindFilter) &&
          `${record.number} ${record.client} ${record.orderCode ?? ""} ${kind}`
            .toLocaleLowerCase()
            .includes(search.toLocaleLowerCase())
        );
      }),
    [collection.records, kindFilter, search],
  );
  const outstanding = collection.records
    .filter((record) => record.status !== "Paid" && isFinancialDocument(record))
    .reduce((sum, record) => sum + record.amountUsd, 0);

  const createDocument = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const order = orders.find((item) => item.id === selectedOrderId);
    if (!order) {
      toast.error("Choose an order before creating a document.");
      return;
    }
    const date = today();
    const newRecord: Omit<DocumentRecord, "id"> = {
      number: nextDocumentNumber(collection.records, selectedKind),
      client: order.client,
      amountUsd:
        selectedKind === "Invoice" ||
        selectedKind === "Proforma invoice" ||
        selectedKind === "Sales contract"
          ? order.valueUsd
          : 0,
      type: selectedKind,
      kind: selectedKind,
      status: "Draft",
      date: new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      orderCode: order.code,
      description: order.product,
      ...(dueDate ? { dueDate } : {}),
    };
    const created = collection.create(newRecord);
    setCreateOpen(false);
    setDueDate("");
    toast.success(`${selectedKind} ${created.number} created.`);
    downloadDocument(created, order);
  };

  const relatedOrder = (record: DocumentRecord) =>
    orders.find((order) => order.code === record.orderCode);
  const markPaid = (record: DocumentRecord) => {
    collection.update(record.id, { status: "Paid" });
    toast.success(`${record.number} marked as paid.`);
  };
  const renderActions = (record: DocumentRecord) => (
    <div className="flex items-center gap-1">
      {isFinancialDocument(record) && record.status !== "Paid" ? (
        <Button
          aria-label={`Mark ${record.number} as paid`}
          className="px-2 text-success"
          onClick={() => markPaid(record)}
          title="Mark as paid"
          type="button"
          variant="ghost"
        >
          <CheckCircle2 size={16} />
        </Button>
      ) : null}
      <Button
        aria-label={`Print ${record.number}`}
        className="px-2"
        onClick={() => printDocument(record, relatedOrder(record))}
        title="Print or save as PDF"
        type="button"
        variant="ghost"
      >
        <Printer size={16} />
      </Button>
      <Button
        aria-label={`Download PDF ${record.number}`}
        className="px-2"
        onClick={() => downloadDocument(record, relatedOrder(record))}
        title="Download PDF"
        type="button"
        variant="ghost"
      >
        <Download size={16} />
      </Button>
      <Button
        aria-label={`Share PDF ${record.number}`}
        className="px-2"
        onClick={() => void shareDocument(record, relatedOrder(record))}
        title="Share PDF"
        type="button"
        variant="ghost"
      >
        <Share2 size={16} />
      </Button>
    </div>
  );

  return (
    <>
      <PageHeader
        title="Invoices & documents"
        subtitle="Prepare client invoices and shipment paperwork from order records."
        actions={
          <Button onClick={() => setCreateOpen(true)} type="button">
            <Plus size={16} /> Create document
          </Button>
        }
      />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Stat
          label="Documents"
          value={String(collection.records.length)}
          icon={<FileText size={17} />}
        />
        <Stat
          label="Outstanding · USD"
          value={money(outstanding)}
          tone="warning"
          icon={<Download size={17} />}
        />
        <Stat
          label="Shipment documents"
          value={String(
            collection.records.filter(
              (record) => record.kind === "Packing list" || record.kind === "Delivery note",
            ).length,
          )}
          tone="accent"
          icon={<PackageCheck size={17} />}
        />
      </div>
      <Card className="mb-4 !p-3 sm:!p-4">
        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_220px]">
          <label className="relative">
            <Search className="absolute left-3 top-3.5 text-fg-subtle" size={15} />
            <Input
              aria-label="Search documents"
              className="pl-9"
              placeholder="Search number, client, or order"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <select
            aria-label="Filter documents by type"
            className="min-h-11 rounded-md border border-border-strong bg-bg-elev-1 px-3 text-sm"
            value={kindFilter}
            onChange={(event) => setKindFilter(event.target.value)}
          >
            <option>All documents</option>
            {documentKinds.map((kind) => (
              <option key={kind}>{kind}</option>
            ))}
            <option>Deposit invoice</option>
            <option>Final invoice</option>
          </select>
        </div>
      </Card>
      {visibleRecords.length === 0 ? (
        <Card className="py-12 text-center">
          <FileText className="mx-auto text-fg-subtle" size={28} />
          <p className="mt-3 font-medium">No documents match this view</p>
          <p className="mt-1 text-sm text-fg-subtle">
            Create a document from an order to get started.
          </p>
        </Card>
      ) : (
        <>
          <div className="hidden md:block">
            <Table head={["Document", "Client", "Order", "Type", "Amount", "Status", "Date", ""]}>
              {visibleRecords.map((record) => (
                <tr
                  key={record.id}
                  className="h-10 border-b border-border/60 last:border-0 hover:bg-bg-glass-hover"
                >
                  <td className="px-5 py-3 font-mono text-sm text-fg">{record.number}</td>
                  <td className="px-5 py-3">{record.client}</td>
                  <td className="px-5 py-3 font-mono text-xs text-fg-muted">
                    {record.orderCode ?? "—"}
                  </td>
                  <td className="px-5 py-3">{record.kind ?? record.type}</td>
                  <td className="px-5 py-3 font-mono">
                    {hasDocumentValue(record) ? money(record.amountUsd) : "—"}
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs text-fg-muted">{record.status}</span>
                  </td>
                  <td className="px-5 py-3 text-fg-muted">{record.date}</td>
                  <td className="px-5 py-3 text-right">{renderActions(record)}</td>
                </tr>
              ))}
            </Table>
          </div>
          <div className="grid gap-3 md:hidden">
            {visibleRecords.map((record) => (
              <Card key={record.id} className="!p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-sm text-fg">{record.number}</p>
                    <p className="mt-1 truncate text-sm text-fg-muted">{record.client}</p>
                  </div>
                  <span className="shrink-0 text-xs text-fg-subtle">{record.status}</span>
                </div>
                <div className="mt-3 flex flex-wrap justify-between gap-x-4 gap-y-1 border-t border-border pt-3 text-xs text-fg-subtle">
                  <span>{record.kind ?? `${record.type} invoice`}</span>
                  <span>
                    {hasDocumentValue(record) ? money(record.amountUsd) : "Shipment document"}
                  </span>
                  <span>{record.orderCode ?? record.date}</span>
                </div>
                <div className="mt-2 flex justify-end">{renderActions(record)}</div>
              </Card>
            ))}
          </div>
        </>
      )}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <form onSubmit={createDocument}>
            <DialogHeader>
              <DialogTitle>Create document</DialogTitle>
              <DialogDescription>
                Use an existing order to fill in the client and shipment details.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-5">
              <label className="block text-sm font-medium">
                Order
                <select
                  className="mt-1.5 min-h-11 w-full rounded-md border border-border-strong bg-bg-elev-1 px-3 text-sm"
                  required
                  value={selectedOrderId}
                  onChange={(event) => setSelectedOrderId(event.target.value)}
                >
                  {orders.map((order) => (
                    <option key={order.id} value={order.id}>
                      {order.code} · {order.client}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-medium">
                Document type
                <select
                  className="mt-1.5 min-h-11 w-full rounded-md border border-border-strong bg-bg-elev-1 px-3 text-sm"
                  value={selectedKind}
                  onChange={(event) => setSelectedKind(event.target.value as DocumentKind)}
                >
                  {documentKinds.map((kind) => (
                    <option key={kind}>{kind}</option>
                  ))}
                </select>
              </label>
              {selectedKind === "Invoice" || selectedKind === "Proforma invoice" ? (
                <label className="block text-sm font-medium">
                  Payment due
                  <Input
                    className="mt-1.5"
                    min={today()}
                    type="date"
                    value={dueDate}
                    onChange={(event) => setDueDate(event.target.value)}
                  />
                </label>
              ) : null}
            </div>
            <DialogFooter>
              <Button type="button" variant="glass" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <Download size={15} /> Create & download PDF
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
