import api from './api';
import type { ApiSource as _ApiSource } from './apiSourceService';
import type { Template as _Template } from './templateService';

export interface Build {
    id: number;
    name: string;
    description?: string | null;
    api_source: { id: number; name: string; url: string };
    endpoint: string;
    method: string;
    status: string;
    code?: string | null;
    template?: { id: number; name: string; format: string } | null;
    created_at: string;
    updated_at: string;
}

export interface BuildPayload {
    name: string;
    description?: string;
    api_source_id: number;
    endpoint: string;
    method: string;
    code: string;
    template_id?: number | null;
}

export interface PreviewResult {
    success: boolean;
    status_code?: number;
    data?: any;
    is_json?: boolean;
    error?: string;
}

export interface RunCodeResult {
    success: boolean;
    output_data?: any;
    logs?: string[];
    error?: string | null;
    execution_time_ms?: number;
}

export const buildService = {
    list: async (): Promise<Build[]> => {
        const res = await api.get('/builds');
        return res.data.data;
    },

    create: async (payload: BuildPayload): Promise<Build> => {
        const res = await api.post('/builds', payload);
        return res.data;
    },

    update: async (id: number, payload: Partial<BuildPayload> & { template_id?: number | null }): Promise<Build> => {
        const res = await api.patch(`/builds/${id}`, payload);
        return res.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/builds/${id}`);
    },

    previewData: async (params: {
        api_source_id: number;
        endpoint: string;
        method?: string;
        query_params?: Record<string, string>;
        body?: any;
    }): Promise<PreviewResult> => {
        const res = await api.post('/builds/preview-data', params);
        return res.data;
    },

    runCode: async (code: string, data: any): Promise<RunCodeResult> => {
        const res = await api.post('/builds/run-code', { code, data });
        return res.data;
    },

    generate: async (id: number, params?: Record<string, any>): Promise<any> => {
        const res = await api.post(`/builds/${id}/generate`, { params: params ?? {} });
        return res.data;
    },
};
