import { formatDistanceToNow, format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export function formatRelativeDate(dateString: string): string {
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true, locale: fr });
  } catch {
    return dateString;
  }
}

export function formatDate(dateString: string): string {
  try {
    return format(parseISO(dateString), 'dd MMM yyyy', { locale: fr });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    return format(parseISO(dateString), 'dd MMM yyyy HH:mm', { locale: fr });
  } catch {
    return dateString;
  }
}

export function getImpactColor(level: string): string {
  switch (level) {
    case 'high': return 'text-red-600 dark:text-red-400';
    case 'medium': return 'text-amber-600 dark:text-amber-400';
    case 'low': return 'text-green-600 dark:text-green-400';
    default: return 'text-gray-600 dark:text-gray-400';
  }
}

export function getImpactLabel(level: string): string {
  switch (level) {
    case 'high': return 'Impact élevé';
    case 'medium': return 'Impact moyen';
    case 'low': return 'Impact faible';
    default: return level;
  }
}

export function getCategoryIcon(category: string | null): string {
  switch (category) {
    case 'Prix': return '💰';
    case 'Fonctionnalité': return '⚡';
    case 'Positionnement': return '🎯';
    case 'Communication': return '📢';
    default: return '📋';
  }
}
