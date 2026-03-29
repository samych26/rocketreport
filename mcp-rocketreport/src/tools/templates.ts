import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { AxiosInstance } from "axios";

export const registerTemplatesTools = (server: McpServer, api: AxiosInstance) => {
    
    server.tool(
        "get_template",
        "Récupère le template HTML/Handlebars et les styles CSS rattachés à un Document.",
        { documentId: z.number().describe("L'ID du Document") },
        async ({ documentId }) => {
            try {
                const response = await api.get(`/documents/${documentId}/templates`);
                // En théorie, un document a une liste de templates, on peut renvoyer le premier.
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
        "upsert_template",
        "Met à jour ou crée un Template pour un Document. Permet de modifier le design (HTML, CSS, JSON de configuration).",
        {
            id: z.number().optional().describe("ID du Template s'il existe déjà"),
            documentId: z.number().describe("ID du Document parent"),
            label: z.string().describe("Nom de la version du template (ex: Design Moderne)"),
            content: z.string().describe("Contenu Handlebars du template"),
            outputConfig: z.record(z.any()).optional().describe("Configuration de sortie PDF (marges, format)"),
            version: z.number().optional().describe("Numéro de version (par défaut 1)"),
            isDefault: z.boolean().optional().describe("Marque ce template comme celui par défaut")
        },
        async (data) => {
            try {
                const { id, documentId, ...payload } = data;
                let response;
                if (id) {
                    response = await api.put(`/templates/${id}`, payload);
                } else {
                    response = await api.post(`/documents/${documentId}/templates`, payload);
                }
                return {
                    content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }]
                };
            } catch (error: any) {
                return {
                    content: [{ type: "text", text: `Erreur de modification du template: ${error.response?.data?.error || error.message}` }],
                    isError: true
                };
            }
        }
    );
};
