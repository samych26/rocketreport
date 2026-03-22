import api from './api';

export interface ApiSource {
    id: number;
    name: string;
    description?: string | null;
    url_base: string;
    auth_type: 'none' | 'bearer' | 'api_key' | 'basic';
    status: 'active' | 'inactive' | 'archived';
    created_at: string;
    updated_at?: string;
}

export interface ApiSourcePayload {
    name: string;
    description?: string;
    url_base: string;
    auth_type: 'none' | 'bearer' | 'api_key' | 'basic';
    auth_token?: string;
    headers?: Record<string, string>;
}

export interface TestResult {
    success: boolean;
    status_code?: number;
    message?: string;
    response_summary?: string;
    error?: string;
}

export interface ApiEndpoint {
    id: number;
    name: string;
    path: string;
    method: string;
    variables: string[];
    description?: string;
}

export interface ApiEndpointPayload {
    name: string;
    path: string;
    method: string;
    variables?: string[];
    description?: string;
}

export const apiSourceService = {
    list: async (): Promise<ApiSource[]> => {
        const res = await api.get('/api-sources');
        return res.data.data;
    },

    get: async (id: number): Promise<ApiSource> => {
        const res = await api.get(`/api-sources/${id}`);
        return res.data.data;
    },

    create: async (payload: ApiSourcePayload): Promise<ApiSource> => {
        const res = await api.post('/api-sources', payload);
        return res.data.data;
    },

    update: async (id: number, payload: Partial<ApiSourcePayload>): Promise<ApiSource> => {
        const res = await api.patch(`/api-sources/${id}`, payload);
        return res.data.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/api-sources/${id}`);
    },

    test: async (id: number): Promise<TestResult> => {
        const res = await api.post(`/api-sources/${id}/test`);
        return res.data;
    },

    // 🔗 API Endpoints
    listEndpoints: async (sourceId: number): Promise<ApiEndpoint[]> => {
        const res = await api.get(`/api-sources/${sourceId}/endpoints`);
        return res.data.data;
    },

    createEndpoint: async (sourceId: number, payload: ApiEndpointPayload): Promise<ApiEndpoint> => {
        const res = await api.post(`/api-sources/${sourceId}/endpoints`, payload);
        return res.data.data;
    },

    updateEndpoint: async (sourceId: number, id: number, payload: Partial<ApiEndpointPayload>): Promise<ApiEndpoint> => {
        const res = await api.patch(`/api-sources/${sourceId}/endpoints/${id}`, payload);
        return res.data.data;
    },

    deleteEndpoint: async (sourceId: number, id: number): Promise<void> => {
        await api.delete(`/api-sources/${sourceId}/endpoints/${id}`);
    },
};
