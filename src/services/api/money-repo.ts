/**
 * Money repository. Backed by the REST API (persisted in PostgreSQL) when
 * configured; otherwise an empty local wallet.
 *
 * SECURITY: demo wallet. No real card numbers, no payment secrets — real
 * transfers would go through Payme/Click via the backend.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Card, Fund, Transaction } from '@/types/money';
import { api } from './client';
import { isApiConfigured } from './config';

interface MoneyState {
  cards: Card[];
  funds: Fund[];
  transactions: Transaction[];
}

interface ServerTx extends Omit<Transaction, 'createdAt'> {
  createdAt: string;
}
interface ServerMoney {
  cards: Card[];
  funds: Fund[];
  transactions: ServerTx[];
}

function mapMoney(m: ServerMoney): MoneyState {
  return {
    cards: m.cards,
    funds: m.funds,
    transactions: m.transactions.map((t) => ({ ...t, createdAt: Date.parse(t.createdAt) })),
  };
}

export async function fetchMoney(): Promise<MoneyState> {
  if (isApiConfigured) return mapMoney(await api.get<ServerMoney>('/money'));
  return loadMock();
}

export interface AddCardInput {
  brand: Card['brand'];
  number: string; // full 16-digit number
  holder: string;
  balance: number; // tiyin
}

export async function addCard(input: AddCardInput): Promise<Card> {
  if (isApiConfigured) return api.post<Card>('/money/cards', input);
  const state = await loadMock();
  const card: Card = { id: `c_${Date.now().toString(36)}`, ...input, last4: input.number.slice(-4) };
  state.cards.push(card);
  await persistMock();
  return card;
}

export interface AddFundInput {
  name: string;
  goal?: number;
}

export async function addFund(input: AddFundInput): Promise<Fund> {
  if (isApiConfigured) return api.post<Fund>('/money/funds', input);
  const state = await loadMock();
  const fund: Fund = { id: `f_${Date.now().toString(36)}`, name: input.name, balance: 0, goal: input.goal ?? null };
  state.funds.push(fund);
  await persistMock();
  return fund;
}

export interface TransferInput {
  cardId: string;
  toId?: string;
  toName: string;
  amount: number; // tiyin
  note?: string;
}

export async function transfer(input: TransferInput): Promise<Transaction> {
  if (isApiConfigured) {
    const t = await api.post<ServerTx>('/money/transfer', input);
    return { ...t, createdAt: Date.parse(t.createdAt) };
  }
  const state = await loadMock();
  const card = state.cards.find((c) => c.id === input.cardId);
  if (!card) throw new Error('NO_CARD');
  card.balance = Math.max(0, card.balance - input.amount);
  const tx: Transaction = {
    id: `t_${Date.now().toString(36)}`,
    type: 'sent',
    counterpartyId: input.toId,
    counterpartyName: input.toName,
    amount: input.amount,
    note: input.note,
    createdAt: Date.now(),
  };
  state.transactions.unshift(tx);
  await persistMock();
  return tx;
}

// ── Local fallback (no backend) ──
const STORAGE_KEY = 'legacy.money.v3';
let cache: MoneyState | null = null;

async function loadMock(): Promise<MoneyState> {
  if (cache) return cache;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    cache = raw ? (JSON.parse(raw) as MoneyState) : { cards: [], funds: [], transactions: [] };
  } catch {
    cache = { cards: [], funds: [], transactions: [] };
  }
  return cache;
}

async function persistMock() {
  if (!cache) return;
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // non-fatal
  }
}
