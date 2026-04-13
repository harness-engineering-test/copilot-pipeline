export interface User {
  id: string;
  name: string;
  email: string;
}

export interface ApiError {
  message: string;
  code?: string;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
