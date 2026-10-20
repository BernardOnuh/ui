import { ActivityTimeline } from "@/components/ActivityTimeline";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { FeeEstimator } from "@/components/FeeEstimator";
import { GasOptimizer } from "@/components/GasOptimizer";
import { MultiSigTransactionBuilder } from "@/components/MultiSigTransactionBuilder";
import { TransactionHistory } from "@/components/TransactionHistory";
import { TransactionPanel } from "@/components/TransactionPanel";
import { SCREEN_LABELS } from "@/lib/nav-labels";

// Shared by GasOptimizer and FeeEstimator so both tick in lockstep;
// FeeEstimator's useFeeData() hook dedupes their estimateFee() calls to one
// request per tick regardless of how many components are polling.
const FEE_REFRESH_INTERVAL_MS = 15_000;

export function TransactionsScreen() {
  const { title, sub } = SCREEN_LABELS.transactions;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-[15px] font-semibold text-ink leading-none">
          {title}
        </h2>
        <p className="text-[11px] text-ink-3 mt-0.5">{sub}</p>
      </div>
      <GasOptimizer refreshInterval={FEE_REFRESH_INTERVAL_MS} />
      <FeeEstimator refreshInterval={FEE_REFRESH_INTERVAL_MS} />
      <MultiSigTransactionBuilder />
      <ErrorBoundary isolate>
        <TransactionPanel />
      </ErrorBoundary>
      <ErrorBoundary isolate>
        <TransactionHistory />
      </ErrorBoundary>
      <ActivityTimeline />
    </div>
  );
}
