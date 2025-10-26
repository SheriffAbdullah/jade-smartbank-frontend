import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { accountsApi } from '../api/accounts';
import { loansApi } from '../api/loans';
import { transactionsApi } from '../api/transactions';
import { useAuth } from '../contexts/AuthContext';
import { Wallet, TrendingUp, Banknote, ArrowUpRight, AlertCircle } from 'lucide-react';
import type { Account, Loan, Transaction } from '../types';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [accountsData, loansData, transactionsData] = await Promise.all([
        accountsApi.list(),
        loansApi.list(),
        transactionsApi.list({ limit: 5 }),
      ]);
      setAccounts(accountsData);
      setLoans(loansData);
      setRecentTransactions(transactionsData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const activeLoans = loans.filter((loan) => loan.status === 'active' || loan.status === 'approved');
  const totalLoanAmount = activeLoans.reduce((sum, loan) => sum + loan.outstanding_amount, 0);

  const kycStatusBadge = () => {
    const statusColors = {
      verified: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      submitted: 'bg-blue-100 text-blue-800',
      rejected: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[user?.kyc_status || 'pending']}`}>
        KYC: {user?.kyc_status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
            <p className="text-gray-600 mt-1">{user?.email}</p>
          </div>
          {kycStatusBadge()}
        </div>

        {/* KYC Warning */}
        {user?.kyc_status !== 'verified' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="text-yellow-600 mt-0.5" size={20} />
            <div>
              <h3 className="font-medium text-yellow-900">Complete Your KYC</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Please complete your KYC verification to unlock all features including account creation and loans.
              </p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Balance</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">₹{totalBalance.toLocaleString('en-IN')}</p>
                <p className="text-sm text-gray-500 mt-1">{accounts.length} accounts</p>
              </div>
              <div className="bg-primary-100 p-3 rounded-full">
                <Wallet className="text-primary-600" size={24} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Loans</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">₹{totalLoanAmount.toLocaleString('en-IN')}</p>
                <p className="text-sm text-gray-500 mt-1">{activeLoans.length} loans</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Banknote className="text-blue-600" size={24} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Recent Transactions</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{recentTransactions.length}</p>
                <p className="text-sm text-gray-500 mt-1">Last 7 days</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="text-green-600" size={24} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No transactions yet</p>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((txn) => (
                  <div key={txn.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary-100 p-2 rounded-full">
                        <ArrowUpRight className="text-primary-600" size={16} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{txn.transaction_type}</p>
                        <p className="text-sm text-gray-500">{new Date(txn.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">₹{txn.amount.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-gray-500">{txn.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
