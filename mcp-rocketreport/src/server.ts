import express from 'express';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { mcpAuthMiddleware, McpRequest } from './auth.js';
import { createServerInstance, createApiClient } from './serverInstance.js';
import { registerTools } from './tools/index.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const sessions = new Map<string, { server: McpServer; transport: SSEServerTransport }>();

app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', sessions: sessions.size });
});

app.get('/mcp/sse', mcpAuthMiddleware, async (req, res) => {
    const mcpReq = req as McpRequest;
    
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    const sessionId = Math.random().toString(36).substring(7);
    
    const apiClient = createApiClient(mcpReq.apiToken!);
    const server = createServerInstance(mcpReq.user!.id, mcpReq.user!.email);
    registerTools(server, apiClient);

    // On utilise un chemin RELATIF simple pour le transport
    const transportEndpoint = `/mcp/messages?sessionId=${sessionId}`;
    console.log(`[SSE] Tentative de création du transport avec endpoint: ${transportEndpoint}`);
    const transport = new SSEServerTransport(transportEndpoint, res);

    await server.connect(transport);
    sessions.set(sessionId, { server, transport });

    console.log(`✅ [SSE] Session créée : ${sessionId} pour ${mcpReq.user?.email}`);

    res.on('close', () => {
        console.log(`⚠️ [SSE] Connexion fermée par le client pour ${sessionId}`);
        setTimeout(() => {
            if (sessions.has(sessionId)) {
                console.log(`🗑️ [Cleanup] Suppression session ${sessionId}`);
                server.close();
                sessions.delete(sessionId);
            }
        }, 30000);
    });
});

app.post('/mcp/messages', async (req, res) => {
    const sessionId = req.query.sessionId as string;
    const session = sessions.get(sessionId);

    console.log(`📩 [POST] Message reçu pour session (requête) : ${sessionId}`);

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
