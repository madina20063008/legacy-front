import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  addCard,
  addFund,
  fetchMoney,
  transfer,
  type AddCardInput,
  type AddFundInput,
  type TransferInput,
} from '@/services/api/money-repo';

const KEY = ['money'] as const;

export function useMoney() {
  const q = useQuery({ queryKey: KEY, queryFn: fetchMoney });
  const cards = q.data?.cards ?? [];
  const totalBalance = cards.reduce((sum, c) => sum + c.balance, 0);
  return {
    isLoading: q.isLoading,
    cards,
    funds: q.data?.funds ?? [],
    transactions: q.data?.transactions ?? [],
    totalBalance,
  };
}

export function useTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TransferInput) => transfer(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useAddCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AddCardInput) => addCard(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useAddFund() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AddFundInput) => addFund(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
