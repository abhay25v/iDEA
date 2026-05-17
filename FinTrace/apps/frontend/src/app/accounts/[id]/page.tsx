// Account Inspection Page - Dynamic Route

'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter, useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { NavBar, Card, CardHeader, CardTitle, CardContent, Button } from '@/components';
import apiClient from '@/lib/api';

interface Account {
  _id: string;
  accountId: string;
  accountHolder: string;
  accountNumber: string;
  status: string;
  balance: number;
  kycStatus: string;
  createdAt: string;
  riskScore?: number;
  lastActivity?: string;
}

interface Transaction {
  _id: string;
  id: string;
  sourceAccountId: string;
  destinationAccountId: string;
  amount: number;
  type: string;
  timestamp: string;
  status: string;
}

export default function AccountInspectionPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const accountId = params?.id as string;
  const [mounted, setMounted] = useState(false);

  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    setMounted(true);
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const fetchAccountData = useCallback(async () => {
    try {
      setLoadingData(true);

      const [accountRes, transactionsRes] = await Promise.all([
        apiClient.get(`/transactions/account/${accountId}`),
        apiClient.get(`/transactions/account/${accountId}/transactions`),
      ]).catch(() => [null, null]);

      if (accountRes?.data?.data?.account) {
        setAccount(accountRes.data.data.account);
      }

      if (transactionsRes?.data?.data?.transactions) {
        setTransactions(transactionsRes.data.data.transactions);
      }
    } catch (error) {
      console.error('Failed to fetch account data:', error);
    } finally {
      setLoadingData(false);
    }
  }, [accountId]);

  useEffect(() => {
    if (!mounted || loading || !user || !accountId) {
      return;
    }

    void fetchAccountData();
  }, [mounted, loading, user, accountId, fetchAccountData]);

  if (!mounted || loading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar showNav title="FinTrace" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button variant="secondary" onClick={() => router.back()} className="mb-4">
            ← Back
          </Button>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Account Inspection</h2>
          <p className="text-slate-600">Detailed view of account information and transaction history.</p>
        </div>

        {loadingData ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Loading account data...</p>
          </div>
        ) : account ? (
          <div className="space-y-6">
            {/* Account Header */}
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <p className="text-slate-500 text-sm mb-1">Account ID</p>
                    <p className="text-lg text-slate-900 font-semibold">{account.accountId}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm mb-1">Account Holder</p>
                    <p className="text-lg text-slate-900 font-semibold">{account.accountHolder}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm mb-1">Account Number</p>
                    <p className="text-lg text-slate-900 font-semibold">****{account.accountNumber?.slice(-4)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm mb-1">Balance</p>
                    <p className="text-lg text-slate-900 font-semibold">${(account.balance || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Status</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        account.status === 'active'
                          ? 'bg-green-500/20 text-green-300'
                          : account.status === 'suspended'
                            ? 'bg-red-500/20 text-red-300'
                            : 'bg-slate-500/20 text-slate-300'
                      }`}
                    >
                      {account.status?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-1">KYC Status</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        account.kycStatus === 'verified'
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-yellow-500/20 text-yellow-300'
                      }`}
                    >
                      {account.kycStatus?.toUpperCase()}
                    </span>
                  </div>
                  {account.riskScore !== undefined && (
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Risk Score</p>
                      <p className={`text-lg font-semibold ${account.riskScore > 0.7 ? 'text-red-400' : 'text-yellow-400'}`}>
                        {(account.riskScore * 100).toFixed(0)}%
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Transaction History */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length > 0 ? (
                  <div className="space-y-3">
                    {transactions.slice(0, 10).map((txn) => (
                      <div key={txn._id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                        <div className="flex-1">
                              <p className="text-slate-900 font-medium">{txn.type}</p>
                              <p className="text-sm text-slate-600">
                                {txn.sourceAccountId} → {txn.destinationAccountId}
                              </p>
                        </div>
                        <div className="text-right">
                              <p className="text-slate-900 font-semibold">${txn.amount.toLocaleString()}</p>
                              <p className="text-sm text-slate-600">{new Date(txn.timestamp).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400">No transactions found.</p>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-slate-400">Account not found.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
