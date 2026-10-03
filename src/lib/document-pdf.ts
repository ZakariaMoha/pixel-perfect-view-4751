export type PdfDocument = {
  number: string;
  kind: string;
  client: string;
  supplier?: string;
  amountUsd: number;
  usdToKes: number;
  orderCode?: string;
  description?: string;
  date: string;
  dueDate?: string;
  route?: string;
  eta?: string;
  weightKg?: number;
  cbm?: number;
};

const pdfSafe = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\u00b7\u2192]/g, " ")
    .replace(/[^\x20-\x7e]/g, " ")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");

const wrap = (value: string, width: number) => {
  const words = value.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    if (line && `${line} ${word}`.length > width) {
      lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line) lines.push(line);
  return lines;
};

export function createDocumentPdf(document: PdfDocument) {
  const commands: string[] = [];
  const text = (value: string, x: number, y: number, size = 10, bold = false) => {
    commands.push(
      `BT /${bold ? "F2" : "F1"} ${size} Tf 0.09 0.14 0.22 rg ${x} ${y} Td (${pdfSafe(value)}) Tj ET`,
    );
  };
  const line = (x1: number, y1: number, x2: number, y2: number, color = "0.83 0.87 0.90") => {
    commands.push(`${color} RG 0.8 w ${x1} ${y1} m ${x2} ${y2} l S`);
  };
  const paragraph = (value: string, x: number, y: number, width: number, size = 9) => {
    const lines = wrap(value, width);
    lines.forEach((row, index) => text(row, x, y - index * 13, size));
    return y - lines.length * 13;
  };
  const isContract = document.kind === "Sales contract";
  const isFinancial = document.kind === "Invoice" || document.kind === "Proforma invoice";
  const includesValue = isFinancial || isContract;
  const amount = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(
    document.amountUsd,
  );
  const kesAmount = new Intl.NumberFormat("en-KE", { maximumFractionDigits: 2 }).format(
    document.amountUsd * document.usdToKes,
  );

  commands.push("0.04 0.09 0.16 rg 48 765 42 42 re f");
  commands.push("0.31 0.80 0.77 RG 4 w 55 775 m 83 775 l S");
  commands.push("1 0.42 0.21 RG 4 w 56 777 m 62 777 64 793 69 793 c 75 793 77 777 83 777 c S");
  commands.push("1 0.42 0.21 rg 52 771 7 7 re f");
  commands.push("0.31 0.80 0.77 rg 80 771 7 7 re f");
  text("TradeHub", 102, 788, 20, true);
  text("GLOBAL SOURCING & LOGISTICS", 102, 773, 8);
  text(document.kind.toLocaleUpperCase(), 356, 790, 9, true);
  text(document.number, 356, 773, 11, true);
  if (isContract) text("DRAFT FOR REVIEW", 356, 758, 8, true);
  line(48, 744, 547, 744, "1 0.42 0.21");

  text(isContract ? "PARTIES" : isFinancial ? "BILL TO" : "PREPARED FOR", 48, 719, 8, true);
  text(document.client, 48, 701, 12, true);
  if (document.supplier) {
    text("SUPPLIER", 310, 719, 8, true);
    text(document.supplier, 310, 701, 12, true);
  }
  text("DOCUMENT DATE", 48, 671, 8, true);
  text(document.date, 48, 655, 10);
  text("ORDER REFERENCE", 210, 671, 8, true);
  text(document.orderCode ?? "-", 210, 655, 10);
  if (document.dueDate) {
    text("PAYMENT DUE", 390, 671, 8, true);
    text(document.dueDate, 390, 655, 10);
  }

  text("GOODS / DESCRIPTION", 48, 618, 8, true);
  text("WEIGHT", 390, 618, 8, true);
  text("VOLUME", 480, 618, 8, true);
  line(48, 608, 547, 608);
  const descriptionLines = wrap(document.description ?? "TradeHub order", 54);
  descriptionLines.slice(0, 3).forEach((row, index) => text(row, 48, 588 - index * 13, 9));
  text(document.weightKg ? `${document.weightKg.toLocaleString()} kg` : "-", 390, 588, 9);
  text(document.cbm ? `${document.cbm.toLocaleString()} CBM` : "-", 480, 588, 9);
  line(48, 548, 547, 548);

  let contentBottom = 525;
  if (document.route) {
    text("ROUTE", 48, contentBottom, 8, true);
    text(document.route, 48, contentBottom - 15, 9);
    if (document.eta) {
      text("ESTIMATED DELIVERY", 310, contentBottom, 8, true);
      text(document.eta, 310, contentBottom - 15, 9);
    }
    contentBottom -= 46;
  }

  if (includesValue) {
    text("ORDER VALUE", 354, contentBottom, 9);
    text(`USD ${amount}`, 470, contentBottom, 9, true);
    text("KES reference", 354, contentBottom - 17, 9);
    text(`KES ${kesAmount}`, 470, contentBottom - 17, 9, true);
    line(350, contentBottom - 27, 547, contentBottom - 27);
    text("TOTAL", 354, contentBottom - 47, 11, true);
    text(`USD ${amount}`, 470, contentBottom - 47, 11, true);
    contentBottom -= 75;
  }

  if (isContract) {
    contentBottom -= 5;
    text("ORDER AGREEMENT - DRAFT", 48, contentBottom, 9, true);
    contentBottom -= 18;
    const terms = [
      "Goods and quantities are as stated above and in the referenced order specifications.",
      "The stated order value is in USD. Payment schedule and additional charges must be agreed by both parties before signing.",
      "Route and delivery timing are estimates and may change due to carrier, port, or customs handling.",
      "Inspection criteria and acceptance should follow specifications confirmed by buyer and supplier.",
      "Changes to goods, quantities, price, or delivery require written confirmation from both parties.",
    ];
    terms.forEach((term, index) => {
      contentBottom = paragraph(`${index + 1}. ${term}`, 48, contentBottom, 94, 8) - 4;
    });
    text("BUYER SIGNATURE", 48, contentBottom - 16, 8, true);
    text("SUPPLIER SIGNATURE", 310, contentBottom - 16, 8, true);
    line(48, contentBottom - 42, 250, contentBottom - 42);
    line(310, contentBottom - 42, 512, contentBottom - 42);
  }

  if (isFinancial) {
    const terms = document.dueDate
      ? `Payment due ${document.dueDate}. FX reference: 1 USD = ${document.usdToKes} KES.`
      : `FX reference: 1 USD = ${document.usdToKes} KES. Please quote the document number with payment.`;
    paragraph(terms, 48, contentBottom - 14, 100, 8);
  } else if (!isContract) {
    paragraph("Shipment handling document. This is not a tax invoice.", 48, 495, 100, 8);
  } else {
    paragraph(
      "Draft for review. Confirm party details, governing law, payment schedule, and final terms before signing.",
      48,
      88,
      100,
      8,
    );
  }
  line(48, 62, 547, 62);
  text("TRADEHUB  |  CHINA - KENYA TRADE OPERATIONS", 48, 46, 8);
  text(document.number, 470, 46, 8);

  const stream = commands.join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((body, index) => {
    offsets.push(new TextEncoder().encode(pdf).length);
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xrefOffset = new TextEncoder().encode(pdf).length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new Blob([pdf], { type: "application/pdf" });
}
