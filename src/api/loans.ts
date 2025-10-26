import { apiClient } from './client';
import type { Loan, EMICalculationRequest, EMICalculationResponse, LoanApplicationRequest } from '../types';

export const loansApi = {
  calculateEMI: async (data: EMICalculationRequest): Promise<EMICalculationResponse> => {
    const response = await apiClient.post('/loans/calculate-emi', data);
    return response.data;
  },

  apply: async (data: LoanApplicationRequest): Promise<Loan> => {
    const response = await apiClient.post('/loans', data);
    return response.data;
  },

  list: async (): Promise<Loan[]> => {
    const response = await apiClient.get('/loans');
    return response.data;
  },

  get: async (loanId: string): Promise<Loan> => {
    const response = await apiClient.get(`/loans/${loanId}`);
    return response.data;
  },

  getEMISchedule: async (loanId: string) => {
    const response = await apiClient.get(`/loans/${loanId}/emi-schedule`);
    return response.data;
  },

  payEMI: async (loanId: string, data: { account_id: string; amount: number }) => {
    const response = await apiClient.post(`/loans/${loanId}/pay-emi`, data);
    return response.data;
  },
};