import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { clearCart, getCart, listProducts, PRODUCTS, setCartQty } from '@/services/api/market-repo';

const CART_KEY = ['market', 'cart'] as const;

export function useProducts() {
  return listProducts();
}

export function useCart() {
  const q = useQuery({ queryKey: CART_KEY, queryFn: getCart });
  const cart = q.data ?? {};
  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  const total = Object.entries(cart).reduce((sum, [id, qty]) => {
    const p = PRODUCTS.find((x) => x.id === id);
    return sum + (p ? p.price * qty : 0);
  }, 0);
  return { cart, count, total };
}

export function useSetCartQty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, qty }: { productId: string; qty: number }) => setCartQty(productId, qty),
    onSuccess: (cart) => qc.setQueryData(CART_KEY, cart),
  });
}

export function useClearCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => clearCart(),
    onSuccess: (cart) => qc.setQueryData(CART_KEY, cart),
  });
}
