import express from 'express';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { mcpAuthMiddleware, McpRequest } from './auth.js';
import { createServerInstance, createApiClient } from './serverInstance.js';
import { registerTools } from './tools/index.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Stockage des sessions actives
const sessions = new Map<string, { server: McpServer; transport: SSEServerTransport }>();

app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', message: 'MCP server is running' });
});

/**
 * Endpoint SSE : Initialise la connexion persistante
 */
app.get('/mcp/sse', mcpAuthMiddleware, async (req, res) => {
    const mcpReq = req as McpRequest;
    if (!mcpReq.user || !mcpReq.apiToken) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    // Désactiver le cache pour Render/Nginx
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); 

    const sessionId = Math.random().toString(36).substring(7);
    const apiClient = createApiClient(mcpReq.apiToken);
    const server = createServerInstance(mcpReq.user.id, mcpReq.user.email);
    registerTools(server, apiClient);

    const transport = new SSEServerTransport(`/mcp/messages?sessionId=${sessionId}`, res);

    await server.connect(transport);
    sessions.set(sessionId, { server, transport });

    console.log(`[SSE] Session créée : ${sessionId} pour ${mcpReq.user.email}`);

    res.on('close', () => {
        console.log(`[SSE] Session terminée : ${sessionId}`);
        // On attend un peu avant de supprimer pour éviter les erreurs de timeout
        setTimeout(() => {
            sessions.delete(sessionId);
            server.close();
        }, 5000); 
    });
});

/**
 * Endpoint Messages : Reçoit les requêtes JSON-RPC du client
 */
app.post('/mcp/messages', async (req, res) => {
    const sessionId = req.query.sessionId as string;
    const session = sessions.get(sessionId);

    if (!session) {
        console.error(`[POST] Session non trouvée : ${sessionId}`);
        res.status(404).json({ error: 'Session non trouvée ou expirée' });
        return;
    }

    await session.transport.handlePostMessage(req, res);
});

app.listen(PORT, () => {
    console.log(`🚀 RocketReport MCP Server (SSE Stable) running on port ${PORT}`);
});
