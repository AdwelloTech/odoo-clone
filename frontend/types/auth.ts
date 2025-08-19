// src/types/auth.ts
export interface Tokens {
  access: string;
  refresh: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
}

export interface LoginResponse {
  message: string;
  user: User;
  tokens: Tokens;
}
