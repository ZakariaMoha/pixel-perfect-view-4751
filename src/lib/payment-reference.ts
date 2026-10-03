export type ParsedPaymentReference = {
  reference?: string;
  amount?: number;
  date?: string;
};

const M_PESA_REFERENCE = /\b[A-Z0-9]{10}\b/i;
const WECHAT_REFERENCE = /\b\d{16}\b/;
const AMOUNT =
  /(?:\b(?:KES|KSH|CNY|RMB|USD)\s*|[$¥]\s*)([\d,]+(?:\.\d{1,2})?)|\b(?:amount|paid|received)\D{0,8}([\d,]+(?:\.\d{1,2})?)/i;
const ISO_DATE = /\b(20\d{2})[-/.](\d{1,2})[-/.](\d{1,2})\b/;
const LOCAL_DATE = /\b(\d{1,2})[-/.](\d{1,2})[-/.](20\d{2})\b/;

export function parsePaymentReference(text: string): ParsedPaymentReference {
  const reference = text.match(M_PESA_REFERENCE)?.[0] ?? text.match(WECHAT_REFERENCE)?.[0];
  const amountMatch = text.match(AMOUNT);
  const amountText = amountMatch?.[1] ?? amountMatch?.[2];
  const amount = amountText ? Number(amountText.replaceAll(",", "")) : undefined;
  const isoMatch = text.match(ISO_DATE);
  const localMatch = text.match(LOCAL_DATE);
  let date: string | undefined;

  if (isoMatch?.[1] && isoMatch[2] && isoMatch[3]) {
    date = `${isoMatch[1]}-${isoMatch[2].padStart(2, "0")}-${isoMatch[3].padStart(2, "0")}`;
  } else if (localMatch?.[1] && localMatch[2] && localMatch[3]) {
    date = `${localMatch[3]}-${localMatch[2].padStart(2, "0")}-${localMatch[1].padStart(2, "0")}`;
  }

  return {
    ...(reference ? { reference } : {}),
    ...(amount !== undefined && Number.isFinite(amount) ? { amount } : {}),
    ...(date ? { date } : {}),
  };
}
