import { useEffect } from 'react';
import WelcomeNavbar from '../components/WelcomeNavbar';
import './McpDocsPage.css';

const McpDocsPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Copié dans le presse-papier !');
    };

    const claudeConfig = `{
  "mcpServers": {
    "rocketreport": {
      "command": "npx",
      "args": ["-y", "rocketreport-mcp-server"],
      "env": {
        "ROCKETREPORT_API_KEY": "VOTRE_CLE_API_ICI"
      }
    }
  }
}`;

    return (
        <div className="mcp-docs-page">
            <WelcomeNavbar />
            
            <div className="mcp-docs-container">
                {/* Sidebar Navigation */}
                <aside className="mcp-docs-sidebar">
                    <nav className="mcp-sidebar-nav">
                        <div className="mcp-sidebar-group">
                            <div className="mcp-sidebar-label">Introduction</div>
                            <a href="#overview" className="mcp-nav-item active">Présentation</a>
                            <a href="#quickstart" className="mcp-nav-item">Démarrage Rapide</a>
                        </div>
                        
                        <div className="mcp-sidebar-group">
                            <div className="mcp-sidebar-label">Configuration Clients</div>
                            <a href="#claude" className="mcp-nav-item">Claude Desktop</a>
                            <a href="#cursor" className="mcp-nav-item">Cursor</a>
                            <a href="#vscode" className="mcp-nav-item">VS Code (Cline)</a>
                            <a href="#cli" className="mcp-nav-item">CLI (npx)</a>
                        </div>

                        <div className="mcp-sidebar-group">
                            <div className="mcp-sidebar-label">Référence</div>
                            <a href="#tools" className="mcp-nav-item">Outils disponibles</a>
                            <a href="#examples" className="mcp-nav-item">Exemples de Prompts</a>
                        </div>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="mcp-docs-main">
                    
                    <section id="overview" className="mcp-section">
                        <h1>Model Context Protocol</h1>
                        <p className="mcp-lead">
                            Connectez RocketReport directement à vos outils d'intelligence artificielle préférés. 
                            Générez des rapports, analysez vos données et créez des templates via de simples prompts.
                        </p>
                        <div className="mcp-text-block">
                            Le serveur MCP RocketReport agit comme un pont entre vos LLMs (Claude, GPT-4, etc.) et votre plateforme RocketReport. 
                            Il permet à l'IA d'utiliser vos sources de données en temps réel pour produire des documents PDF, HTML ou Excel de haute qualité.
                        </div>
                    </section>

                    <section id="quickstart" className="mcp-section">
                        <h2>Démarrage Rapide</h2>
                        <div className="mcp-step">
                            <div className="mcp-step-number">1</div>
                            <div className="mcp-step-content">
                                <h4>Obtenir une clé API</h4>
                                <p>Rendez-vous dans vos <strong>Paramètres</strong> sur RocketReport et générez une nouvelle clé API.</p>
                            </div>
                        </div>
                        <div className="mcp-step">
                            <div className="mcp-step-number">2</div>
                            <div className="mcp-step-content">
                                <h4>Installer le serveur</h4>
                                <p>Le serveur est disponible sur NPM. Vous pouvez le lancer directement sans installation globale.</p>
                                <div className="mcp-code-wrapper">
                                    <div className="mcp-code-header">
                                        <span>Terminal</span>
                                        <button className="mcp-copy-btn" onClick={() => copyToClipboard('npx -y rocketreport-mcp-server')}>Copier</button>
                                    </div>
                                    <pre className="mcp-code-block">npx -y rocketreport-mcp-server</pre>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section id="claude" className="mcp-section">
                        <h2>Claude Desktop</h2>
                        <p className="mcp-text-block">
                            Pour utiliser RocketReport avec Claude Desktop, vous devez modifier votre fichier de configuration local.
                        </p>
                        
                        <h3>Fichier de configuration</h3>
                        <p>Ouvrez le fichier suivant selon votre système :</p>
                        <ul>
                            <li><strong>MacOS :</strong> <code>~/Library/Application Support/Claude/claude_desktop_config.json</code></li>
                            <li><strong>Windows :</strong> <code>%APPDATA%\Claude\claude_desktop_config.json</code></li>
                        </ul>

                        <div className="mcp-code-wrapper">
                            <div className="mcp-code-header">
                                <span>claude_desktop_config.json</span>
                                <button className="mcp-copy-btn" onClick={() => copyToClipboard(claudeConfig)}>Copier</button>
                            </div>
                            <pre className="mcp-code-block">
                                <code>{claudeConfig}</code>
                            </pre>
                        </div>
                    </section>

                    <section id="cursor" className="mcp-section">
                        <h2>Cursor</h2>
                        <p className="mcp-text-block">
                            Cursor supporte nativement le protocole MCP via son interface graphique.
                        </p>
                        <div className="mcp-step">
                            <div className="mcp-step-number">1</div>
                            <div className="mcp-step-content">
                                <h4>Ouvrir les réglages</h4>
                                <p>Allez dans <strong>Settings &gt; Features &gt; MCP</strong>.</p>
                            </div>
                        </div>
                        <div className="mcp-step">
                            <div className="mcp-step-number">2</div>
                            <div className="mcp-step-content">
                                <h4>Ajouter un serveur</h4>
                                <p>Cliquez sur <strong>"+ Add Server"</strong> et remplissez les champs :</p>
                                <ul>
                                    <li><strong>Name :</strong> RocketReport</li>
                                    <li><strong>Type :</strong> command</li>
                                    <li><strong>Command :</strong> <code>npx -y rocketreport-mcp-server</code></li>
                                </ul>
                            </div>
                        </div>
                        <div className="mcp-step">
                            <div className="mcp-step-number">3</div>
                            <div className="mcp-step-content">
                                <h4>Variables d'environnement</h4>
                                <p>Ajoutez <code>ROCKETREPORT_API_KEY</code> avec votre clé dans la section env.</p>
                            </div>
                        </div>
                    </section>

                    <section id="vscode" className="mcp-section">
                        <h2>VS Code (Cline)</h2>
                        <p className="mcp-text-block">
                            L'extension <strong>Cline</strong> (anciennement Claude Dev) permet d'utiliser MCP dans VS Code.
                        </p>
                        <p>Dans les paramètres de Cline, cherchez la section <strong>MCP Servers</strong> et ajoutez la même configuration que pour Claude Desktop.</p>
                    </section>

                    <section id="tools" className="mcp-section">
                        <h2>Outils Disponibles</h2>
                        <p className="mcp-text-block">Voici la liste des outils que l'IA peut utiliser une fois connectée :</p>
                        
                        <div className="mcp-table-wrapper">
                            <table className="mcp-table">
                                <thead>
                                    <tr>
                                        <th>Outil</th>
                                        <th>Description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><span className="mcp-badge-tool">list_api_sources</span></td>
                                        <td>Liste toutes les sources de données configurées (Stripe, SQL, etc.)</td>
                                    </tr>
                                    <tr>
                                        <td><span className="mcp-badge-tool">test_api_document</span></td>
                                        <td>Récupère un échantillon de données pour analyse.</td>
                                    </tr>
                                    <tr>
                                        <td><span className="mcp-badge-tool">upsert_template</span></td>
                                        <td>Crée ou modifie un design de rapport (Handlebars).</td>
                                    </tr>
                                    <tr>
                                        <td><span className="mcp-badge-tool">upsert_build</span></td>
                                        <td>Injecte du code JS/Python pour transformer les données.</td>
                                    </tr>
                                    <tr>
                                        <td><span className="mcp-badge-tool">generate_report</span></td>
                                        <td>Produit le document final (PDF, HTML, XLSX).</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section id="examples" className="mcp-section">
                        <h2>Exemples de Prompts</h2>
                        <div className="mcp-card">
                            <p style={{ color: 'white', fontWeight: 600 }}>Analyse & Rapport</p>
                            <p className="mcp-text-block">
                                <em>"Analyse mes ventes sur Stripe du mois dernier et génère-moi un rapport PDF qui met en évidence les 5 meilleurs produits."</em>
                            </p>
                        </div>
                        <div className="mcp-card">
                            <p style={{ color: 'white', fontWeight: 600 }}>Transformation Technique</p>
                            <p className="mcp-text-block">
                                <em>"Connecte-toi à l'API Shopify, écris un script JS pour calculer la marge brute de chaque article, et crée un template moderne pour afficher le résultat."</em>
                            </p>
                        </div>
                    </section>

                </main>
            </div>

            <footer className="welcome-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <span>🚀 RocketReport</span>
                <p>© 2026 RocketReport. Construit pour l'automatisation.</p>
            </footer>
        </div>
    );
};

export default McpDocsPage;
