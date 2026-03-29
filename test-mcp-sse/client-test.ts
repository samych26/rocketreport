import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

const MCP_URL = "https://rocketreport-mcp.onrender.com/mcp/sse";
const TOKEN = "rr_mcp_55783e4134afe83e1aea9452dd6a1009c29a2603ac176fd4d8bb91f1d3835a0b";

async function runTest() {
  console.log(`🔌 Connexion au serveur MCP SSE (RocketReport) sur ${MCP_URL}...`);
  
  const transport = new SSEClientTransport(new URL(MCP_URL), {
    headers: {
      Authorization: `Bearer ${TOKEN}`
    }
  });

  const client = new Client(
    { name: "rocketreport-test-client", version: "1.0.0" },
    { capabilities: {} }
  );

  try {
    await client.connect(transport);
    console.log("✅ Connecté au serveur MCP SSE avec succès !");

    // Lister les outils disponibles
    console.log("\n📦 Outils disponibles sur ton MCP :");
    const toolsResult = await client.listTools();
    
    if (toolsResult.tools.length === 0) {
      console.log("   (Aucun outil trouvé)");
    } else {
      toolsResult.tools.forEach(t => {
        console.log(` - [${t.name}]: ${t.description}`);
      });
    }

  } catch (err: any) {
    if (err.message?.includes('401')) {
      console.error("❌ Erreur 401 : Ton token n'est pas reconnu par le backend !");
    } else {
      console.error("❌ Erreur lors de la connexion :", err.message || err);
      console.log("👉 Assure-toi que ton serveur MCP est bien lancé (npm run dev dans mcp-rocketreport)");
    }
  } finally {
    // Dans un vrai test SSE, le transport reste ouvert, ici on ferme pour le test
    process.exit(0);
  }
}

runTest();
