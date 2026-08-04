import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { addCapsule, listCapsules, type Capsule } from '@/services/api/capsule-repo';

const KEY = ['capsules'] as const;

export function useCapsules() {
  return useQuery({ queryKey: KEY, queryFn: listCapsules });
}

export function useAddCapsule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<Capsule, 'id' | 'createdAt'>) => addCapsule(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
