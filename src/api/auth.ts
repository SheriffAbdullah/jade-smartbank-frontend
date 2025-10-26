import { apiClient } from './client';
import type { LoginRequest, LoginResponse, RegisterRequest, User, KYCDocumentUpload, KYCDocument } from '../types';

export const authApi = {
  register: async (data: RegisterRequest) => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  uploadKYC: async (data: KYCDocumentUpload) => {
    const response = await apiClient.post('/auth/kyc/documents', data);
    return response.data;
  },

  getKYCStatus: async (): Promise<{ kyc_status: string; documents: KYCDocument[] }> => {
    const response = await apiClient.get('/auth/kyc/status');
    return response.data;
  },
};