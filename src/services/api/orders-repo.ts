import type { Order, PlaceOrderInput } from '@/types/order';
import { api } from './client';
import { isApiConfigured } from './config';

// Orders live on the backend. Without it, an empty history (checkout still
// clears the local cart via the market repo).
export async function fetchOrders(): Promise<Order[]> {
  if (isApiConfigured) return api.get<Order[]>('/orders');
  return [];
}

export async function placeOrder(input: PlaceOrderInput): Promise<Order> {
  if (isApiConfigured) return api.post<Order>('/orders', input);
  return {
    id: `o_${Date.now().toString(36)}`,
    address: input.address,
    phone: input.phone,
    promo: input.promo,
    total: input.items.reduce((s, i) => s + i.price * i.qty, 0),
    status: 'placed',
    createdAt: new Date().toISOString(),
    items: input.items,
  };
}
