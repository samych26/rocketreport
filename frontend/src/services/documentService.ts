import api from './api';

export interface Document {
    id: number;
    name: string;
    description?: string;
    api_source_id: number;
    endpoint: string;
    method: string;
    status: string;
    created_at: string;
}

export const documentService = {
    list: async (): Promise<Document[]> => {
        const res = await api.get('/documents');
        return res.data.data;
    },
};
