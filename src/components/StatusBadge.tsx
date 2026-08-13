type DonationStatus = 'available' | 'requested' | 'confirmed' | 'picked_up' | 'expired';

const STATUS_CONFIG: Record<DonationStatus, {
  label: string;
  bg: string;
  text: string;
  dot: string;
  dotPulse?: boolean;
}> = {
  available: {
    label: "Available",
    bg: "bg-emerald-50 border border-emerald-200/70 dark:bg-emerald-500/10 dark:border-emerald-500/25",
    text: "text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-500",
    dotPulse: true,
  },
  requested: {
    label: "Requested",
    bg: "bg-amber-50 border border-amber-200/70 dark:bg-amber-500/10 dark:border-amber-500/25",
    text: "text-amber-700 dark:text-amber-400",
    dot: "bg-amber-500",
    dotPulse: true,
  },
  confirmed: {
    label: "Confirmed",
    bg: "bg-blue-50 border border-blue-200/70 dark:bg-blue-500/10 dark:border-blue-500/25",
    text: "text-blue-700 dark:text-blue-400",
    dot: "bg-blue-500",
    dotPulse: false,
  },
  picked_up: {
    label: "Picked Up ✓",
    bg: "bg-slate-100 border border-slate-200/70 dark:bg-slate-500/10 dark:border-slate-500/25",
    text: "text-slate-500 dark:text-slate-400",
    dot: "bg-slate-400",
    dotPulse: false,
  },
  expired: {
    label: "Expired",
    bg: "bg-red-50 border border-red-200/70 dark:bg-red-500/10 dark:border-red-500/25",
    text: "text-red-600 dark:text-red-400",
    dot: "bg-red-500",
    dotPulse: false,
  },
};

interface StatusBadgeProps {
  status: DonationStatus | string;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status as DonationStatus] ?? {
    label: status,
    bg: "bg-muted border border-border/60",
    text: "text-muted-foreground",
    dot: "bg-muted-foreground",
    dotPulse: false,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold animate-badge-pop ${config.bg} ${config.text} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dot} ${config.dotPulse ? "animate-pulse" : ""}`} />
      {config.label}
    </span>
  );
}
