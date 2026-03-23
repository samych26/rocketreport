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

    const genericConfig = `{
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
                            <a href="#claude" className="mcp-nav-item">Claude Desktop / Code</a>
                            <a href="#gemini" className="mcp-nav-item">Gemini CLI</a>
                            <a href="#antigravity" className="mcp-nav-item">Antigravity IDE</a>
                            <a href="#cursor" className="mcp-nav-item">Cursor</a>
                            <a href="#vscode" className="mcp-nav-item">VS Code & Copilot</a>
                            <a href="#jetbrains" className="mcp-nav-item">JetBrains (WebStorm...)</a>
                        </div>

                        <div className="mcp-sidebar-group">
                            <div className="mcp-sidebar-label">Référence Technique</div>
                            <a href="#tools" className="mcp-nav-item">Outils (Tools)</a>
                            <a href="#prompts" className="mcp-nav-item">Exemples de Prompts</a>
                            <a href="#troubleshooting" className="mcp-nav-item">Dépannage</a>
                        </div>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="mcp-docs-main">
                    
                    <section id="overview" className="mcp-section">
                        <h1>Model Context Protocol</h1>
                        <p className="mcp-lead">
                            Le serveur MCP RocketReport est une interface universelle permettant aux agents IA de piloter votre plateforme de reporting. 
                            <strong>Un seul serveur, une infinité de clients.</strong>
                        </p>
                        <div className="mcp-text-block">
                            Grâce au standard MCP, RocketReport devient une extension naturelle de votre IA. Que vous soyez dans votre terminal, 
                            votre éditeur de code ou une interface de chat, votre IA possède désormais les "mains" nécessaires pour 
                            extraire vos données et générer vos rapports en toute autonomie.
                        </div>
                    </section>

                    <section id="quickstart" className="mcp-section">
                        <h2>Démarrage Rapide</h2>
                        <div className="mcp-step">
                            <div className="mcp-step-number">1</div>
                            <div className="mcp-step-content">
                                <h4>Clé API</h4>
                                <p>Générez votre clé dans <strong>Settings &gt; API Keys</strong>. Gardez-la secrète.</p>
                            </div>
                        </div>
                        <div className="mcp-step">
                            <div className="mcp-step-number">2</div>
                            <div className="mcp-step-content">
                                <h4>Test local</h4>
                                <p>Vérifiez que le serveur répond correctement sur votre machine :</p>
                                <div className="mcp-code-wrapper">
                                    <div className="mcp-code-header">
                                        <span>Terminal</span>
                                        <button className="mcp-copy-btn" onClick={() => copyToClipboard('export ROCKETREPORT_API_KEY=votre_cle\nnpx rocketreport-mcp-server')}>Copier</button>
                                    </div>
                                    <pre className="mcp-code-block">npx rocketreport-mcp-server</pre>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section id="claude" className="mcp-section">
                        <h2>Claude Desktop & Code</h2>
                        <p className="mcp-text-block">
                            Claude est l'un des clients les plus avancés pour MCP. Il permet une interaction visuelle avec vos outils.
                        </p>
                        <p>Ajoutez cette configuration dans votre fichier <code>claude_desktop_config.json</code> :</p>
                        <div className="mcp-code-wrapper">
                            <div className="mcp-code-header">
                                <span>Config JSON</span>
                                <button className="mcp-copy-btn" onClick={() => copyToClipboard(genericConfig)}>Copier</button>
                            </div>
                            <pre className="mcp-code-block"><code>{genericConfig}</code></pre>
                        </div>
                    </section>

                    <section id="gemini" className="mcp-section">
                        <h2>Gemini CLI</h2>
                        <p className="mcp-text-block">
                            L'outil en ligne de commande de Google supporte nativement l'ajout d'extensions MCP via des commandes simples.
                        </p>
                        <div className="mcp-step">
                            <div className="mcp-step-number">1</div>
                            <div className="mcp-step-content">
                                <h4>Ajouter le serveur</h4>
                                <p>Dans votre terminal Gemini CLI, tapez :</p>
                                <div className="mcp-code-wrapper">
                                    <pre className="mcp-code-block">/mcp add rocketreport npx -y rocketreport-mcp-server</pre>
                                </div>
                            </div>
                        </div>
                        <div className="mcp-step">
                            <div className="mcp-step-number">2</div>
                            <div className="mcp-step-content">
                                <h4>Authentification</h4>
                                <p>Gemini vous demandera la clé API au premier lancement ou l'utilisera depuis vos variables d'environnement.</p>
                            </div>
                        </div>
                    </section>

                    <section id="antigravity" className="mcp-section">
                        <h2>Antigravity IDE</h2>
                        <p className="mcp-text-block">
                            Antigravity est l'IDE "agent-first" de Google. Il utilise MCP pour donner à ses agents le contexte total de vos données.
                        </p>
                        <div className="mcp-step">
                            <div className="mcp-step-number">1</div>
                            <div className="mcp-step-content">
                                <h4>Gestionnaire MCP</h4>
                                <p>Cliquez sur l'icône MCP dans la barre latérale ou allez dans <strong>Manage MCP Servers</strong>.</p>
                            </div>
                        </div>
                        <div className="mcp-step">
                            <div className="mcp-step-number">2</div>
                            <div className="mcp-step-content">
                                <h4>Configuration Brute</h4>
                                <p>Collez la configuration JSON RocketReport dans la section "Raw Config" pour activer les agents de design et de data.</p>
                            </div>
                        </div>
                    </section>

                    <section id="cursor" className="mcp-section">
                        <h2>Cursor</h2>
                        <p className="mcp-text-block">
                            Cursor est l'IDE leader pour le développement assisté par IA.
                        </p>
                        <p>Allez dans <strong>Settings &gt; Features &gt; MCP</strong>. Ajoutez un nouveau serveur de type <strong>command</strong> avec :</p>
                        <div className="mcp-code-wrapper">
                            <pre className="mcp-code-block">npx -y rocketreport-mcp-server</pre>
                        </div>
                    </section>

                    <section id="vscode" className="mcp-section">
                        <h2>VS Code & GitHub Copilot</h2>
                        <p className="mcp-text-block">
                            Bien que Copilot ne supporte pas encore nativement MCP au même titre que Claude, vous pouvez l'utiliser via des extensions "Agent" :
                        </p>
                        <ul>
                            <li><strong>Cline (ex Claude Dev) :</strong> Support complet. Ajoutez RocketReport dans les réglages MCP de Cline.</li>
                            <li><strong>MCP Gateway :</strong> Permet d'exposer RocketReport comme une extension Copilot via un bridge local.</li>
                        </ul>
                    </section>

                    <section id="jetbrains" className="mcp-section">
                        <h2>JetBrains (WebStorm, IntelliJ...)</h2>
                        <p className="mcp-text-block">
                            Pour les IDE JetBrains, utilisez l'extension <strong>MCP Bridge</strong> ou configurez votre agent IA local (comme Ollama ou LocalAI) 
                            pour se connecter au serveur RocketReport.
                        </p>
                    </section>

                    <section id="tools" className="mcp-section">
                        <h2>Référence des Outils (Tools)</h2>
                        <div className="mcp-table-wrapper">
                            <table className="mcp-table">
                                <thead>
                                    <tr>
                                        <th>Tool</th>
                                        <th>Usage</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td><span className="mcp-badge-tool">list_api_sources</span></td><td>Lister les connecteurs Stripe, SQL, etc.</td></tr>
                                    <tr><td><span className="mcp-badge-tool">test_api_document</span></td><td>Échantillon de données pour l'analyse IA.</td></tr>
                                    <tr><td><span className="mcp-badge-tool">upsert_template</span></td><td>Écriture de design Handlebars/HTML.</td></tr>
                                    <tr><td><span className="mcp-badge-tool">upsert_build</span></td><td>Injection de logique JS/Python.</td></tr>
                                    <tr><td><span className="mcp-badge-tool">generate_report</span></td><td>Production du document final.</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section id="prompts" className="mcp-section">
                        <h2>Exemples de Prompts</h2>
                        <div className="mcp-card">
                            <p style={{ color: 'white', fontWeight: 600 }}>Automatisation</p>
                            <p className="mcp-text-block"><em>"Regarde mes sources API, crée un build pour formater les données de facturation et génère un template minimaliste Or et Noir."</em></p>
                        </div>
                    </section>

                </main>
            </div>

            <footer className="welcome-footer" style={{ borderTop: '1px solid var(--mcp-border)' }}>
                <span>🚀 RocketReport</span>
                <p>© 2026 RocketReport. Construit pour l'automatisation.</p>
            </footer>
        </div>
    );
};

export default McpDocsPage;
