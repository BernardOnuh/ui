import { Cancel01Icon, Logout04Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { useSorokit } from "@/context/useSorokit";
import { truncateAddress } from "@/lib/utils";

import { WalletConnectModal } from "./WalletConnectModal";

export function WalletConnectButton() {
  const { isConnected, isConnecting, address, error, clearError, disconnectWallet, isDisconnecting } = useSorokit();
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (isConnected) {
      const timerId = window.setTimeout(() => setConnectModalOpen(false), 0);
      return () => window.clearTimeout(timerId);
    }
  }, [isConnected]);

  useEffect(() => {
    return () => window.clearTimeout(copyTimerRef.current);
  }, []);

  if (isConnected && address) {
    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(address);
        setCopied(true);
        window.clearTimeout(copyTimerRef.current);
        copyTimerRef.current = window.setTimeout(() => setCopied(false), 2000);
      } catch {}
    };

    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 sm:gap-2 h-8 px-2 sm:px-3.5 rounded-lg bg-surface-2 border border-line hover:border-line-2 transition-colors cursor-pointer"
          aria-label={`Copy wallet address ${address}`}
          title="Copy address"
        >
          <span className="w-2 h-2 rounded-full bg-green shrink-0" />
          <span data-address className="hidden sm:inline">
            {copied ? "Copied!" : truncateAddress(address)}
          </span>
        </button>
        <button
          type="button"
          onClick={disconnectWallet}
          disabled={isDisconnecting}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-surface-2 border border-line hover:border-line-2 transition-colors text-red cursor-pointer disabled:opacity-50"
          aria-label="Disconnect wallet"
        >
          <HugeiconsIcon
            icon={Logout04Icon}
            size={14}
            color="currentColor"
            strokeWidth={2}
          />
          <span className="hidden sm:inline">{isDisconnecting ? "Disconnecting..." : "Disconnect"}</span>
          <span className="sm:hidden">{isDisconnecting ? "..." : "Disconnect"}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-end">
      <Button
        size="md"
        loading={isConnecting}
        onClick={() => setConnectModalOpen(true)}
        className="px-2.5 sm:px-4"
        aria-label={isConnecting ? "Connecting..." : "Connect Wallet"}
      >
        <span className="hidden sm:inline">
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </span>
        <span className="sm:hidden">{isConnecting ? "..." : "Connect"}</span>
      </Button>
      {!isConnected && error && !connectModalOpen && (
        <div className="absolute top-[calc(100%+8row2)] right-0 z-50 flex items-center gap-2 px-3 py-1.5 bg-surface border border-error-dim rounded-lg shadow-lg text-red text-[11px] whitespace-nowrap animate-in fade-in slide-in-from-top-1 duration-200">
          <span>{error}</span>
          <button
            onClick={clearError}
            className="text-red opacity-50 hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center shrink-0"
            aria-label="Clear error"
          >
            <HugeiconsIcon
              icon={Cancel01Icon}
              size={12}
              color="currentColor"
              strokeWidth={2}
            />
          </button>
        </div>
      )
      }
      <WalletConnectModal
        open={connectModalOpen}
        onClose={() => setConnectModalOpen(false)}
      />
    </div>
  );
}