import { apiClient } from './client';
import type { Account, AccountCreate } from '../types';

export const accountsApi = {
  create: async (data: AccountCreate): Promise<Account> => {
    const response = await apiClient.post('/accounts', data);
    return response.data;
  },

  list: async (): Promise<Account[]> => {
    const response = await apiClient.get('/accounts');
    return response.data;
  },

  get: async (accountId: string): Promise<Account> => {
    const response = await apiClient.get(`/accounts/${accountId}`);
    return response.data;
  },

  getStatement: async (accountId: string, params?: {
    start_date?: string;
    end_date?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get(`/accounts/${accountId}/statement`, { params });
    return response.data;
  },
};