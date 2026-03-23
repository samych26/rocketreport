#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, ErrorCode, McpError, } from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
// Default to public API if not set, otherwise allow local override
const DEFAULT_API_URL = "https://api.rocketreport.io";
const API_KEY = process.env.ROCKETREPORT_API_KEY;
const BASE_URL = process.env.ROCKETREPORT_BASE_URL || DEFAULT_API_URL;
if (!API_KEY) {
    console.error("Error: ROCKETREPORT_API_KEY environment variable is required");
    console.error("Please restart with your API Key set. Example:");
    console.error("  ROCKETREPORT_API_KEY=rr_live_xxx npx @rocketreport/mcp-server");
    process.exit(1);
}
/**
 * RocketReport Client logic
 */
class RocketReportClient {
    axiosInstance;
    constructor(apiKey, baseUrl) {
        this.axiosInstance = axios.create({
            baseURL: baseUrl.replace(/\/$/, ""),
            headers: {
                "X-API-KEY": apiKey,
                "Content-Type": "application/json",
            },
        });
    }
    async listApiSources() {
        const response = await this.axiosInstance.get("/api/api-sources");
        return response.data;
    }
    async listApiDocuments(sourceId) {
        const response = await this.axiosInstance.get(`/api/api-sources/${sourceId}/endpoints`);
        return response.data;
    }
    async testApiDocument(sourceId, documentId) {
        const response = await this.axiosInstance.post(`/api/api-sources/${sourceId}/endpoints/${documentId}/test`);
        return response.data;
    }
    async listTemplates() {
        const response = await this.axiosInstance.get("/api/templates");
        return response.data;
    }
    async getTemplate(templateId) {
        const response = await this.axiosInstance.get(`/api/templates/${templateId}`);
        return response.data;
    }
    async upsertTemplate(data) {
        if (data.id) {
            const response = await this.axiosInstance.patch(`/api/templates/${data.id}`, data);
            return response.data;
        }
        else {
            const response = await this.axiosInstance.post("/api/templates", data);
            return response.data;
        }
    }
    // ── Builds & Data Formatting ─────────────────────────────────────────────
    async listBuilds() {
        const response = await this.axiosInstance.get("/api/builds");
        return response.data;
    }
    async upsertBuild(data) {
        if (data.id) {
            const response = await this.axiosInstance.patch(`/api/builds/${data.id}`, data);
            return response.data;
        }
        else {
            const response = await this.axiosInstance.post("/api/builds", data);
            return response.data;
        }
    }
    async runFormattingCode(code, data, language = "javascript") {
        const response = await this.axiosInstance.post("/api/builds/run-code", { code, data, language });
        return response.data;
    }
    async getBuildProcessedData(buildId) {
        const response = await this.axiosInstance.get(`/api/builds/${buildId}/data`);
        return response.data;
    }
    // ── Generation ───────────────────────────────────────────────────────────
    async generateReport(documentId, params = {}) {
        const response = await this.axiosInstance.post(`/api/documents/${documentId}/generations/generate`, { params });
        return response.data;
    }
}
const client = new RocketReportClient(API_KEY, BASE_URL);
/**
 * MCP Server Implementation
 */
const server = new Server({
    name: "rocketreport-server",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
/**
 * List available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "list_api_sources",
                description: "List all configured API data sources (Stripe, Shopify, etc.)",
                inputSchema: { type: "object", properties: {} },
            },
            {
                name: "list_api_documents",
                description: "List all data documents (endpoints) for a specific API source",
                inputSchema: {
                    type: "object",
                    properties: {
                        sourceId: { type: "number", description: "ID of the API source" },
                    },
                    required: ["sourceId"],
                },
            },
            {
                name: "test_api_document",
                description: "Fetch a sample of data from a document to understand its structure",
                inputSchema: {
                    type: "object",
                    properties: {
                        sourceId: { type: "number", description: "ID of the API source" },
                        documentId: { type: "number", description: "ID of the document" },
                    },
                    required: ["sourceId", "documentId"],
                },
            },
            {
                name: "list_templates",
                description: "List all available report templates",
                inputSchema: { type: "object", properties: {} },
            },
            {
                name: "list_builds",
                description: "List all builds (document configurations with data processing code)",
                inputSchema: { type: "object", properties: {} },
            },
            {
                name: "upsert_build",
                description: "Create or update a build. A build connects an API endpoint to a document and includes JS/Python code to format the data.",
                inputSchema: {
                    type: "object",
                    properties: {
                        id: { type: "number", description: "Build ID (for update)" },
                        name: { type: "string", description: "Build name" },
                        api_endpoint_id: { type: "number", description: "ID of the raw API endpoint" },
                        code: { type: "string", description: "JavaScript or Python code to format the data. Use 'return data' to transform raw input." },
                        description: { type: "string", description: "Short description" },
                        template_id: { type: "number", description: "Link a report template to this build" },
                    },
                    required: ["name", "api_endpoint_id", "code"],
                },
            },
            {
                name: "run_formatting_code",
                description: "Test your JavaScript/Python formatting code against sample data before saving the build.",
                inputSchema: {
                    type: "object",
                    properties: {
                        code: { type: "string", description: "The formatting script" },
                        data: { type: "object", description: "The raw data to process" },
                        language: { type: "string", enum: ["javascript", "python"], default: "javascript" },
                    },
                    required: ["code", "data"],
                },
            },
            {
                name: "get_build_processed_data",
                description: "Fetch the final, processed data for a build (after the JS/Python code has run).",
                inputSchema: {
                    type: "object",
                    properties: {
                        buildId: { type: "number", description: "The ID of the build" },
                    },
                    required: ["buildId"],
                },
            },
            {
                name: "upsert_template",
                description: "Create or update a report template (Handlebars HTML)",
                inputSchema: {
                    type: "object",
                    properties: {
                        id: { type: "number", description: "Template ID (optional, for update)" },
                        name: { type: "string", description: "Template name" },
                        content: { type: "string", description: "HTML/Handlebars content" },
                        description: { type: "string", description: "Template description" },
                        output_format: { type: "string", enum: ["pdf", "html", "xlsx"], default: "pdf" },
                    },
                    required: ["name", "content"],
                },
            },
            {
                name: "generate_report",
                description: "Generate a report file from a document and optional parameters",
                inputSchema: {
                    type: "object",
                    properties: {
                        documentId: { type: "number", description: "ID of the document to use for data" },
                        params: { type: "object", description: "Dynamic parameters for filtering data" },
                    },
                    required: ["documentId"],
                },
            },
        ],
    };
});
/**
 * Handle tool calls
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        switch (name) {
            case "list_api_sources":
                return { content: [{ type: "text", text: JSON.stringify(await client.listApiSources(), null, 2) }] };
            case "list_api_documents":
                return { content: [{ type: "text", text: JSON.stringify(await client.listApiDocuments(Number(args?.sourceId)), null, 2) }] };
            case "test_api_document":
                return { content: [{ type: "text", text: JSON.stringify(await client.testApiDocument(Number(args?.sourceId), Number(args?.documentId)), null, 2) }] };
            case "list_templates":
                return { content: [{ type: "text", text: JSON.stringify(await client.listTemplates(), null, 2) }] };
            case "list_builds":
                return { content: [{ type: "text", text: JSON.stringify(await client.listBuilds(), null, 2) }] };
            case "upsert_build":
                return { content: [{ type: "text", text: JSON.stringify(await client.upsertBuild(args), null, 2) }] };
            case "run_formatting_code":
                return { content: [{ type: "text", text: JSON.stringify(await client.runFormattingCode(String(args?.code), args?.data, String(args?.language || "javascript")), null, 2) }] };
            case "get_build_processed_data":
                return { content: [{ type: "text", text: JSON.stringify(await client.getBuildProcessedData(Number(args?.buildId)), null, 2) }] };
            case "upsert_template":
                return { content: [{ type: "text", text: JSON.stringify(await client.upsertTemplate(args), null, 2) }] };
            case "generate_report":
                return { content: [{ type: "text", text: JSON.stringify(await client.generateReport(Number(args?.documentId), args?.params || {}), null, 2) }] };
            default:
                throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
    }
    catch (error) {
        return {
            isError: true,
            content: [{ type: "text", text: error.message || "An error occurred" }],
        };
    }
});
/**
 * Start the server
 */
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("RocketReport MCP Server running on stdio");
}
main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
