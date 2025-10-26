import { apiClient } from './client';
import type { Transaction, TransferRequest, DepositRequest, WithdrawRequest } from '../types';

export const transactionsApi = {
  transfer: async (data: TransferRequest) => {
    const response = await apiClient.post('/transactions/transfer', data);
    return response.data;
  },

  deposit: async (data: DepositRequest) => {
    const response = await apiClient.post('/transactions/deposit', data);
    return response.data;
  },

  withdraw: async (data: WithdrawRequest) => {
    const response = await apiClient.post('/transactions/withdraw', data);
    return response.data;
  },

  get: async (transactionId: string): Promise<Transaction> => {
    const response = await apiClient.get(`/transactions/${transactionId}`);
    return response.data;
  },

  list: async (params?: {
    account_id?: string;
    transaction_type?: string;
    skip?: number;
    limit?: number;
  }): Promise<Transaction[]> => {
    const response = await apiClient.get('/transactions', { params });
    return response.data;
  },
};