import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

const TOKEN = "rr_mcp_3e9d5d6ae425baa8b0c40fbbabba26eae78c87b10e1d02ce3cf5812db360087a";
// On passe le token dans l'URL pour plus de stabilité sur Render
const MCP_URL = `https://rocketreport-mcp.onrender.com/mcp/sse?token=\${TOKEN}`;

async function runTest() {
  console.log(`🔌 Connexion au serveur MCP SSE (RocketReport) sur \${MCP_URL}...`);
  
  const transport = new SSEClientTransport(new URL(MCP_URL), {
    // Le token est maintenant uniquement dans l'URL, le header Authorization est supprimé pour éviter les conflits
  });

  const client = new Client(
    { name: "rocketreport-test-client", version: "1.0.0" },
    { capabilities: {} }
  );

  try {
    await client.connect(transport);
    console.log("✅ Connecté au serveur MCP SSE avec succès !");

    console.log("
📦 Outils disponibles sur ton MCP :");
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
      console.log("👉 Cause probable : Le serveur MCP sur Render n'utilise pas encore la variable ROCKETREPORT_API_URL correctement.");
    } else {
      console.error("❌ Erreur lors de la connexion :", err.message || err);
    }
  } finally {
    process.exit(0);
  }
}

runTest();
