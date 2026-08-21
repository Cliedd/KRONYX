import { useQuery } from '@tanstack/react-query';
import { changesApi } from '@/services/api';

interface ChangesFilters {
  competitor_id?: string;
  category?: string;
  impact_level?: string;
  from_date?: string;
  to_date?: string;
  limit?: number;
  offset?: number;
}

export function useChanges(filters: ChangesFilters = {}) {
  return useQuery({
    queryKey: ['changes', filters],
    queryFn: async () => {
      const response = await changesApi.list(filters);
      return response.data;
    },
  });
}

export function useRecentChanges() {
  return useQuery({
    queryKey: ['recent-changes'],
    queryFn: async () => {
      const response = await changesApi.list({ limit: 10 });
      return response.data;
    },
    refetchInterval: 5 * 60 * 1000, // Rafraîchit toutes les 5 min
  });
}
