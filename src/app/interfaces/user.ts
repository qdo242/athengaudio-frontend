export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  avatar?: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
  orders?: any[];
  wishlist?: number[];
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export interface ProfileUpdateRequest {
  name: string;
  phone: string;
  address: string;
  avatar?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}