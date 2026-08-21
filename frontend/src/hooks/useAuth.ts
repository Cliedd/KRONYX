import { useAuthStore } from '@/store/authStore';
import { usersApi } from '@/services/api';
import { useQuery } from '@tanstack/react-query';

export function useCurrentUser() {
  const { isAuthenticated, setUser } = useAuthStore();

  return useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const response = await usersApi.getMe();
      setUser(response.data);
      return response.data;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
