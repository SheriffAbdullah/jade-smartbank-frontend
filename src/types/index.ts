// User & Auth Types
export interface User {
  user_id: string;
  email: string;
  phone: string;
  full_name?: string;
  kyc_status: 'pending' | 'submitted' | 'verified' | 'rejected';
  role: 'customer' | 'admin';
  is_active: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  phone: string;
  password: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: {
    user_id: string;
    email: string;
    role: string;
    kyc_status: string;
  };
}

// Account Types
export interface Account {
  id: string;
  account_number: string;
  account_type: 'savings' | 'current' | 'fd';
  balance: number;
  minimum_balance: number;
  is_active: boolean;
  created_at: string;
}

export interface AccountCreate {
  account_type: 'savings' | 'current' | 'fd';
  initial_deposit: number;
}

// Transaction Types
export interface Transaction {
  id: string;
  transaction_type: 'transfer' | 'deposit' | 'withdrawal';
  from_account_id?: string;
  to_account_id?: string;
  amount: number;
  description?: string;
  reference_number: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

export interface TransferRequest {
  from_account_id: string;
  to_account_id: string;
  amount: number;
  description?: string;
}

export interface DepositRequest {
  account_id: string;
  amount: number;
  description?: string;
}

export interface WithdrawRequest {
  account_id: string;
  amount: number;
  description?: string;
}

// Loan Types
export interface Loan {
  id: string;
  loan_type: 'personal' | 'home' | 'auto' | 'education';
  principal_amount: number;
  interest_rate: number;
  tenure_months: number;
  emi_amount: number;
  total_interest: number;
  total_payable: number;
  outstanding_amount: number;
  emis_paid: number;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'closed';
  created_at: string;
}

export interface EMICalculationRequest {
  loan_type: 'personal' | 'home' | 'auto' | 'education';
  principal_amount: number;
  tenure_months: number;
}

export interface EMICalculationResponse {
  loan_type: string;
  principal_amount: number;
  interest_rate: number;
  tenure_months: number;
  emi_amount: number;
  total_interest: number;
  total_payable: number;
  amortization_schedule: Array<{
    month: number;
    emi: number;
    principal: number;
    interest: number;
    balance: number;
  }>;
}

export interface LoanApplicationRequest {
  loan_type: 'personal' | 'home' | 'auto' | 'education';
  principal_amount: number;
  tenure_months: number;
  disbursement_account_id: string;
  purpose: string;
}

// KYC Types
export interface KYCDocument {
  document_id: string;
  document_type: 'pan' | 'aadhaar' | 'passport' | 'driving_license';
  document_number: string;
  is_verified: boolean;
  verified_at?: string;
  created_at: string;
}

export interface KYCDocumentUpload {
  document_type: 'pan' | 'aadhaar' | 'passport' | 'driving_license';
  document_number: string;
}