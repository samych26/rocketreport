import type { AxiosInstance } from 'axios';
import type { Template, TemplatePayload } from './types';

export function createTemplatesModule(http: AxiosInstance) {
  return {
    async list(): Promise<Template[]> {
      const res = await http.get('/templates');
      return res.data.data;
    },

    async create(payload: TemplatePayload): Promise<Template> {
      const res = await http.post('/templates', payload);
      return res.data;
    },

    async update(id: number, payload: Partial<TemplatePayload>): Promise<Template> {
      const res = await http.patch(`/templates/${id}`, payload);
      return res.data;
    },

    async delete(id: number): Promise<void> {
      await http.delete(`/templates/${id}`);
    },
  };
}
