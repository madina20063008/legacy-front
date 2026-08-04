export interface OrderItem {
  productId: string;
  name: string;
  emoji?: string | null;
  price: number; // tiyin
  qty: number;
}

export interface Order {
  id: string;
  address: string;
  phone: string;
  promo?: string | null;
  total: number; // tiyin
  status: string;
  createdAt: string; // ISO
  items: OrderItem[];
}

export interface PlaceOrderInput {
  address: string;
  phone: string;
  promo?: string;
  cardId?: string;
  items: OrderItem[];
}
