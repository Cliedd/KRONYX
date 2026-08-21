import { cn } from "@/lib/utils";

interface ImpactBadgeProps {
  level: 'low' | 'medium' | 'high';
  className?: string;
}

const config = {
  high: {
    label: 'Élevé',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
  medium: {
    label: 'Moyen',
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  },
  low: {
    label: 'Faible',
    className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  },
};

export function ImpactBadge({ level, className }: ImpactBadgeProps) {
  const { label, className: colorClass } = config[level] ?? config.low;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        colorClass,
        className
      )}
    >
      {label}
    </span>
  );
}
