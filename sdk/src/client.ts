import axios, { AxiosInstance } from 'axios';
import type { RocketReportConfig } from './types';

export function createHttpClient(config: RocketReportConfig): AxiosInstance {
  const client = axios.create({
    baseURL: `${config.apiUrl.replace(/\/$/, '')}/api`,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  // Inject Bearer token on every request
  client.interceptors.request.use((req) => {
    if (config.token) {
      req.headers = req.headers ?? {};
      req.headers['Authorization'] = `Bearer ${config.token}`;
    }
    return req;
  });

  // Auto-refresh on 401
  let isRefreshing = false;
  let queue: Array<{ resolve: (v: unknown) => void; reject: (e: unknown) => void }> = [];

  const drainQueue = (error: unknown) => {
    queue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(null)));
    queue = [];
  };

  client.interceptors.response.use(
    (res) => res,
    async (error) => {
      const original = error.config;
      if (error.response?.status === 401 && !original._retry && !original.url?.includes('/auth/')) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => queue.push({ resolve, reject }))
            .then(() => client(original))
            .catch((e) => Promise.reject(e));
        }
        original._retry = true;
        isRefreshing = true;
        try {
          const res = await client.post<{ token: string }>('/auth/refresh');
          const newToken = res.data.token;
          config.token = newToken;
          config.onTokenRefresh?.(newToken);
          drainQueue(null);
          return client(original);
        } catch (e) {
          drainQueue(e);
          return Promise.reject(e);
        } finally {
          isRefreshing = false;
        }
      }
      return Promise.reject(error);
    }
  );

  return client;
}
