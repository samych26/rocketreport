import express from 'express';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { mcpAuthMiddleware, McpRequest } from './auth.js';
import { createServerInstance, createApiClient } from './serverInstance.js';
import { registerTools } from './tools/index.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Health check endpoint
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', message: 'MCP server is running' });
});

/**
 * Main MCP endpoint using Streamable HTTP Transport (MCP spec 2025-03-26).
 * VS Code, Cursor and modern MCP clients use this single-endpoint pattern.
 * The transport handles both regular JSON-RPC and SSE streaming internally.
 */
app.all('/mcp', mcpAuthMiddleware, async (req: express.Request, res: express.Response) => {
    const mcpReq = req as McpRequest;
    if (!mcpReq.user || !mcpReq.apiToken) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    try {
        const apiClient = createApiClient(mcpReq.apiToken);
        const server = createServerInstance(mcpReq.user.id, mcpReq.user.email);
        registerTools(server, apiClient);

        // Stateless: one transport instance per request
        const transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: undefined, // Stateless mode
        });

        await server.connect(transport);
        await transport.handleRequest(req, res, req.body);

        res.on('close', () => {
            transport.close();
            server.close();
        });

    } catch (error: any) {
        console.error('Failed to handle MCP request:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

app.listen(PORT, () => {
    console.log(`🚀 RocketReport MCP Server running on port \${PORT}`);
    console.log(`📡 MCP Endpoint: http://localhost:\${PORT}/mcp`);
});
