import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { AxiosInstance } from "axios";

export const registerApiEndpointsTools = (server: McpServer, api: AxiosInstance) => {
    
    server.tool(
        "list_api_endpoints",
        "Liste les endpoints API rattachés à une source API.",
        { apiSourceId: z.number().describe("ID de la source API parente") },
        async ({ apiSourceId }) => {
            try {
                // Normally this would be /api-sources/{id}/endpoints or filtering via query
                const response = await api.get(`/api-sources/${apiSourceId}/endpoints`);
                return {
                    content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }]
                };
            } catch (error: any) {
                return {
                    content: [{ type: "text", text: `Erreur: ${error.response?.data?.error || error.message}` }],
                    isError: true
                };
            }
        }
    );

    server.tool(
        "upsert_api_endpoint",
        "Crée ou met à jour un endpoint utilisé pour extraire les données pour un rapport.",
        {
            apiSourceId: z.number().describe("ID de la source API"),
            id: z.number().optional().describe("ID de l'endpoint (pour une mise à jour)"),
            name: z.string().describe("Nom de l'endpoint"),
            path: z.string().describe("Chemin relatif de l'endpoint (ex: /v1/customers)"),
            method: z.string().describe("GET, POST, etc."),
            schemaDefinition: z.record(z.any()).optional().describe("Schéma des variables"),
            headers: z.record(z.string()).optional().describe("Headers spécifiques")
        },
        async (data) => {
            try {
                const { apiSourceId, id, ...payload } = data;
                let response;
                if (id) {
                    response = await api.put(`/api-endpoints/${id}`, payload);
                } else {
                    response = await api.post(`/api-sources/${apiSourceId}/endpoints`, payload);
                }
                return {
                    content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }]
                };
            } catch (error: any) {
                return {
                    content: [{ type: "text", text: `Erreur: ${error.response?.data?.error || error.message}` }],
                    isError: true
                };
            }
        }
    );
};
