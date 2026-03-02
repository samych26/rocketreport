// ─── Auth ────────────────────────────────────────────────────────────────────

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  token: string;
  refresh_token?: string;
  user: {
    id: number;
    email: string;
    name?: string;
  };
}

// ─── Templates ───────────────────────────────────────────────────────────────

export type OutputFormat = 'html' | 'pdf' | 'xlsx' | 'txt';

export interface Template {
  id: number;
  name: string;
  content: string;
  output_format: OutputFormat;
  description?: string;
  status: string;
  created_at: string;
  updated_at?: string;
}

export interface TemplatePayload {
  name: string;
  content: string;
  output_format: OutputFormat;
  description?: string;
}

// ─── API Sources ─────────────────────────────────────────────────────────────

export type AuthType = 'none' | 'bearer' | 'api_key' | 'basic';
export type SourceStatus = 'active' | 'inactive' | 'archived';

export interface ApiSource {
  id: number;
  name: string;
  description?: string | null;
  url_base: string;
  auth_type: AuthType;
  status: SourceStatus;
  created_at: string;
  updated_at?: string;
}

export interface ApiSourcePayload {
  name: string;
  description?: string;
  url_base: string;
  auth_type: AuthType;
  auth_token?: string;
  headers?: Record<string, string>;
}

export interface TestResult {
  success: boolean;
  status_code?: number;
  message?: string;
  error?: string;
}

// ─── Builds ──────────────────────────────────────────────────────────────────

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
  language?: 'javascript' | 'typescript' | 'python';
  template_id?: number | null;
}

export interface RunCodeResult {
  success: boolean;
  output_data?: unknown;
  logs?: string[];
  error?: string | null;
  execution_time_ms?: number;
}

export interface PreviewResult {
  success: boolean;
  status_code?: number;
  data?: unknown;
  is_json?: boolean;
  error?: string;
}

// ─── Generations ─────────────────────────────────────────────────────────────

export interface Generation {
  id: number;
  status: 'pending' | 'success' | 'failed';
  output_format: string;
  error_message?: string | null;
  created_at: string;
  file_path?: string | null;
}

export interface GenerateResult {
  download_url?: string;
  cached?: boolean;
}

// ─── SDK Config ──────────────────────────────────────────────────────────────

export interface RocketReportConfig {
  /** Base URL of your RocketReport API (e.g. "https://api.yourapp.com") */
  apiUrl: string;
  /** Bearer token — obtained via login() or provided manually */
  token?: string;
  /** Called when the token is refreshed automatically */
  onTokenRefresh?: (newToken: string) => void;
}
