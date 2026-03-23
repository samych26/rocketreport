# RocketReport MCP Server

Connect your AI agent (Claude, Cursor, VS Code) directly to your RocketReport account. Generate PDFs, analyze data sources, and manage templates using natural language.

## Quick Start (No Installation)

You can run the server directly using `npx`:

```bash
export ROCKETREPORT_API_KEY=rr_live_your_key_here
npx -y @rocketreport/mcp-server
```

## Setup for AI Clients

### 1. Claude Desktop (Mac/Windows)

Add this to your configuration file:
- **Mac:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "rocketreport": {
      "command": "npx",
      "args": [
        "-y",
        "@rocketreport/mcp-server"
      ],
      "env": {
        "ROCKETREPORT_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### 2. Cursor / VS Code (with MCP Extension)

If your editor supports MCP servers via configuration:

```json
"mcpServers": {
  "rocketreport": {
    "command": "npx",
    "args": ["-y", "@rocketreport/mcp-server"],
    "env": {
      "ROCKETREPORT_API_KEY": "your_api_key_here"
    }
  }
}
```

## Features

- **Analyze Data:** Ask "What are my top selling products from Stripe?" (requires connected source).
- **Format Data (Builds):** Write JavaScript/Python scripts to filter or transform data before reporting.
- **Create Reports:** "Generate a PDF report for last month's sales using the 'Modern' template."
- **Design Templates:** "Create a new invoice template with a blue header and a table for items."

## Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `ROCKETREPORT_API_KEY` | **Required.** Your API Key found in settings. | - |
| `ROCKETREPORT_BASE_URL` | Optional. Change if you self-host RocketReport. | `https://api.rocketreport.io` |

## Troubleshooting

Logs are written to `stderr` so they don't interfere with the MCP protocol on `stdout`.
If you see connection errors, ensure your API key is valid and has permissions.
