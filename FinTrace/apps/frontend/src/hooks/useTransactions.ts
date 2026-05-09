// Transactions Hook

import { useState } from 'react';
import apiClient from '@lib/api';

export interface Transaction {
  id: string;
  sourceAccountId: string;
  destinationAccountId: string;
  amount: number;
  type: string;
  status: string;
  timestamp: Date;
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async (filters?: any, page?: number, pageSize?: number) => {
    try {
      setLoading(true);
      const params = {
        page: page || 1,
        pageSize: pageSize || 20,
        ...filters,
      };

      const response = await apiClient.get('/transactions', { params });
      setTransactions(response.data.data.transactions);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch transactions';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return { transactions, loading, error, fetchTransactions };
}
