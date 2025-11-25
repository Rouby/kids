import { useTRPC } from '../utils/trpc';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function usePoints() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: pointsData, isLoading } = useQuery({
    ...trpc.game.getPoints.queryOptions(),
    refetchOnWindowFocus: false,
  });

  const addPointsMutation = useMutation({
    ...trpc.game.addPoints.mutationOptions(),
    onSuccess: () => {
      // Invalidate the points query to refetch
      queryClient.invalidateQueries({ queryKey: trpc.game.getPoints.queryKey() });
      // Also invalidate auth.me to update user points in header
      queryClient.invalidateQueries({ queryKey: trpc.auth.me.queryKey() });
    },
  });

  return {
    points: pointsData?.points ?? null,
    isLoading,
    addPoints: (points: number) => addPointsMutation.mutate({ points }),
    isAddingPoints: addPointsMutation.isPending,
  };
}
