export type ParsedReference = {
  reference?: string;
  amount?: number;
  currency?: "KES" | "CNY" | "USD";
  date?: string;
  method?: "M-Pesa" | "WeChat Pay" | "Alipay" | "Bank";
};

const MONTHS: Record<string, number> = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12,
};

/** Extract a payment reference, amount and date from a pasted WhatsApp / SMS / WeChat message. */
export function parseReference(text: string): ParsedReference {
  const out: ParsedReference = {};
  const t = text.trim();
  if (!t) return out;

  // M-Pesa: 10 uppercase alphanumerics, must include a letter and a digit, usually first token.
  const mpesa = t.match(/\b(?=[A-Z0-9]*\d)(?=[A-Z0-9]*[A-Z])[A-Z0-9]{10}\b/);
  // WeChat / Alipay: 16+ digit transaction id.
  const wechat = t.match(/\b\d{16,32}\b/);

  if (mpesa && /confirmed|m-?pesa|ksh/i.test(t)) {
    out.reference = mpesa[0];
    out.method = "M-Pesa";
  } else if (wechat) {
    out.reference = wechat[0];
    out.method = /alipay|支付宝/i.test(t) ? "Alipay" : "WeChat Pay";
  } else if (mpesa) {
    out.reference = mpesa[0];
    out.method = "M-Pesa";
  }

  const kesAmt = t.match(/(?:Ksh|KES)\s?([\d,]+(?:\.\d{1,2})?)/i);
  const cnyAmt = t.match(/(?:¥|RMB|CNY|￥)\s?([\d,]+(?:\.\d{1,2})?)/i);
  const usdAmt = t.match(/(?:\$|USD)\s?([\d,]+(?:\.\d{1,2})?)/i);
  const m = kesAmt ?? cnyAmt ?? usdAmt;
  if (m?.[1]) {
    out.amount = Number(m[1].replace(/,/g, ""));
    out.currency = kesAmt ? "KES" : cnyAmt ? "CNY" : "USD";
  }

  const dmy = t.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{2,4})\b/);
  const iso = t.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/);
  const named = t.match(
    /\b(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*(\d{4})?/i,
  );
  const pad = (n: number) => String(n).padStart(2, "0");
  if (iso) out.date = `${iso[1]}-${iso[2]}-${iso[3]}`;
  else if (dmy) {
    const y = dmy[3]!.length === 2 ? 2000 + Number(dmy[3]) : Number(dmy[3]);
    out.date = `${y}-${pad(Number(dmy[2]))}-${pad(Number(dmy[1]))}`;
  } else if (named) {
    out.date = `${named[3] ?? "2026"}-${pad(MONTHS[named[2]!.toLowerCase().slice(0, 3)]!)}-${pad(Number(named[1]))}`;
  }
  return out;
}

/** Downscale an image file on the client and return a JPEG data URL. */
export function compressImage(file: File, maxSide = 1200, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const image = new Image();
      image.onerror = reject;
      image.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
