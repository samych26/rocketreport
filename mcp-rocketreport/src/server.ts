import express from 'express';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { mcpAuthMiddleware, McpRequest } from './auth.js';
import { createServerInstance, createApiClient } from './serverInstance.js';
import { registerTools } from './tools/index.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Stockage des sessions plus long pour éviter les 404 sur Render
const sessions = new Map<string, { server: McpServer; transport: SSEServerTransport; lastAccess: number }>();

// Nettoyage automatique des vieilles sessions toutes les 10 minutes
setInterval(() => {
    const now = Date.now();
    for (const [id, session] of sessions.entries()) {
        if (now - session.lastAccess > 600000) { // 10 minutes
            console.log(`[Cleanup] Suppression session expirée : ${id}`);
            session.server.close();
            sessions.delete(id);
        }
    }
}, 60000);

app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', message: 'MCP server is running', sessions: sessions.size });
});

/**
 * Endpoint SSE
 */
app.get('/mcp/sse', mcpAuthMiddleware, async (req, res) => {
    const mcpReq = req as McpRequest;
    if (!mcpReq.user || !mcpReq.apiToken) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    // Headers critiques pour Render
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    const sessionId = Math.random().toString(36).substring(7);
    const apiClient = createApiClient(mcpReq.apiToken);
    const server = createServerInstance(mcpReq.user.id, mcpReq.user.email);
    registerTools(server, apiClient);

    // Construction de l'URL absolue pour le transport (indispensable pour Render)
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.get('host');
    const endpointUrl = `${protocol}://${host}/mcp/messages?sessionId=${sessionId}`;

    console.log(`[SSE] Initialisation session ${sessionId} - Endpoint: ${endpointUrl}`);

    const transport = new SSEServerTransport(endpointUrl as any, res);

    await server.connect(transport);
    sessions.set(sessionId, { server, transport, lastAccess: Date.now() });

    res.on('close', () => {
        console.log(`[SSE] Connexion interrompue pour ${sessionId} (session conservée en mémoire)`);
    });
});

/**
 * Endpoint Messages
 */
app.post('/mcp/messages', async (req, res) => {
    const sessionId = req.query.sessionId as string;
    const session = sessions.get(sessionId);

    if (!session) {
        console.error(`[POST] Session non trouvée : ${sessionId}. Sessions actives : ${Array.from(sessions.keys()).join(', ')}`);
        res.status(404).json({ error: 'Session non trouvée ou expirée' });
        return;
    }

    session.lastAccess = Date.now();
    await session.transport.handlePostMessage(req, res);
});

app.listen(PORT, () => {
    console.log(`🚀 RocketReport MCP Server (Render-Optimized) running on port ${PORT}`);
});
