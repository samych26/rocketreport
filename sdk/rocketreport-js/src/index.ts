import axios, { AxiosInstance } from 'axios';

export interface ApiSourceData {
    name: string;
    url_base: string;
    auth_type?: 'none' | 'bearer' | 'api_key' | 'basic';
    auth_token?: string;
}

export interface BuildData {
    name: string;
    api_source_id: number;
    endpoint: string;
    code: string;
    template_id?: number;
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH';
}

export interface TemplateData {
    content: string;
    output_format?: 'pdf' | 'html' | 'xlsx';
    description?: string;
}

export class RocketReport {
    private client: AxiosInstance;

    constructor(apiKey: string, baseUrl: string = 'http://localhost:8000') {
        this.client = axios.create({
            baseURL: baseUrl.replace(/\/$/, ''),
            headers: {
                'X-API-KEY': apiKey,
                'Content-Type': 'application/json',
            },
        });
    }

    /**
     * Create a new API Source
     */
    async createApiSource(data: ApiSourceData) {
        const response = await this.client.post('/api/api-sources', data);
        return response.data;
    }

    /**
     * Create a new Build (Document)
     */
    async createBuild(data: BuildData) {
        const response = await this.client.post('/api/builds', data);
        return response.data;
    }

    /**
     * Create a Template for a specific Build
     */
    async createTemplate(buildId: number, data: TemplateData) {
        const response = await this.client.post(`/api/documents/${buildId}/templates`, data);
        return response.data;
    }

    /**
     * Generate a report from a Build
     */
    async generate(buildId: number, params: Record<string, any> = {}) {
        const response = await this.client.post(`/api/builds/${buildId}/generate`, { params });
        return response.data;
    }

    /**
     * List all builds
     */
    async listBuilds() {
        const response = await this.client.get('/api/builds');
        return response.data;
    }

    /**
     * Get a specific build details
     */
    async getBuild(buildId: number) {
        const response = await this.client.get(`/api/builds/${buildId}`);
        return response.data;
    }
}
