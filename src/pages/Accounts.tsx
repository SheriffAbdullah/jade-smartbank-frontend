import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { accountsApi } from '../api/accounts';
import { CreditCard, Plus } from 'lucide-react';
import type { Account, AccountCreate } from '../types';
import { formatApiError } from '../utils/errorHandler';

export const Accounts: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<AccountCreate>({
    account_type: 'savings',
    initial_deposit: 0,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const data = await accountsApi.list();
      setAccounts(data);
    } catch (error) {
      console.error('Failed to load accounts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await accountsApi.create(formData);
      setShowCreateForm(false);
      setFormData({ account_type: 'savings', initial_deposit: 0 });
      loadAccounts();
    } catch (err: any) {
      setError(formatApiError(err) || 'Failed to create account');
    }
  };

  const accountTypeLabels = {
    savings: 'Savings Account',
    current: 'Current Account',
    fd: 'Fixed Deposit',
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">My Accounts</h1>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus size={20} className="inline mr-2" />
            New Account
          </Button>
        </div>

        {/* Create Account Form */}
        {showCreateForm && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Account</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateAccount} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={formData.account_type}
                    onChange={(e) => setFormData({ ...formData, account_type: e.target.value as any })}
                  >
                    <option value="savings">Savings Account</option>
                    <option value="current">Current Account</option>
                    <option value="fd">Fixed Deposit</option>
                  </select>
                </div>

                <Input
                  label="Initial Deposit (₹)"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.initial_deposit}
                  onChange={(e) => setFormData({ ...formData, initial_deposit: parseFloat(e.target.value) })}
                  required
                />

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button type="submit">Create Account</Button>
                  <Button type="button" variant="secondary" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Accounts List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : accounts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <CreditCard size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No accounts yet. Create your first account!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account) => (
              <Card key={account.id} className="hover:shadow-lg transition">
                <CardContent>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-gray-600">{accountTypeLabels[account.account_type]}</p>
                      <p className="font-mono text-lg font-semibold mt-1">{account.account_number}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      account.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {account.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600">Available Balance</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      ₹{account.balance.toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Min. Balance: ₹{account.minimum_balance.toLocaleString('en-IN')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};