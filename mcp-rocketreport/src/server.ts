import express from 'express';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { mcpAuthMiddleware, McpRequest } from './auth.js';
import { createServerInstance, createApiClient } from './serverInstance.js';
import { registerTools } from './tools/index.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Global map to hold stateful active sessions for SSE
const transportSessions = new Map<string, { transport: SSEServerTransport, server: McpServer }>();

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'MCP server is running' });
});

/**
 * 1. CLient connects to /mcp/sse with Auth Bearer.
 * We open the EventStream and return the endpoint for future POST messages.
 */
app.get('/mcp/sse', mcpAuthMiddleware, async (req: express.Request, res: express.Response) => {
    const mcpReq = req as McpRequest;
    if (!mcpReq.user || !mcpReq.apiToken) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    try {
        // Create context specific objects
        const apiClient = createApiClient(mcpReq.apiToken);
        const server = createServerInstance(mcpReq.user.id, mcpReq.user.email);
        registerTools(server, apiClient);

        // Required by standard for SSE
        const transport = new SSEServerTransport(
            '/mcp/messages', 
            res
        );
        
        // Connect the server
        await server.connect(transport);

        // Save session internally to route incoming POST requests
        transportSessions.set(transport.sessionId, { transport, server });

        // Clean up when client disconnects
        res.on("close", () => {
            transportSessions.delete(transport.sessionId);
            server.close();
        });

    } catch (error: any) {
        console.error('Failed to handle MCP SSE connection:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal server error while handling MCP' });
        }
    }
});

/**
 * 2. Client posts JSON-RPC messages here.
 * The URL will be hit with `?sessionId=...` automatically by the client SDK based on SSE response.
 */
app.post('/mcp/messages', async (req, res) => {
    // SSEServerTransport injects the sessionId in the query params when it tells the client where to post
    const sessionId = req.query.sessionId as string;
    
    if (!sessionId) {
        res.status(400).send('Session ID is missing');
        return;
    }

    const session = transportSessions.get(sessionId);
    if (!session) {
        // 404 is proper according to MCP spec if session is expired or not found
        res.status(404).send('Session not found or expired');
        return;
    }

    // Pass the message to the transport layer
    try {
        await session.transport.handlePostMessage(req, res);
    } catch (e) {
        console.error("Error handling POST message:", e);
        if (!res.headersSent) {
            res.status(500).send("Message processing failed");
        }
    }
});

app.listen(PORT, () => {
    console.log(`🚀 RocketReport MCP Server running securely on port ${PORT}`);
    console.log(`📡 SSE Endpoint: http://localhost:${PORT}/mcp/sse`);
});
