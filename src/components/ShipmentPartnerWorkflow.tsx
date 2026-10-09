import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Download, ExternalLink, FileText, PackageCheck, Upload } from "lucide-react";
import { toast } from "sonner";
import { Badge, Button, Card, SectionTitle } from "@/components/kit";
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
import { FX, statusMeta, type Order } from "@/lib/demo-data";

type ShipmentPartnerWorkflowProps = {
  order: Order | null;
  orders: readonly Order[];
  onClose: () => void;
  onUpdate: (id: string, changes: Partial<Omit<Order, "id">>) => void;
  onAddUpdate: (order: Order) => void;
};

const maxDocumentSize = 2 * 1024 * 1024;
const today = () => new Date().toISOString().slice(0, 10);

function calculateCbm(lengthCm: number, widthCm: number, heightCm: number, packageCount: number) {
  return (lengthCm * widthCm * heightCm * packageCount) / 1_000_000;
}

function nextDeliveryNoteNumber(orders: readonly Order[]) {
  const year = new Date().getFullYear();
  const highestSequence = orders.reduce((highest, order) => {
    const match = order.deliveryNote?.number.match(new RegExp(`^DN-${year}-(\\d+)$`));
    return Math.max(highest, match ? Number(match[1]) : 0);
  }, 0);
  return `DN-${year}-${String(highestSequence + 1).padStart(4, "0")}`;
}

function downloadDeliveryNote(order: Order, number: string) {
  const pdf = createDocumentPdf({
    number,
    kind: "Delivery note",
    client: order.client,
    supplier: order.supplier,
    amountUsd: 0,
    usdToKes: FX.usdToKes,
    orderCode: order.code,
    description: order.product,
    date: new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    route: order.route,
    eta: order.eta,
    weightKg: order.weightKg,
    cbm: order.cbm,
  });
  const url = URL.createObjectURL(pdf);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${number.toLocaleLowerCase()}.pdf`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function ShipmentPartnerWorkflow({
  order,
  orders,
  onClose,
  onUpdate,
  onAddUpdate,
}: ShipmentPartnerWorkflowProps) {
  const [lengthCm, setLengthCm] = useState("");
  const [widthCm, setWidthCm] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [packageCount, setPackageCount] = useState("");
  const [uploading, setUploading] = useState(false);
  const orderId = order?.id;
  const savedDimensions = order?.cbmCalculation;

  useEffect(() => {
    if (!orderId) return;
    setLengthCm(String(savedDimensions?.lengthCm ?? ""));
    setWidthCm(String(savedDimensions?.widthCm ?? ""));
    setHeightCm(String(savedDimensions?.heightCm ?? ""));
    setPackageCount(String(savedDimensions?.packageCount ?? ""));
  }, [
    orderId,
    savedDimensions?.heightCm,
    savedDimensions?.lengthCm,
    savedDimensions?.packageCount,
    savedDimensions?.widthCm,
  ]);

  if (!order) return null;

  const length = Number(lengthCm);
  const width = Number(widthCm);
  const height = Number(heightCm);
  const count = Number(packageCount);
  const validDimensions =
    [length, width, height, count].every((value) => Number.isFinite(value) && value > 0) &&
    lengthCm.trim() !== "" &&
    widthCm.trim() !== "" &&
    heightCm.trim() !== "" &&
    packageCount.trim() !== "";
  const calculatedCbm = validDimensions ? calculateCbm(length, width, height, count) : 0;

  const uploadDocument = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    if (
      file.type !== "application/pdf" &&
      file.type !== "image/jpeg" &&
      file.type !== "image/png"
    ) {
      toast.error("Upload a PDF, JPG, or PNG invoice or delivery note.");
      input.value = "";
      return;
    }
    if (file.size > maxDocumentSize) {
      toast.error("The partner document must be 2 MB or smaller to save in this browser.");
      input.value = "";
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onerror = () => {
      setUploading(false);
      toast.error("Could not read that document. Please try again.");
      input.value = "";
    };
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setUploading(false);
        toast.error("Could not read that document. Please try again.");
        input.value = "";
        return;
      }
      onUpdate(order.id, {
        partnerDocument: {
          name: file.name,
          mimeType: file.type,
          dataUrl: reader.result,
          uploadedAt: new Date().toISOString(),
        },
      });
      setUploading(false);
      toast.success("Partner document uploaded.");
      input.value = "";
    };
    reader.readAsDataURL(file);
  };

  const saveVolume = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validDimensions) {
      toast.error("Enter positive dimensions and package count to calculate CBM.");
      return;
    }
    onUpdate(order.id, {
      cbm: Number(calculatedCbm.toFixed(3)),
      cbmCalculation: {
        lengthCm: length,
        widthCm: width,
        heightCm: height,
        packageCount: count,
      },
    });
    toast.success(`Shipment volume updated to ${calculatedCbm.toFixed(3)} CBM.`);
  };

  const generateDeliveryNote = () => {
    if (order.cbm <= 0) {
      toast.error("Calculate and save the shipment volume before generating a delivery note.");
      return;
    }
    const number = order.deliveryNote?.number ?? nextDeliveryNoteNumber(orders);
    onUpdate(order.id, {
      deliveryNote: {
        number,
        generatedAt: new Date().toISOString(),
        status: "Generated",
      },
    });
    downloadDeliveryNote(order, number);
    toast.success(`Delivery note ${number} generated and downloaded.`);
  };

  const openWhatsApp = () => {
    const note = order.deliveryNote;
    if (!note) {
      toast.error("Generate a delivery note before sharing it.");
      return;
    }
    const message = `Hello ${order.client}, delivery note ${note.number} for ${order.code} is ready. Shipment volume: ${order.cbm.toFixed(3)} CBM. Please find the PDF attached.`;
    const whatsappWindow = window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      "_blank",
    );
    if (!whatsappWindow) {
      toast.error("Allow pop-ups to open WhatsApp and share the delivery note.");
      return;
    }
    onUpdate(order.id, {
      deliveryNote: { ...note, status: "Ready to send" },
    });
    toast.info("Attach the downloaded PDF in WhatsApp, send it, then mark it as sent here.");
  };

  const markSent = () => {
    if (!order.deliveryNote) return;
    onUpdate(order.id, {
      deliveryNote: {
        ...order.deliveryNote,
        status: "Sent to client",
        sentAt: today(),
      },
    });
    toast.success("Delivery note marked as sent to the client.");
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Partner shipment · {order.code}</DialogTitle>
          <DialogDescription>
            Upload partner paperwork, calculate volume, and prepare the client delivery note.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-3">
          <Card className="!p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-fg">{order.client}</p>
                <p className="mt-1 text-sm text-fg-muted">{order.product}</p>
                <p className="mt-1 text-xs text-fg-subtle">
                  {order.route} · ETA {order.eta}
                </p>
              </div>
              <Badge tone={statusMeta[order.status].tone}>{statusMeta[order.status].label}</Badge>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
              <span className="text-sm text-fg-muted">
                Partner: {order.carrier ?? "Not assigned"} · {order.cbm.toFixed(3)} CBM
              </span>
              <Button
                onClick={() => {
                  onClose();
                  onAddUpdate(order);
                }}
                type="button"
                variant="glass"
              >
                Update shipment status
              </Button>
            </div>
          </Card>

          <section>
            <SectionTitle>Partner invoice or delivery note</SectionTitle>
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-border-strong px-4 py-2 text-sm font-semibold hover:bg-bg-glass-hover">
                <Upload size={16} />
                {uploading ? "Uploading…" : "Upload partner document"}
                <input
                  accept="application/pdf,image/jpeg,image/png"
                  className="sr-only"
                  disabled={uploading}
                  onChange={uploadDocument}
                  type="file"
                />
              </label>
              {order.partnerDocument ? (
                <>
                  <a
                    className="inline-flex items-center gap-2 break-all text-sm text-accent hover:underline"
                    download={order.partnerDocument.name}
                    href={order.partnerDocument.dataUrl}
                  >
                    <FileText size={15} /> {order.partnerDocument.name}
                  </a>
                  <span className="text-xs text-fg-subtle">Saved in this browser</span>
                </>
              ) : (
                <span className="text-sm text-fg-subtle">No partner document uploaded yet.</span>
              )}
            </div>
            <p className="mt-2 text-xs text-fg-subtle">
              PDF, JPG, or PNG · Max 2 MB · Files are stored locally in this browser.
            </p>
          </section>

          <section>
            <SectionTitle>Calculate shipment CBM</SectionTitle>
            <form className="space-y-3" onSubmit={saveVolume}>
              <div className="grid gap-3 sm:grid-cols-4">
                {[
                  { label: "Length (cm)", value: lengthCm, setValue: setLengthCm },
                  { label: "Width (cm)", value: widthCm, setValue: setWidthCm },
                  { label: "Height (cm)", value: heightCm, setValue: setHeightCm },
                  { label: "Packages", value: packageCount, setValue: setPackageCount },
                ].map(({ label, value, setValue }) => (
                  <label className="space-y-1.5 text-sm font-medium" key={label}>
                    {label}
                    <Input
                      min="0.01"
                      onChange={(event) => setValue(event.target.value)}
                      required
                      step="any"
                      type="number"
                      value={value}
                    />
                  </label>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-bg-glass px-4 py-3">
                <span className="inline-flex items-center gap-2 text-sm text-fg-muted">
                  <PackageCheck size={16} />
                  Calculated volume:{" "}
                  <strong className="font-mono text-fg">
                    {validDimensions ? calculatedCbm.toFixed(3) : "0.000"} CBM
                  </strong>
                </span>
                <Button type="submit" variant="accent">
                  Save calculated CBM
                </Button>
              </div>
              <p className="text-xs text-fg-subtle">
                Formula: length × width × height × package count ÷ 1,000,000 (dimensions in cm).
              </p>
            </form>
          </section>

          <section>
            <SectionTitle>Client delivery note</SectionTitle>
            {order.deliveryNote ? (
              <Card className="!p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm font-semibold text-fg">
                      {order.deliveryNote.number}
                    </p>
                    <p className="mt-1 text-xs text-fg-subtle">
                      {new Date(order.deliveryNote.generatedAt).toLocaleString()}
                    </p>
                    {order.deliveryNote.sentAt ? (
                      <p className="mt-1 text-xs text-fg-subtle">
                        Sent to client{" "}
                        {new Date(`${order.deliveryNote.sentAt}T00:00:00`).toLocaleDateString()}
                      </p>
                    ) : null}
                  </div>
                  <Badge
                    tone={
                      order.deliveryNote.status === "Sent to client"
                        ? "success"
                        : order.deliveryNote.status === "Ready to send"
                          ? "warning"
                          : "muted"
                    }
                  >
                    {order.deliveryNote.status}
                  </Badge>
                </div>
              </Card>
            ) : (
              <p className="text-sm text-fg-subtle">No delivery note generated yet.</p>
            )}
            <DialogFooter className="mt-4 flex-wrap gap-2 sm:justify-start">
              <Button
                disabled={order.cbm <= 0}
                onClick={generateDeliveryNote}
                type="button"
                variant="glass"
              >
                <Download size={16} />
                {order.deliveryNote ? "Regenerate delivery note" : "Generate delivery note"}
              </Button>
              {order.deliveryNote ? (
                <>
                  <Button onClick={openWhatsApp} type="button" variant="accent">
                    <ExternalLink size={16} /> Open WhatsApp
                  </Button>
                  {order.deliveryNote.status !== "Sent to client" ? (
                    <Button onClick={markSent} type="button">
                      Mark as sent
                    </Button>
                  ) : null}
                </>
              ) : null}
            </DialogFooter>
            {order.deliveryNote ? (
              <p className="mt-2 text-xs text-fg-subtle">
                Downloaded PDF is not attached automatically; attach it in WhatsApp before sending.
              </p>
            ) : null}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
