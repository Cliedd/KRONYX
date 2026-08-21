import React from 'react';
import { DollarSign, Zap, Target, MessageSquare, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryBadgeProps {
  category: string | null;
  className?: string;
}

const categoryConfig: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  pricing: {
    label: 'Prix',
    icon: <DollarSign className="h-3 w-3" />,
    className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  },
  feature: {
    label: 'Fonctionnalité',
    icon: <Zap className="h-3 w-3" />,
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  },
  positioning: {
    label: 'Positionnement',
    icon: <Target className="h-3 w-3" />,
    className: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  },
  communication: {
    label: 'Communication',
    icon: <MessageSquare className="h-3 w-3" />,
    className: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  },
};

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const key = (category ?? '').toLowerCase();
  const config = categoryConfig[key] ?? {
    label: category ?? 'Autre',
    icon: <Info className="h-3 w-3" />,
    className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
        config.className,
        className
      )}
    >
      {config.icon}
      {config.label}
    </span>
  );
}
