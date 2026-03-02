import type { AxiosInstance } from 'axios';
import type { LoginPayload, RegisterPayload, AuthResponse } from './types';

export function createAuthModule(http: AxiosInstance, config: { token?: string }) {
  return {
    async login(payload: LoginPayload): Promise<AuthResponse> {
      const res = await http.post<AuthResponse>('/auth/login', payload);
      config.token = res.data.token;
      return res.data;
    },

    async register(payload: RegisterPayload): Promise<AuthResponse> {
      const res = await http.post<AuthResponse>('/auth/register', payload);
      config.token = res.data.token;
      return res.data;
    },

    async logout(): Promise<void> {
      await http.post('/auth/logout');
      config.token = undefined;
    },

    /** Set token manually (e.g. loaded from storage) */
    setToken(token: string): void {
      config.token = token;
    },
  };
}
