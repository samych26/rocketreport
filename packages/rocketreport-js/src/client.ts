import axios, { AxiosInstance } from 'axios';
import { ApiSource, GenerationResult, Template, User } from './types';

export class RocketReportClient {
    private client: AxiosInstance;
    private token: string | null = null;

    constructor(private baseUrl: string = 'http://localhost:8080') {
        this.client = axios.create({
            baseURL: this.baseUrl,
            withCredentials: true, // Crucial for HttpOnly Cookies
        });
    }

    /**
     * Authenticate and store the JWT.
     */
    async login(email: string, password: string): Promise<string> {
        const response = await this.client.post('/api/login', { email, password });
        this.token = response.data.token;
        this.updateHeaders();
        return this.token!;
    }

    /**
     * Register a new user.
     */
    async register(user: User & { password: string }): Promise<void> {
        await this.client.post('/api/register', user);
    }

    /**
     * Refresh the JWT using the HttpOnly refresh_token cookie.
     */
    async refresh(): Promise<string> {
        const response = await this.client.post('/api/auth/refresh');
        this.token = response.data.token;
        this.updateHeaders();
        return this.token!;
    }

    /**
     * List all templates.
     */
    async listTemplates(): Promise<Template[]> {
        const response = await this.client.get('/api/templates');
        return response.data;
    }

    /**
     * Generate a document.
     */
    async generateDocument(
        templateId: string,
        apiSourceIds: string[] = [],
        overrideData: Record<string, any> = {},
        format: string = 'HTML'
    ): Promise<GenerationResult> {
        const response = await this.client.post('/api/documents/generate', {
            templateId,
            apiSourceIds,
            overrideData,
            outputFormat: format
        });
        return response.data;
    }

    private updateHeaders() {
        if (this.token) {
            this.client.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
        }
    }

    setToken(token: string) {
        this.token = token;
        this.updateHeaders();
    }
}
