import { Transaction } from '../types';

const TX_KEY = 'nexus_transactions';
const WALLET_KEY = 'nexus_wallet_balance';

export const loadTransactions = (): Transaction[] => {
  const raw = localStorage.getItem(TX_KEY);
  if (raw) return JSON.parse(raw);
  const seed: Transaction[] = [
    { id: 't1', type: 'deposit', amount: 5000, sender: 'Bank', receiver: 'You', status: 'completed', date: '2024-02-01' },
    { id: 't2', type: 'funding', amount: 15000, sender: 'You', receiver: 'StartupX', status: 'completed', date: '2024-02-10' },
  ];
  localStorage.setItem(TX_KEY, JSON.stringify(seed));
  return seed;
};

export const saveTransactions = (txs: Transaction[]) => {
  localStorage.setItem(TX_KEY, JSON.stringify(txs));
};

export const loadWallet = (): number => {
  const raw = localStorage.getItem(WALLET_KEY);
  return raw ? Number(raw) : 25000;
};

export const saveWallet = (balance: number) => {
  localStorage.setItem(WALLET_KEY, String(balance));
};
