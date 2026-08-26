import { Copy01Icon, Tick01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";

import { Tooltip } from "@/components/ui/Tooltip";
import { cn } from "@/lib/utils";
import { truncateAddress } from "@/lib/utils";

export interface AddressDisplayProps {
  address: string;
  start?: number;
  end?: number;
  showFull?: boolean;
  className?: string;
  label?: string;
  onCopy?: () => void;
  size?: "sm" | "md" | "lg";
  masked?: boolean;
  mono?: boolean;
}

const sizeConfig = {
  sm: { text: "text-[10px]", icon: 10 },
  md: { text: "text-[11px]", icon: 12 },
  lg: { text: "text-[13px]", icon: 14 },
} as const;

export function AddressDisplay({
  address,
  start = 8,
  end = 6,
  showFull = false,
  className,
  label,
  onCopy,
  size = "md",
  masked = false,
  mono = false,
}: AddressDisplayProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* fallback */
    }
  }

  const display = masked
    ? `${address.slice(0, 4)}···${address.slice(-4)}`
    : showFull
      ? address
      : truncateAddress(address, start, end);
  const { text, icon: iconSize } = sizeConfig[size];

  const addressSpan = (
    <div className="flex items-center gap-2 group">
      <Tooltip content={address}>
        <span
          data-address
          className={cn(
            "break-all leading-relaxed",
            text,
            mono && "font-mono",
            showFull && "select-all",
          )}
        >
          {display}
        </span>
      </Tooltip>
      <Tooltip content={copied ? "Copied!" : "Copy address"}>
        <button
          onClick={copy}
          aria-label={copied ? "Address copied" : "Copy address"}
          className={cn(
            "shrink-0 p-1 rounded-md transition-all",
            copied
              ? "text-green bg-success-dim"
              : "text-ink-3 hover:text-ink-2 hover:bg-surface-2 opacity-40 hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-brand",
          )}
        >
          <HugeiconsIcon
            icon={copied ? Tick01Icon : Copy01Icon}
            size={iconSize}
            color="currentColor"
            strokeWidth={2}
          />
        </button>
      </Tooltip>
    </div>
  );

  if (label) {
    return (
      <dl className={cn("flex flex-col gap-1", className)}>
        <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-4">
          {label}
        </dt>
        <dd className="m-0">{addressSpan}</dd>
      </dl>
    );
  }

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {addressSpan}
    </div>
  );
}
