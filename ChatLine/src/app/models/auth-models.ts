export interface User {
  id: number;
  email: string;
  full_name?: string;
  role: 'student' | 'admin' | 'staff';
  created_at?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
  expires_in: number;
}

export interface ApiError {
  message: string;
  code?: string;
}