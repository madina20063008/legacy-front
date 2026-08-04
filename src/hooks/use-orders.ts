import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchOrders, placeOrder } from '@/services/api/orders-repo';
import type { PlaceOrderInput } from '@/types/order';

const KEY = ['orders'] as const;

export function useOrders() {
  return useQuery({ queryKey: KEY, queryFn: fetchOrders });
}

export function usePlaceOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PlaceOrderInput) => placeOrder(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ['market', 'cart'] });
      qc.invalidateQueries({ queryKey: ['money'] });
    },
  });
}
