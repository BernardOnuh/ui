import { Copy01Icon, Loading01Icon, Tick01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";

import { cn } from "@/lib/utils";

import { Badge } from "./Badge";
import { LabelledValue } from "./LabelledValue";

type ProbeState = "idle" | "testing" | "online" | "offline";

interface InfoCellProps {
  label: string;
  value: string;
  mono?: boolean;
  copyable?: boolean;
  testable?: boolean;
  className?: string;
}

export function InfoCell({
  value,
  testable,
  className,
  ...rest
}: InfoCellProps) {
  const [copied, setCopied] = useState(false);
  const [probe, setProbe] = useState<ProbeState>("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* fallback */
    }
  }

  async function testConnection() {
    setProbe("testing");
    try {
      await fetch(value, {
        method: "HEAD",
        mode: "no-cors",
        signal: AbortSignal.timeout(3000),
      });
      setProbe("online");
    } catch {
      setProbe("offline");
    }
  }

  if (!testable) {
    return (
      <LabelledValue
        className={cn("px-6 py-4", className)}
        value={value}
        {...rest}
      />
    );
  }

  return (
    <div className={cn("px-6 py-4 flex flex-col gap-1.5", className)}>
      <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-4">
        {rest.label}
      </span>
      <div className="flex items-start gap-2 group">
        <span
          className={cn(
            "text-[13px] text-ink-2 break-all flex-1",
            rest.mono && "font-mono text-[12px]",
          )}
        >
          {value}
        </span>
        {rest.copyable && (
          <button
            onClick={copy}
            aria-label={copied ? `${rest.label} copied` : `Copy ${rest.label}`}
            className={cn(
              "shrink-0 p-1 rounded-md transition-all mt-0.5",
              copied
                ? "text-green bg-success-dim"
                : "text-ink-3 hover:text-ink-2 hover:bg-surface-2 opacity-50 hover:opacity-100",
            )}
            title={copied ? "Copied!" : `Copy ${rest.label}`}
          >
            <HugeiconsIcon
              icon={copied ? Tick01Icon : Copy01Icon}
              size={12}
              color="currentColor"
              strokeWidth={2}
            />
          </button>
        )}
      </div>
      <div className="flex items-center gap-2 mt-0.5">
        <button
          type="button"
          onClick={testConnection}
          disabled={probe === "testing"}
          className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-2 px-2 py-1 text-[11px] font-medium text-ink-2 hover:bg-surface-3 hover:text-ink transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {probe === "testing" ? (
            <HugeiconsIcon
              icon={Loading01Icon}
              size={12}
              color="currentColor"
              strokeWidth={2}
              className="animate-spin"
            />
          ) : null}
          {probe === "testing" ? "Testing…" : "Test connection"}
        </button>
        {probe === "online" && (
          <Badge variant="success" dot>
            Reachable
          </Badge>
        )}
        {probe === "offline" && (
          <Badge variant="default" dot>
            Unreachable
          </Badge>
        )}
      </div>
    </div>
  );
}
