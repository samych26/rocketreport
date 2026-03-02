import api from './api';

export interface Generation {
    id: number;
    status: 'pending' | 'success' | 'failed';
    output_format: string;
    error_message?: string | null;
    created_at: string;
    file_path?: string | null;
}

export const generationService = {
    list: async (buildId: number): Promise<Generation[]> => {
        const res = await api.get(`/documents/${buildId}/generations`);
        return res.data?.data ?? res.data ?? [];
    },

    generate: async (buildId: number): Promise<{ download_url?: string; cached?: boolean }> => {
        const res = await api.post(`/builds/${buildId}/generate`, { params: {} });
        return res.data;
    },

    download: async (buildId: number, genId: number): Promise<Blob> => {
        const res = await api.get(`/documents/${buildId}/generations/${genId}/download`, {
            responseType: 'blob',
        });
        return res.data;
    },

    downloadByUrl: async (url: string): Promise<{ blob: Blob; contentType: string }> => {
        const absoluteUrl = url.startsWith('http') ? url : `http://localhost:8000${url}`;
        const res = await api.get(absoluteUrl, { responseType: 'blob' });
        return { blob: res.data, contentType: res.headers['content-type'] ?? '' };
    },
};
