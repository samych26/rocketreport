import express from 'express';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { mcpAuthMiddleware, McpRequest } from './auth.js';
import { createServerInstance, createApiClient } from './serverInstance.js';
import { registerTools } from './tools/index.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Stockage des sessions
const sessions = new Map<string, { server: McpServer; transport: SSEServerTransport }>();

app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', sessions: sessions.size });
});

/**
 * Endpoint SSE
 */
app.get('/mcp/sse', mcpAuthMiddleware, async (req, res) => {
    const mcpReq = req as McpRequest;
    
    // Désactiver le cache pour Render
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    // On utilise un ID de session simple (le début du token + un random) pour débugger facilement
    const sessionId = `session-${mcpReq.apiToken?.substring(0, 8)}-${Math.random().toString(36).substring(7)}`;
    
    const apiClient = createApiClient(mcpReq.apiToken!);
    const server = createServerInstance(mcpReq.user!.id, mcpReq.user!.email);
    registerTools(server, apiClient);

    // On utilise un chemin RELATIF pour éviter les problèmes de host/protocol sur Render
    const transport = new SSEServerTransport(`/mcp/messages?sessionId=${sessionId}`, res);

    await server.connect(transport);
    sessions.set(sessionId, { server, transport });

    console.log(`✅ [SSE] Session créée : ${sessionId} pour ${mcpReq.user?.email}`);

    res.on('close', () => {
        console.log(`⚠️ [SSE] Connexion fermée par le client pour ${sessionId}`);
        // On ne supprime PAS la session immédiatement pour laisser le temps au POST d'arriver
        setTimeout(() => {
            if (sessions.has(sessionId)) {
                console.log(`🗑️ [Cleanup] Suppression session ${sessionId}`);
                server.close();
                sessions.delete(sessionId);
            }
        }, 30000); // 30 secondes de grâce
    });
});

/**
 * Endpoint Messages
 */
app.post('/mcp/messages', async (req, res) => {
    const sessionId = req.query.sessionId as string;
    const session = sessions.get(sessionId);

    console.log(`📩 [POST] Message reçu pour session : ${sessionId}`);

    if (!session) {
        const activeSessions = Array.from(sessions.keys()).join(', ');
        console.error(`❌ [POST] Session ${sessionId} non trouvée ! Sessions actives : [${activeSessions}]`);
        res.status(404).json({ 
            error: 'Session non trouvée ou expirée',
            requestedId: sessionId,
            availableSessions: activeSessions
        });
        return;
    }

    await session.transport.handlePostMessage(req, res);
});

app.listen(PORT, () => {
    console.log(`🚀 RocketReport MCP Server (Diagnostic Mode) sur port ${PORT}`);
});
