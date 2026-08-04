import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { addDoc, listDocs, removeDoc, type VaultDoc } from '@/services/api/vault-repo';

const KEY = ['vault'] as const;

export function useVault() {
  return useQuery({ queryKey: KEY, queryFn: listDocs });
}

export function useAddDoc() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<VaultDoc, 'id' | 'addedAt'>) => addDoc(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useRemoveDoc() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => removeDoc(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
