import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { AxiosInstance } from "axios";

export const registerDocumentsTools = (server: McpServer, api: AxiosInstance) => {
    
    server.tool(
        "list_documents",
        "Liste les documents (rapports, factures) paramétrés de l'utilisateur.",
        {},
        async () => {
            try {
                const response = await api.get('/documents');
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
        "create_document",
        "Crée ou met à jour la configuration d'un Document.",
        {
            title: z.string().describe("Titre du document (ex: Facture Pro)"),
            apiEndpointId: z.number().describe("ID de l'endpoint rattaché au document").optional(),
            id: z.number().describe("ID du document si mise à jour").optional()
        },
        async ({ title, apiEndpointId, id }) => {
            try {
                let response;
                if (id) {
                    response = await api.put(`/documents/${id}`, { title, apiEndpointId });
                } else {
                    response = await api.post('/documents', { title, apiEndpointId });
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
