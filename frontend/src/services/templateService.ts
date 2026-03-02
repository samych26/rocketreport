import api from './api';

export interface Template {
    id: number;
    name: string;
    document_id?: number | null;
    document_name?: string | null;
    content: string;
    output_format: 'html' | 'pdf' | 'xlsx' | 'txt';
    description?: string;
    status: string;
    created_at: string;
    updated_at?: string;
}

export interface TemplatePayload {
    name: string;
    content: string;
    output_format: 'html' | 'pdf' | 'xlsx' | 'txt';
    description?: string;
}

export const templateService = {
    /** Liste tous les templates de l'utilisateur */
    list: async (): Promise<Template[]> => {
        const res = await api.get('/templates');
        return res.data.data;
    },

    /** Crée un template standalone */
    create: async (payload: TemplatePayload): Promise<Template> => {
        const res = await api.post('/templates', payload);
        return res.data;
    },

    /** Met à jour un template */
    update: async (id: number, payload: Partial<TemplatePayload>): Promise<Template> => {
        const res = await api.patch(`/templates/${id}`, payload);
        return res.data;
    },

    /** Supprime un template */
    delete: async (id: number): Promise<void> => {
        await api.delete(`/templates/${id}`);
    },
};

export interface UploadResult {
    content: string;
    variables: string[];
    output_format: 'html' | 'pdf' | 'xlsx' | 'txt';
    source_name: string;
}

export const uploadTemplate = async (file: File): Promise<UploadResult> => {
    const form = new FormData();
    form.append('file', file);
    const res = await api.post('/templates/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
};
