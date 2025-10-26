import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { loansApi } from '../api/loans';
import { accountsApi } from '../api/accounts';
import { Calculator, Plus, Banknote } from 'lucide-react';
import type { Loan, Account, EMICalculationResponse } from '../types';
import { formatApiError } from '../utils/errorHandler';

export const Loans: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);

  const [calculatorData, setCalculatorData] = useState({
    loan_type: 'personal' as const,
    principal_amount: 100000,
    tenure_months: 12,
  });
  const [emiResult, setEmiResult] = useState<EMICalculationResponse | null>(null);

  const [applyData, setApplyData] = useState({
    loan_type: 'personal' as const,
    principal_amount: 100000,
    tenure_months: 12,
    disbursement_account_id: '',
    purpose: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [loansData, accountsData] = await Promise.all([
        loansApi.list(),
        accountsApi.list(),
      ]);
      setLoans(loansData);
      setAccounts(accountsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCalculateEMI = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const result = await loansApi.calculateEMI(calculatorData);
      setEmiResult(result);
    } catch (err: any) {
      setError(formatApiError(err) || 'Calculation failed');
    }
  };

  const handleApplyLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await loansApi.apply(applyData);
      setSuccess('Loan application submitted successfully! Awaiting admin approval.');
      setShowApplyForm(false);
      setApplyData({
        loan_type: 'personal',
        principal_amount: 100000,
        tenure_months: 12,
        disbursement_account_id: '',
        purpose: '',
      });
      loadData();
    } catch (err: any) {
      setError(formatApiError(err) || 'Application failed');
    }
  };

  const loanTypeInfo = {
    personal: { max: 500000, minTenure: 6, maxTenure: 60, rate: 12.5 },
    home: { max: 5000000, minTenure: 60, maxTenure: 360, rate: 8.5 },
    auto: { max: 1000000, minTenure: 12, maxTenure: 84, rate: 10.5 },
    education: { max: 2000000, minTenure: 12, maxTenure: 120, rate: 9.5 },
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Loans</h1>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowCalculator(!showCalculator)}>
              <Calculator size={20} className="inline mr-2" />
              EMI Calculator
            </Button>
            <Button onClick={() => setShowApplyForm(!showApplyForm)}>
              <Plus size={20} className="inline mr-2" />
              Apply for Loan
            </Button>
          </div>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* EMI Calculator */}
        {showCalculator && (
          <Card>
            <CardHeader>
              <CardTitle>EMI Calculator</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCalculateEMI} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Loan Type</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    value={calculatorData.loan_type}
                    onChange={(e) => setCalculatorData({ ...calculatorData, loan_type: e.target.value as any })}
                  >
                    <option value="personal">Personal Loan</option>
                    <option value="home">Home Loan</option>
                    <option value="auto">Auto Loan</option>
                    <option value="education">Education Loan</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    Max: ₹{loanTypeInfo[calculatorData.loan_type].max.toLocaleString('en-IN')} |
                    Rate: {loanTypeInfo[calculatorData.loan_type].rate}% p.a.
                  </p>
                </div>

                <Input
                  label="Loan Amount (₹)"
                  type="number"
                  min="1000"
                  step="1000"
                  value={calculatorData.principal_amount}
                  onChange={(e) => setCalculatorData({ ...calculatorData, principal_amount: parseInt(e.target.value) })}
                  required
                />

                <Input
                  label="Tenure (Months)"
                  type="number"
                  min={loanTypeInfo[calculatorData.loan_type].minTenure}
                  max={loanTypeInfo[calculatorData.loan_type].maxTenure}
                  value={calculatorData.tenure_months}
                  onChange={(e) => setCalculatorData({ ...calculatorData, tenure_months: parseInt(e.target.value) })}
                  required
                />

                <Button type="submit">Calculate EMI</Button>
              </form>

              {emiResult && (
                <div className="mt-6 p-4 bg-primary-50 rounded-lg">
                  <h4 className="font-semibold text-lg mb-3">EMI Calculation Result</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Monthly EMI</p>
                      <p className="text-2xl font-bold text-primary-700">₹{emiResult.emi_amount.toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Interest</p>
                      <p className="text-xl font-semibold">₹{emiResult.total_interest.toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Principal Amount</p>
                      <p className="text-xl font-semibold">₹{emiResult.principal_amount.toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Payable</p>
                      <p className="text-xl font-semibold">₹{emiResult.total_payable.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Apply for Loan */}
        {showApplyForm && (
          <Card>
            <CardHeader>
              <CardTitle>Apply for Loan</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleApplyLoan} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Loan Type</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    value={applyData.loan_type}
                    onChange={(e) => setApplyData({ ...applyData, loan_type: e.target.value as any })}
                  >
                    <option value="personal">Personal Loan</option>
                    <option value="home">Home Loan</option>
                    <option value="auto">Auto Loan</option>
                    <option value="education">Education Loan</option>
                  </select>
                </div>

                <Input
                  label="Loan Amount (₹)"
                  type="number"
                  min="1000"
                  value={applyData.principal_amount}
                  onChange={(e) => setApplyData({ ...applyData, principal_amount: parseInt(e.target.value) })}
                  required
                />

                <Input
                  label="Tenure (Months)"
                  type="number"
                  value={applyData.tenure_months}
                  onChange={(e) => setApplyData({ ...applyData, tenure_months: parseInt(e.target.value) })}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Disbursement Account</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    value={applyData.disbursement_account_id}
                    onChange={(e) => setApplyData({ ...applyData, disbursement_account_id: e.target.value })}
                    required
                  >
                    <option value="">Select account</option>
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.account_number}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Purpose"
                  value={applyData.purpose}
                  onChange={(e) => setApplyData({ ...applyData, purpose: e.target.value })}
                  placeholder="e.g., Home renovation, Education fees"
                  required
                />

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button type="submit">Submit Application</Button>
                  <Button type="button" variant="secondary" onClick={() => setShowApplyForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Loans List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : loans.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Banknote size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No loans yet. Apply for your first loan!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {loans.map((loan) => (
              <Card key={loan.id}>
                <CardContent>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold capitalize">{loan.loan_type} Loan</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          loan.status === 'active' ? 'bg-green-100 text-green-800' :
                          loan.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                          loan.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {loan.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div>
                          <p className="text-sm text-gray-600">Principal Amount</p>
                          <p className="font-semibold">₹{loan.principal_amount.toLocaleString('en-IN')}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Monthly EMI</p>
                          <p className="font-semibold">₹{loan.emi_amount.toLocaleString('en-IN')}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Outstanding</p>
                          <p className="font-semibold text-orange-600">₹{loan.outstanding_amount.toLocaleString('en-IN')}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">EMIs Paid</p>
                          <p className="font-semibold">{loan.emis_paid} / {loan.tenure_months}</p>
                        </div>
                      </div>
                    </div>
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