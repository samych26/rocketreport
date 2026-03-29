import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import fetch from "node-fetch";

// Pour gérer de manière asynchrone les fetch dans Node en 2026/SDK
if (!globalThis.fetch) {
  globalThis.fetch = fetch as any;
}

const MCP_URL = "https://rocketreport-mcp.onrender.com/mcp/sse";
// IMPORTANT: Remplace par une vraie clé générée sur ton interface "Développeur > Settings"
const API_KEY = process.env.MCP_API_KEY || "rr_mcp_REMPLACE_PAR_TA_CLE";

async function runTest() {
  console.log(`🔌 Connexion à ${MCP_URL}...`);
  
  const transport = new SSEClientTransport(new URL(MCP_URL), {
    headers: {
      Authorization: `Bearer ${API_KEY}`
    }
  });

  const client = new Client(
    { name: "rocketreport-cli-tester", version: "1.0.0" },
    { capabilities: {} }
  );

  try {
    await client.connect(transport);
    console.log("✅ Connecté au serveur MCP SSE avec succès !");

    // Tester la découverte des outils (Tools)
    console.log("\n📦 Outils disponibles :");
    const toolsResult = await client.listTools();
    toolsResult.tools.forEach(t => console.log(` - ${t.name}: ${t.description}`));

    // Optionnel : tester l'exécution d'un outil
    // console.log("\n🚀 Appel de 'list_documents'...");
    // const result = await client.callTool({ name: "list_documents", arguments: {} });
    // console.log(JSON.stringify(result, null, 2));

  } catch (err: any) {
    if (err.message?.includes('401')) {
      console.error("❌ Erreur 401 : Ta clé API n'est pas reconnue ou ton backend Symfony te rejette !");
    } else {
      console.error("❌ Erreur de connexion :", err.message || err);
    }
  } finally {
    process.exit(0);
  }
}

runTest();
