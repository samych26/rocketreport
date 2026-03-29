import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { AxiosInstance } from "axios";

export const registerGenerationsTools = (server: McpServer, api: AxiosInstance) => {
    
    server.tool(
        "generate_report",
        "Déclenche le cycle complet de rendu pour un Document: extraction d'API, exécution du code de build, compilation Handlebars, puis génération PDF.",
        {
            documentId: z.number().describe("L'ID du document à générer"),
            endpointVariables: z.record(z.any()).optional().describe("Paramètres POST/GET attendus par l'endpoint (ex: { customerId: 10 })")
        },
        async ({ documentId, endpointVariables }) => {
            try {
                // Here we call the backend generation endpoint 
                // Because MCP requires text output (not returning binary files), 
                // we tell the backend to return JSON containing the download URL or status
                const payload = endpointVariables ? { requestParams: endpointVariables } : {};
                
                const response = await api.post(`/builds/${documentId}/generate`, payload);
                
                return {
                    content: [
                        { type: "text", text: "Opération de génération initiée." },
                        { type: "text", text: JSON.stringify(response.data, null, 2) },
                        { type: "text", text: "\n⚠️ Utilisez l'URL retournée (downloadUrl / publicUrl) dans votre navigateur pour visualiser le PDF résultant." }
                    ]
                };
            } catch (error: any) {
                return {
                    content: [{ type: "text", text: `Erreur de génération du PDF: ${error.response?.data?.error || error.message}` }],
                    isError: true
                };
            }
        }
    );

    server.tool(
        "get_generation_logs",
        "Récupère l'historique de log ou le statut pour une génération spécifique.",
        { generationId: z.number().describe("ID de l'entité DocumentGeneration") },
        async ({ generationId }) => {
            try {
                const response = await api.get(`/generations/${generationId}`);
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
};
