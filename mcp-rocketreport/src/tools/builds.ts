import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { AxiosInstance } from "axios";

export const registerBuildsTools = (server: McpServer, api: AxiosInstance) => {
    
    server.tool(
        "list_builds",
        "Liste les builds de code (CodeProcessor) pour un document donné. Un build sert de middleware pour transformer les données avant l'injection dans le template.",
        { documentId: z.number().describe("ID du document") },
        async ({ documentId }) => {
            try {
                const response = await api.get(`/documents/${documentId}/builds`);
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
        "upsert_build",
        "Enregistre ou modifie le code JavaScript/Python pour formater les données extraites avant de les envoyer au moteur de rendu (Template).",
        {
            documentId: z.number().describe("ID du document ciblé"),
            id: z.number().optional().describe("ID du build (si évolution d'un build existant)"),
            code: z.string().describe("Le code source du processeur de données"),
            language: z.enum(['javascript', 'python']).describe("Langage utilisé (ex: javascript)"),
            isActive: z.boolean().optional().describe("Activer le build ?")
        },
        async ({ documentId, id, code, language, isActive }) => {
            try {
                const payload = { code, language, isActive };
                let response;
                if (id) {
                    response = await api.put(`/builds/${id}`, payload);
                } else {
                    response = await api.post(`/documents/${documentId}/builds`, payload);
                }
                return {
                    content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }]
                };
            } catch (error: any) {
                return {
                    content: [{ type: "text", text: `Erreur de mise à jour du build: ${error.response?.data?.error || error.message}` }],
                    isError: true
                };
            }
        }
    );

    server.tool(
        "test_build",
        "Teste l'exécution du CodeProcessor actif en simulation avec un jeu de données.",
        {
            documentId: z.number().describe("ID du Document"),
            testData: z.record(z.any()).describe("JSON contenant des données fictives pour le test")
        },
        async ({ documentId, testData }) => {
            try {
                const response = await api.post(`/builds/${documentId}/run-code`, { buildData: testData });
                return {
                    content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }]
                };
            } catch (error: any) {
                return {
                    content: [{ type: "text", text: `Erreur de simulation du build: ${error.response?.data?.error || error.message}` }],
                    isError: true
                };
            }
        }
    );
};
