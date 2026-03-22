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

export interface BuildData {
  /** Name of the build or document */
  name: string;
  /** ID of the associated API source */
  api_source_id: number;
  /** API endpoint to fetch data from */
  endpoint: string;
  /** Code or identifier for this build */
  code: string;
  /** ID of a template to use for rendering */
  template_id?: number;
  /** HTTP method to use (default: GET) */
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH';
}

export interface TemplateData {
  /** HTML/Handlebars template content */
  content: string;
  /** Target output format (default: pdf) */
  output_format?: 'pdf' | 'html' | 'xlsx';
  /** Short description of the template */
  description?: string;
}

/**
 * RocketReport SDK Client
 * 
 * @example
 * ```typescript
 * const client = new RocketReport('your-api-key');
 * const builds = await client.listBuilds();
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

  /**
   * Create a new API Source
   * 
   * @param data Configuration for the new API Source
   * @returns The created API Source object
   */
  async createApiSource(data: ApiSourceData) {
    const response = await this.client.post('/api/api-sources', data);
    return response.data;
  }

  /**
   * Create a new Build (Document)
   * 
   * @param data Configuration for the new Build
   * @returns The created Build object
   */
  async createBuild(data: BuildData) {
    const response = await this.client.post('/api/builds', data);
    return response.data;
  }

  /**
   * Create a Template for a specific Build
   * 
   * @param buildId The ID of the Build to attach the template to
   * @param data Template content and options
   * @returns The created Template object
   */
  async createTemplate(buildId: number, data: TemplateData) {
    const response = await this.client.post(`/api/documents/${buildId}/templates`, data);
    return response.data;
  }

  /**
   * Generate a report from a Build
   * 
   * @param buildId The ID of the Build to generate
   * @param params Dynamic parameters to pass to the report generation
   * @returns The generated report data (often base64 or a link)
   */
  async generate(buildId: number, params: Record<string, any> = {}) {
    const response = await this.client.post(`/api/builds/${buildId}/generate`, { params });
    return response.data;
  }

  /**
   * List all builds available in the account
   * 
   * @returns Array of build objects
   */
  async listBuilds() {
    const response = await this.client.get('/api/builds');
    return response.data;
  }

  /**
   * Get details for a specific build
   * 
   * @param buildId The unique identifier of the build
   * @returns Detailed build object
   */
  async getBuild(buildId: number) {
    const response = await this.client.get(`/api/builds/${buildId}`);
    return response.data;
  }
}
