/** Money/wallet domain models. Amounts are integer minor units (tiyin) in UZS. */

export type CardBrand = 'UZCARD' | 'HUMO' | 'VISA';

export interface Card {
  id: string;
  brand: CardBrand;
  number?: string | null; // full 16-digit number (masked in the UI)
  last4: string;
  holder: string;
  balance: number; // tiyin
}

export type TxType = 'sent' | 'received' | 'topup' | 'order';

export interface Transaction {
  id: string;
  type: TxType;
  counterpartyId?: string;
  counterpartyName?: string;
  amount: number; // tiyin
  note?: string;
  createdAt: number;
}

export interface Fund {
  id: string;
  name: string;
  balance: number; // tiyin
  goal?: number | null; // tiyin
}
