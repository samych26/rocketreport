import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { AxiosInstance } from "axios";

export const registerApiSourcesTools = (server: McpServer, api: AxiosInstance) => {
    
    server.tool(
        "list_api_sources",
        "Liste toutes les sources API (connecteurs) configurées pour l'utilisateur actuel.",
        {},
        async () => {
            try {
                const response = await api.get('/api-sources');
                return {
                    content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }]
                };
            } catch (error: any) {
                return {
                    content: [{ type: "text", text: `Erreur: ${error.message}` }],
                    isError: true
                };
            }
        }
    );

    server.tool(
        "get_api_source",
        "Récupère les détails d'une source API spécifique par son ID.",
        { id: z.number().describe("L'ID de la source API") },
        async ({ id }) => {
            try {
                const response = await api.get(`/api-sources/${id}`);
                return {
                    content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }]
                };
            } catch (error: any) {
                return {
                    content: [{ type: "text", text: `Erreur: ${error.message}` }],
                    isError: true
                };
            }
        }
    );

    server.tool(
        "create_api_source",
        "Crée une nouvelle source API (connecteur SQL, REST, Stripe, etc.).",
        {
            name: z.string().describe("Nom de la source"),
            baseUrl: z.string().url().describe("URL de base de l'API externe"),
            authType: z.enum(['none', 'bearer', 'basic', 'api_key', 'oauth2']).describe("Type d'authentification"),
            authConfig: z.record(z.any()).describe("Configuration d'authentification JSON (ex: { token: '...' })").optional()
        },
        async (data) => {
            try {
                const response = await api.post(`/api-sources`, data);
                return {
                    content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }]
                };
            } catch (error: any) {
                return {
                    content: [{ type: "text", text: `Erreur de création: ${error.response?.data?.error || error.message}` }],
                    isError: true
                };
            }
        }
    );
};
