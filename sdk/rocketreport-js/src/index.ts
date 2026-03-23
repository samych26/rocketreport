import axios, { AxiosError, AxiosInstance } from 'axios';

/**
 * Custom error class for RocketReport SDK
 */
export class RocketReportError extends Error {
  public statusCode?: number;
  public details?: any;

  constructor(message: string, statusCode?: number, details?: any) {
    super(message);
    this.name = 'RocketReportError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export interface ApiSourceData {
  /** Name of the data source */
  name: string;
  /** Base URL for the external API */
  url_base: string;
  /** Authentication strategy */
  auth_type?: 'none' | 'bearer' | 'api_key' | 'basic';
  /** Token or key used for authentication */
  auth_token?: string;
}

/** @deprecated Use ApiDocumentData instead */
export type ApiEndpointData = ApiDocumentData;

export interface ApiDocumentData {
  /** Name of the Document */
  name: string;
  /** Path of the document, appended to ApiSource base_url (e.g. /orders) */
  path: string;
  /** Method (e.g GET) */
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** Variables to filter the JSON response keys (e.g. ["id", "price"]) */
  variables?: string[];
  /** Description */
  description?: string;
}

export interface TemplateData {
  /** HTML/Handlebars template content */
  content: string;
  /** Target output format (default: pdf) */
  output_format?: 'pdf' | 'html' | 'xlsx';
  /** Short description of the template */
  description?: string;
}

export interface TestResult {
  success: boolean;
  status_code?: number;
  data?: any;
  missing_variables?: string[];
  message?: string;
  error?: string;
}

/**
 * RocketReport SDK Client
 * 
 * @example
 * ```typescript
 * const client = new RocketReport('your-api-key');
 * const sources = await client.listApiSources();
 * ```
 */
export class RocketReport {
  private client: AxiosInstance;

  /**
   * Initialize a new RocketReport instance
   * 
   * @param apiKey Your RocketReport API Key
   * @param baseUrl Base URL of the RocketReport instance (defaults to http://localhost:8000)
   */
  constructor(apiKey: string, baseUrl: string = 'http://localhost:8000') {
    this.client = axios.create({
      baseURL: baseUrl.replace(/\/$/, ''),
      headers: {
        'Authorization': `Bearer ${apiKey}`, // Assuming API Key is used as Bearer or custom header
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
    });

    // Error handling interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response) {
          throw new RocketReportError(
            (error.response.data as any)?.message || 'An error occurred with the API',
            error.response.status,
            error.response.data
          );
        }
        throw new RocketReportError(error.message);
      }
    );
  }

  // ── API Sources ──────────────────────────────────────────────────────────

  /**
   * List all API Sources
   */
  async listApiSources() {
    const response = await this.client.get('/api/api-sources');
    return response.data;
  }

  /**
   * Create a new API Source
   */
  async createApiSource(data: ApiSourceData) {
    const response = await this.client.post('/api/api-sources', data);
    return response.data;
  }

  // ── API Documents (formerly Endpoints) ───────────────────────────────────

  /**
   * List all Documents for a specific API Source
   */
  async listApiDocuments(sourceId: number) {
    const response = await this.client.get(`/api/api-sources/${sourceId}/endpoints`);
    return response.data;
  }

  /**
   * Create a new API Document under an API Source
   */
  async createApiDocument(sourceId: number, data: ApiDocumentData) {
    const response = await this.client.post(`/api/api-sources/${sourceId}/endpoints`, data);
    return response.data;
  }

  /** @deprecated Use createApiDocument instead */
  async createApiEndpoint(sourceId: number, data: ApiDocumentData) {
    return this.createApiDocument(sourceId, data);
  }

  /**
   * Test a Document's data fetching
   * 
   * @param sourceId The ID of the API Source
   * @param documentId The ID of the Document to test
   * @returns Test result with data and potential missing variables
   */
  async testApiDocument(sourceId: number, documentId: number): Promise<TestResult> {
    const response = await this.client.post(`/api/api-sources/${sourceId}/endpoints/${documentId}/test`);
    return response.data;
  }

  // ── Templates & Generation ───────────────────────────────────────────────

  /**
   * Generate a report from a Document
   * 
   * @param sourceId The ID of the API Source
   * @param documentId The ID of the Document
   * @param params Optional parameters
   */
  async generate(sourceId: number, documentId: number, params: Record<string, any> = {}) {
    // Note: This endpoint might vary based on your backend implementation for generation
    const response = await this.client.post(`/api/api-sources/${sourceId}/endpoints/${documentId}/generate`, { params });
    return response.data;
  }
}
