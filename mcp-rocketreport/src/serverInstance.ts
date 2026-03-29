import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import axios, { AxiosInstance } from "axios";

const API_BASE_URL = process.env.ROCKETREPORT_API_URL || 'http://localhost:8000/api';
// In Docker, you might use 'http://backend:80' or whatever the backend service is named.
// Make sure to set ROCKETREPORT_API_URL in production.

/**
 * Helper function to create an authenticated Axios client for a given token.
 * This guarantees that every request made inside a tool uses the exact user permissions.
 */
export const createApiClient = (token: string): AxiosInstance => {
    return axios.create({
        baseURL: API_BASE_URL,
        headers: {
            'X-API-KEY': token,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
    });
};

/**
 * Creates a new stateless MCP server instance for a specific authenticated request.
 */
export const createServerInstance = (userId: number, userEmail: string) => {
    const server = new McpServer({
        name: "RocketReport MCP",
        version: "1.0.0",
    });

    // Here we will register all the tools to the server instance.
    // The tools will use the contextual apiToken to make requests.
    return server;
};
