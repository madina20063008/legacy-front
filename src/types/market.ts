export type CategoryKey = 'gifts' | 'flowers' | 'sweets' | 'electronics' | 'home' | 'kids';

export const CATEGORIES: CategoryKey[] = ['gifts', 'flowers', 'sweets', 'electronics', 'home', 'kids'];

export interface Product {
  id: string;
  name: string; // catalog data — not auto-translated
  emoji: string;
  category: CategoryKey;
  price: number; // tiyin
  description: string;
}

/** productId -> quantity */
export type Cart = Record<string, number>;
