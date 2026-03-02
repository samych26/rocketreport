import type { AxiosInstance } from 'axios';
import type { Generation, GenerateResult } from './types';

export function createGenerationsModule(http: AxiosInstance) {
  return {
    async list(buildId: number): Promise<Generation[]> {
      const res = await http.get(`/documents/${buildId}/generations`);
      return res.data?.data ?? res.data ?? [];
    },

    async generate(buildId: number): Promise<GenerateResult> {
      const res = await http.post(`/builds/${buildId}/generate`, { params: {} });
      return res.data;
    },

    async download(buildId: number, generationId: number): Promise<Blob> {
      const res = await http.get(
        `/documents/${buildId}/generations/${generationId}/download`,
        { responseType: 'blob' }
      );
      return res.data as Blob;
    },
  };
}
