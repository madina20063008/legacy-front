/**
 * Market catalog (static demo data) + a local cart (AsyncStorage).
 * A real integration would fetch the catalog from a marketplace partner API via
 * a backend — secret keys never in the app.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Cart, Product } from '@/types/market';
import { api } from './client';
import { isApiConfigured } from './config';

interface ServerCartItem {
  productId: string;
  qty: number;
}
function toCart(items: ServerCartItem[]): Cart {
  const cart: Cart = {};
  for (const i of items) cart[i.productId] = i.qty;
  return cart;
}

export const PRODUCTS: Product[] = [
  { id: 'g1', name: 'Handmade Silk Scarf', emoji: '🧣', category: 'gifts', price: 320_000_00, description: 'Traditional Uzbek atlas silk scarf, hand-woven in Margilan.' },
  { id: 'g2', name: 'Gift Card', emoji: '🎁', category: 'gifts', price: 500_000_00, description: 'A flexible gift card for any occasion.' },
  { id: 'f1', name: 'Rose Bouquet', emoji: '💐', category: 'flowers', price: 180_000_00, description: 'A dozen fresh red roses, delivered same day.' },
  { id: 'f2', name: 'Tulip Basket', emoji: '🌷', category: 'flowers', price: 240_000_00, description: 'Spring tulips in a woven basket.' },
  { id: 's1', name: 'Assorted Baklava', emoji: '🍰', category: 'sweets', price: 150_000_00, description: 'Box of honey-glazed baklava and pistachio sweets.' },
  { id: 's2', name: 'Dried Fruit & Nuts', emoji: '🥜', category: 'sweets', price: 130_000_00, description: 'Premium Samarkand dried apricots, raisins, and almonds.' },
  { id: 'e1', name: 'Wireless Earbuds', emoji: '🎧', category: 'electronics', price: 890_000_00, description: 'Noise-cancelling earbuds with a charging case.' },
  { id: 'e2', name: 'Smart Watch', emoji: '⌚', category: 'electronics', price: 1_450_000_00, description: 'Fitness tracking, calls, and notifications.' },
  { id: 'h1', name: 'Ceramic Tea Set', emoji: '🫖', category: 'home', price: 420_000_00, description: 'Hand-painted Rishtan ceramic teapot and piyalas.' },
  { id: 'h2', name: 'Wool Blanket', emoji: '🧶', category: 'home', price: 560_000_00, description: 'Warm hand-knit wool blanket.' },
  { id: 'k1', name: 'Wooden Toy Set', emoji: '🧸', category: 'kids', price: 210_000_00, description: 'Eco-friendly wooden building blocks.' },
  { id: 'k2', name: 'Picture Storybook', emoji: '📚', category: 'kids', price: 95_000_00, description: 'Illustrated folk tales for young readers.' },
];

const CART_KEY = 'legacy.cart.v1';
let cartCache: Cart | null = null;

export function listProducts(): Product[] {
  return PRODUCTS;
}

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export async function getCart(): Promise<Cart> {
  if (isApiConfigured) return toCart(await api.get<ServerCartItem[]>('/cart'));
  if (cartCache) return cartCache;
  try {
    const raw = await AsyncStorage.getItem(CART_KEY);
    cartCache = raw ? (JSON.parse(raw) as Cart) : {};
  } catch {
    cartCache = {};
  }
  return cartCache;
}

async function persist() {
  try {
    await AsyncStorage.setItem(CART_KEY, JSON.stringify(cartCache ?? {}));
  } catch {
    // non-fatal
  }
}

export async function setCartQty(productId: string, qty: number): Promise<Cart> {
  if (isApiConfigured) return toCart(await api.put<ServerCartItem[]>('/cart', { productId, qty }));
  const cart = await getCart();
  if (qty <= 0) delete cart[productId];
  else cart[productId] = qty;
  await persist();
  return { ...cart };
}

/** Empty the cart (e.g. after a successful checkout). */
export async function clearCart(): Promise<Cart> {
  if (isApiConfigured) {
    await api.del('/cart');
    return {};
  }
  cartCache = {};
  await persist();
  return {};
}
