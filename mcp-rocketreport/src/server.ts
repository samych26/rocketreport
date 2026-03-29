import express from 'express';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/http.js';
import { mcpAuthMiddleware, McpRequest } from './auth.js';
import { createServerInstance, createApiClient } from './serverInstance.js';
import { registerTools } from './tools/index.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'MCP server is running' });
});

app.post('/mcp/messages', async (req, res) => {
    // Handling incoming messages to the active session. This differs for SSE vs SSE-less.
    // StreamableHTTPServerTransport accepts the POST messages here.
    return res.status(405).json({ error: 'Use the correct Streamable HTTPS endpoint setup' });
});

// Since we're using StreamableHTTPServerTransport (spec 2025-03-26), the transport
// expects to be bound to a POST request and handles exactly one session per HTTP lifecyle.
app.post('/mcp', mcpAuthMiddleware, async (req: express.Request, res: express.Response) => {
    const mcpReq = req as McpRequest;
    if (!mcpReq.user || !mcpReq.apiToken) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    try {
        const apiClient = createApiClient(mcpReq.apiToken);
        const server = createServerInstance(mcpReq.user.id, mcpReq.user.email);
        
        // Register tools with the context of this specific user's API client
        registerTools(server, apiClient);

        // Required by standard for StreamableHTTPServerTransport
        const transport = new StreamableHTTPServerTransport();
        
        // Connect the server to transport
        await server.connect(transport);

        // Handle the transport over the HTTP request/response
        const cleanup = await transport.handlePostMessage(req, res);

        // Clean up connection when the client disconnects or request finishes
        res.on("close", () => {
            cleanup();
            server.close();
        });

    } catch (error: any) {
        console.error('Failed to handle MCP request:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal server error while handling MCP' });
        }
    }
});

app.listen(PORT, () => {
    console.log(`🚀 RocketReport MCP Server running securely on port ${PORT}`);
    console.log(`📡 URL: http://localhost:${PORT}/mcp`);
});
