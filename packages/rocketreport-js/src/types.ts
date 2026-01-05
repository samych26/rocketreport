export interface User {
    email: string;
    firstname: string;
    lastname: string;
}

export interface ApiSource {
    id: string;
    name: string;
    baseUrl: string;
    method: string;
    authType: string;
    endpoints: ApiEndpoint[];
}

export interface ApiEndpoint {
    path: string;
    method?: string;
    headers?: Record<string, string>;
    queryParams?: Record<string, string>;
    bodyTemplate?: string;
}

export interface Template {
    id: string;
    name: string;
    content: string;
    variables: TemplateVariable[];
    version: number;
    createdAt: string;
}

export interface TemplateVariable {
    name: string;
    type: string;
    required: boolean;
}

export interface GenerationResult {
    generationId: string;
    status: 'COMPLETED' | 'FAILED' | 'PENDING';
    content: string;
    format: string;
}
