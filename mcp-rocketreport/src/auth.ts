import express, { Request, Response, NextFunction } from 'express';
import axios from 'axios';

export interface UserContext {
    id: number;
    email: string;
    name: string;
}

export interface McpRequest extends Request {
    user?: UserContext;
    apiToken?: string;
}

const API_BASE_URL = 'https://major-elissa-rocketreport-dbf39593.koyeb.app/api';
// In Docker, you might use 'http://backend:80' or whatever the backend service is named.
// Make sure to set ROCKETREPORT_API_URL in production.

const ALLOWED_ORIGINS = [
    'https://rocketreport.app',
    'http://localhost:5173', // Frontend dev
    // You can add more allowed origins for known browser-based MCP clients 
    // Usually MCP is command-line (server-to-server) so Origin might be absent.
];

export const mcpAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;
    if (origin && !ALLOWED_ORIGINS.includes(origin) && process.env.NODE_ENV === 'production') {
        // Only enforce in prod if Origin is present
         console.warn(`Blocked request from unauthorized origin: ${origin}`);
        // return res.status(403).json({ error: 'Origin not allowed' });
    }

    const authHeader = req.headers.authorization;
    let token = '';

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    } else if (req.query.token) {
        token = req.query.token as string;
    }

    if (!token) {
        res.status(401).json({ error: 'Missing token in Authorization header or query parameter' });
        return;
    }

    try {
        console.log(\`[Auth] Attempting to validate token with: \${API_BASE_URL}/auth/me\`);
        const response = await axios.get(\`\${API_BASE_URL}/auth/me\`, {
            headers: { 'X-API-KEY': token },
        });

        (req as McpRequest).user = response.data.user;
        (req as McpRequest).apiToken = token;
        next();
    } catch (error: any) {
        // Log more details about the error
        console.error(\`[Auth] API Key validation failed for token starting with \${token.substring(0, 10)}...\`);
        console.error('[Auth] Axios Error details:', error.response?.data || error.message);
        res.status(401).json({ error: 'Invalid API key or backend communication error' });
    }
    };
