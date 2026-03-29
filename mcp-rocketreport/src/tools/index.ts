import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { AxiosInstance } from "axios";
import { registerApiSourcesTools } from "./api_sources.js";
import { registerApiEndpointsTools } from "./api_endpoints.js";
import { registerDocumentsTools } from "./documents.js";
import { registerTemplatesTools } from "./templates.js";
import { registerBuildsTools } from "./builds.js";
import { registerGenerationsTools } from "./generations.js";

/**
 * Registers all the available business tools for the current authenticated user's session.
 * We pass the configured Axios client so tools don't need to know about the auth mechanism.
 */
export const registerTools = (server: McpServer, apiClient: AxiosInstance) => {
    registerApiSourcesTools(server, apiClient);
    registerApiEndpointsTools(server, apiClient);
    registerDocumentsTools(server, apiClient);
    registerTemplatesTools(server, apiClient);
    registerBuildsTools(server, apiClient);
    registerGenerationsTools(server, apiClient);
};
