import { cn } from "@/lib/utils";

export function BrandLogo({
  className,
  size = 36,
  wordmark = true,
}: {
  className?: string;
  size?: number;
  wordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center", className)}>
      <img
        src={wordmark ? "/tradehub-logo.svg" : "/tradehub-mark.svg"}
        alt="TradeHub"
        width={wordmark ? size * 3.25 : size}
        height={size}
        className="shrink-0"
      />
    </span>
  );
}
