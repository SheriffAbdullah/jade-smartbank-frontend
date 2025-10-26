import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { accountsApi } from '../api/accounts';
import { transactionsApi } from '../api/transactions';
import { ArrowLeftRight, Plus } from 'lucide-react';
import type { Account, Transaction } from '../types';

export const Transactions: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'transfer' | 'deposit' | 'withdraw'>('transfer');

  const [formData, setFormData] = useState({
    from_account_id: '',
    to_account_id: '',
    account_id: '',
    amount: 0,
    description: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [accountsData, transactionsData] = await Promise.all([
        accountsApi.list(),
        transactionsApi.list({ limit: 50 }),
      ]);
      setAccounts(accountsData);
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (activeTab === 'transfer') {
        await transactionsApi.transfer({
          from_account_id: formData.from_account_id,
          to_account_id: formData.to_account_id,
          amount: formData.amount,
          description: formData.description,
        });
        setSuccess('Transfer successful!');
      } else if (activeTab === 'deposit') {
        await transactionsApi.deposit({
          account_id: formData.account_id,
          amount: formData.amount,
          description: formData.description,
        });
        setSuccess('Deposit successful!');
      } else {
        await transactionsApi.withdraw({
          account_id: formData.account_id,
          amount: formData.amount,
          description: formData.description,
        });
        setSuccess('Withdrawal successful!');
      }

      setShowForm(false);
      setFormData({ from_account_id: '', to_account_id: '', account_id: '', amount: 0, description: '' });
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Transaction failed');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus size={20} className="inline mr-2" />
            New Transaction
          </Button>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Transaction Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>New Transaction</CardTitle>
              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  variant={activeTab === 'transfer' ? 'primary' : 'secondary'}
                  onClick={() => setActiveTab('transfer')}
                >
                  Transfer
                </Button>
                <Button
                  size="sm"
                  variant={activeTab === 'deposit' ? 'primary' : 'secondary'}
                  onClick={() => setActiveTab('deposit')}
                >
                  Deposit
                </Button>
                <Button
                  size="sm"
                  variant={activeTab === 'withdraw' ? 'primary' : 'secondary'}
                  onClick={() => setActiveTab('withdraw')}
                >
                  Withdraw
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {activeTab === 'transfer' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">From Account</label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        value={formData.from_account_id}
                        onChange={(e) => setFormData({ ...formData, from_account_id: e.target.value })}
                        required
                      >
                        <option value="">Select account</option>
                        {accounts.map((acc) => (
                          <option key={acc.id} value={acc.id}>
                            {acc.account_number} - ₹{acc.balance.toLocaleString('en-IN')}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Input
                      label="To Account ID"
                      value={formData.to_account_id}
                      onChange={(e) => setFormData({ ...formData, to_account_id: e.target.value })}
                      placeholder="Enter recipient account ID"
                      required
                    />
                  </>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Account</label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      value={formData.account_id}
                      onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
                      required
                    >
                      <option value="">Select account</option>
                      {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.account_number} - ₹{acc.balance.toLocaleString('en-IN')}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <Input
                  label="Amount (₹)"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                  required
                />

                <Input
                  label="Description (Optional)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button type="submit">Submit Transaction</Button>
                  <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Transactions List */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12">
                <ArrowLeftRight size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No transactions yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Reference</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Amount</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {transactions.map((txn) => (
                      <tr key={txn.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(txn.created_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className="capitalize text-sm font-medium">{txn.transaction_type}</span>
                        </td>
                        <td className="px-4 py-3 text-sm font-mono text-gray-600">{txn.reference_number}</td>
                        <td className="px-4 py-3 text-right font-semibold">₹{txn.amount.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            txn.status === 'completed' ? 'bg-green-100 text-green-800' :
                            txn.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {txn.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};