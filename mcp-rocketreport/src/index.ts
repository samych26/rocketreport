#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import axios, { AxiosInstance } from "axios";

import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";

dotenv.config();

// Lecture de la config mcp.json si présente
let mcpConfig: { apiKey?: string; baseUrl?: string } = {};
try {
  const mcpPath = path.resolve(__dirname, "../mcp.json");
  if (fs.existsSync(mcpPath)) {
    mcpConfig = JSON.parse(fs.readFileSync(mcpPath, "utf-8"));
  }
} catch (e) {
  console.error("Erreur de lecture de mcp.json:", e);
}


const DEFAULT_API_URL = "https://api.rocketreport.io";
const API_KEY = process.env.ROCKETREPORT_API_KEY || mcpConfig.apiKey;
const BASE_URL = process.env.ROCKETREPORT_BASE_URL || mcpConfig.baseUrl || DEFAULT_API_URL;
const PORT = process.env.PORT || 3000;

/**
 * RocketReport Client logic
 */
class RocketReportClient {
  private axiosInstance: AxiosInstance;

  constructor(apiKey: string, baseUrl: string) {
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

  async listApiDocuments(sourceId: number) {
    const response = await this.axiosInstance.get(`/api/api-sources/${sourceId}/endpoints`);
    return response.data;
  }

  async testApiDocument(sourceId: number, documentId: number) {
    const response = await this.axiosInstance.post(`/api/api-sources/${sourceId}/endpoints/${documentId}/test`);
    return response.data;
  }

  async listTemplates() {
    const response = await this.axiosInstance.get("/api/templates");
    return response.data;
  }

  async getTemplate(templateId: number) {
    const response = await this.axiosInstance.get(`/api/templates/${templateId}`);
    return response.data;
  }

  async upsertTemplate(data: any) {
    if (data.id) {
      const response = await this.axiosInstance.patch(`/api/templates/${data.id}`, data);
      return response.data;
    } else {
      const response = await this.axiosInstance.post("/api/templates", data);
      return response.data;
    }
  }

  async listBuilds() {
    const response = await this.axiosInstance.get("/api/builds");
    return response.data;
  }

  async upsertBuild(data: any) {
    if (data.id) {
      const response = await this.axiosInstance.patch(`/api/builds/${data.id}`, data);
      return response.data;
    } else {
      const response = await this.axiosInstance.post("/api/builds", data);
      return response.data;
    }
  }

  async runFormattingCode(code: string, data: any, language: string = "javascript") {
    const response = await this.axiosInstance.post("/api/builds/run-code", { code, data, language });
    return response.data;
  }

  async getBuildProcessedData(buildId: number) {
    const response = await this.axiosInstance.get(`/api/builds/${buildId}/data`);
    return response.data;
  }

  async generateReport(documentId: number, params: Record<string, any> = {}) {
    const response = await this.axiosInstance.post(`/api/documents/${documentId}/generations/generate`, { params });
    return response.data;
  }
}

/**
 * MCP Server Implementation
 */
const server = new Server(
  {
    name: "rocketreport-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const sessionApiKeys = new Map<string, string>();

// Register Tool Handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "set_api_key",
        description: "Set the RocketReport API key for the current session if not provided via environment or headers.",
        inputSchema: {
          type: "object",
          properties: {
            apiKey: { type: "string", description: "Your RocketReport API key" },
          },
          required: ["apiKey"],
        },
      },
      {
        name: "list_api_sources",
        description: "List all configured API data sources (Stripe, Shopify, etc.)",
        inputSchema: { type: "object", properties: {} },
      },
      // ... (rest of tools)
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
        description: "List all builds (configurations with data processing code)",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "upsert_build",
        description: "Create or update a build. Links an API endpoint to formatting logic.",
        inputSchema: {
          type: "object",
          properties: {
            id: { type: "number" },
            name: { type: "string" },
            api_endpoint_id: { type: "number" },
            code: { type: "string" },
            description: { type: "string" },
            template_id: { type: "number" },
          },
          required: ["name", "api_endpoint_id", "code"],
        },
      },
      {
        name: "upsert_template",
        description: "Create or update a report template (Handlebars HTML)",
        inputSchema: {
          type: "object",
          properties: {
            id: { type: "number" },
            name: { type: "string" },
            content: { type: "string" },
            description: { type: "string" },
            output_format: { type: "string", enum: ["pdf", "html", "xlsx"], default: "pdf" },
          },
          required: ["name", "content"],
        },
      },
      {
        name: "generate_report",
        description: "Generate a report file from a document",
        inputSchema: {
          type: "object",
          properties: {
            documentId: { type: "number" },
            params: { type: "object" },
          },
          required: ["documentId"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request, extra) => {
  const { name, arguments: args } = request.params;
  

  // 1. Try to get API key from session (SSE)
  const sessionId = (extra as any)?.transport?.sessionId;
  const sessionApiKey = sessionId ? sessionApiKeys.get(sessionId) : null;

  // 2. Try to get from request headers (some clients might send them)
  const meta = request.params._meta as any;
  const headers = meta?.headers || {};
  const authHeader = headers["authorization"] || headers["Authorization"] || headers["AUTHORIZATION"];
  const headerApiKey = authHeader?.replace("Bearer ", "");

  // 3. Fallback to environment variable
  let effectiveApiKey = sessionApiKey || headerApiKey || process.env.ROCKETREPORT_API_KEY;

  // 4. Fallback to mcp.json (lecture dynamique)
  if (!effectiveApiKey) {
    try {
      const fs = await import("fs");
      const path = await import("path");
      const mcpPath = path.resolve(__dirname, "../mcp.json");
      if (fs.existsSync(mcpPath)) {
        const mcpConfig = JSON.parse(fs.readFileSync(mcpPath, "utf-8"));
        if (mcpConfig.apiKey) {
          effectiveApiKey = mcpConfig.apiKey;
        }
      }
    } catch (e) {
      // ignore
    }
  }

  // Tool: set_api_key (special case as it doesn't require a pre-existing key)
  if (name === "set_api_key") {
    if (sessionId) {
      sessionApiKeys.set(sessionId, (args?.apiKey as string).trim());
      return { content: [{ type: "text", text: "API key has been set for this session." }] };
    } else {
      return { content: [{ type: "text", text: "API key cannot be set for a stdio session. Use the ROCKETREPORT_API_KEY environment variable instead." }] };
    }
  }

  if (!effectiveApiKey) {
    throw new McpError(ErrorCode.InvalidRequest, "API Key is required. Veuillez renseigner la clé dans la variable d'environnement, les headers, la session, ou dans mcp.json.");
  }

  const client = new RocketReportClient(effectiveApiKey, BASE_URL);

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
      case "upsert_template":
        return { content: [{ type: "text", text: JSON.stringify(await client.upsertTemplate(args), null, 2) }] };
      case "generate_report":
        return { content: [{ type: "text", text: JSON.stringify(await client.generateReport(Number(args?.documentId), (args?.params as any) || {}), null, 2) }] };
      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      isError: true,
      content: [{ type: "text", text: error.message || "An error occurred" }],
    };
  }
});

/**
 * Execution Mode Selector
 */
const mode = process.argv.includes("--sse") ? "sse" : "stdio";

if (mode === "sse") {
  const app = express();
  app.use(cors());
  // Removed app.use(express.json()) to prevent body stream consumption before MCP SDK reads it

  const transports = new Map<string, SSEServerTransport>();

  app.get("/mcp", async (req, res) => {
    console.error("New SSE connection attempt");
    const transport = new SSEServerTransport("/messages", res);
    const sessionId = transport.sessionId;
    transports.set(sessionId, transport);
    
    // Store API key from query param or Authorization header
    let apiKey = req.query.apiKey as string;
    
    if (!apiKey && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith("Bearer ")) {
        apiKey = authHeader.replace("Bearer ", "").trim();
      } else {
        apiKey = authHeader.trim();
      }
    }

    if (apiKey) {
      sessionApiKeys.set(sessionId, apiKey);
      console.error(`Session ${sessionId} authenticated via credentials`);
    } else {
      console.error(`Session ${sessionId} connected without an API key`);
    }
    
    await server.connect(transport);
    
    // Clean up when connection closes
    res.on("close", () => {
      transports.delete(sessionId);
      sessionApiKeys.delete(sessionId);
      console.error(`Session ${sessionId} closed`);
    });
  });

  app.post("/messages", async (req, res) => {
    const sessionId = req.query.sessionId as string;
    const transport = transports.get(sessionId);

    if (transport) {
      await transport.handlePostMessage(req, res);
    } else {
      res.status(400).send("Session not found");
    }
  });

  app.listen(PORT, () => {
    console.error(`RocketReport MCP Server (SSE) running on port ${PORT}`);
    console.error(`URL: http://localhost:${PORT}/mcp`);
  });
} else {
  // Mode Stdio (local npx)
  const transport = new StdioServerTransport();
  server.connect(transport).then(() => {
    console.error("RocketReport MCP Server (Stdio) running");
  });
}
