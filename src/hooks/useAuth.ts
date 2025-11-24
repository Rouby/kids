import { useTRPC } from '../utils/trpc';
import { useQuery } from '@tanstack/react-query';

export function useAuth() {
  const trpc = useTRPC();
  const { data: user, isLoading, error, refetch } = useQuery({
    ...trpc.auth.me.queryOptions(),
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    refetch,
  };
}
