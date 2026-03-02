import type { AxiosInstance } from 'axios';
import type { Build, BuildPayload, RunCodeResult, PreviewResult, GenerateResult } from './types';

export function createBuildsModule(http: AxiosInstance) {
  return {
    async list(): Promise<Build[]> {
      const res = await http.get('/builds');
      return res.data.data;
    },

    async create(payload: BuildPayload): Promise<Build> {
      const res = await http.post('/builds', payload);
      return res.data;
    },

    async update(id: number, payload: Partial<BuildPayload>): Promise<Build> {
      const res = await http.patch(`/builds/${id}`, payload);
      return res.data;
    },

    async delete(id: number): Promise<void> {
      await http.delete(`/builds/${id}`);
    },

    async previewData(params: {
      api_source_id: number;
      endpoint: string;
      method?: string;
      query_params?: Record<string, string>;
      body?: unknown;
    }): Promise<PreviewResult> {
      const res = await http.post('/builds/preview-data', params);
      return res.data;
    },

    async runCode(
      code: string,
      data: unknown,
      language: 'javascript' | 'typescript' | 'python' = 'javascript'
    ): Promise<RunCodeResult> {
      const res = await http.post('/builds/run-code', { code, data, language });
      return res.data;
    },

    async generate(id: number, params?: Record<string, unknown>): Promise<GenerateResult> {
      const res = await http.post(`/builds/${id}/generate`, { params: params ?? {} });
      return res.data;
    },
  };
}
