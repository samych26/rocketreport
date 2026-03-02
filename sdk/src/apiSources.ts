import type { AxiosInstance } from 'axios';
import type { ApiSource, ApiSourcePayload, TestResult } from './types';

export function createApiSourcesModule(http: AxiosInstance) {
  return {
    async list(): Promise<ApiSource[]> {
      const res = await http.get('/api-sources');
      return res.data.data;
    },

    async create(payload: ApiSourcePayload): Promise<ApiSource> {
      const res = await http.post('/api-sources', payload);
      return res.data.data;
    },

    async update(id: number, payload: Partial<ApiSourcePayload>): Promise<ApiSource> {
      const res = await http.patch(`/api-sources/${id}`, payload);
      return res.data.data;
    },

    async delete(id: number): Promise<void> {
      await http.delete(`/api-sources/${id}`);
    },

    async test(id: number): Promise<TestResult> {
      const res = await http.post(`/api-sources/${id}/test`);
      return res.data;
    },
  };
}
