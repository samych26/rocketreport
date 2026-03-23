import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import WelcomeNavbar from '../components/WelcomeNavbar';
import './McpDocsPage.css';

const McpDocsPage = () => {
    const { t } = useLanguage();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const configCode = `{
  "mcpServers": {
    "rocketreport": {
      "command": "npx",
      "args": ["-y", "rocketreport-mcp-server"],
      "env": {
        "ROCKETREPORT_API_KEY": "YOUR_API_KEY_HERE"
      }
    }
  }
}`;

    return (
        <div className="mcp-docs-page">
            <WelcomeNavbar />
            
            <main className="mcp-docs-content">
                <section className="mcp-docs-hero">
                    <div className="mcp-badge">MCP Protocol</div>
                    <h1>{t('mcp_title')}</h1>
                    <p className="mcp-subtitle">{t('mcp_subtitle')}</p>
                </section>

                <section className="mcp-docs-grid">
                    <div className="mcp-docs-main">
                        <div className="mcp-card">
                            <h2>{t('mcp_install_title')}</h2>
                            <p>{t('mcp_install_step1')}</p>
                            <p>{t('mcp_install_step2')}</p>
                        </div>

                        <div className="mcp-card">
                            <h2>{t('mcp_conf_title')}</h2>
                            <p>{t('mcp_conf_desc')}</p>
                            <pre className="mcp-code-block">
                                <code>{configCode}</code>
                            </pre>
                        </div>

                        <div className="mcp-card">
                            <h2>{t('mcp_features_title')}</h2>
                            <ul>
                                <li><strong>🔍 {t('nav_api_sources')} :</strong> {t('mcp_feat_data')}</li>
                                <li><strong>💻 {t('nav_build')} :</strong> {t('mcp_feat_build')}</li>
                                <li><strong>📄 {t('nav_generations')} :</strong> {t('mcp_feat_gen')}</li>
                            </ul>
                        </div>
                    </div>

                    <aside className="mcp-docs-sidebar">
                        <div className="mcp-sidebar-card">
                            <h3>Liens Rapides</h3>
                            <a href="https://www.npmjs.com/package/rocketreport-mcp-server" target="_blank" rel="noopener noreferrer" className="mcp-link">
                                📦 Voir sur NPM
                            </a>
                            <a href="https://modelcontextprotocol.io/" target="_blank" rel="noopener noreferrer" className="mcp-link">
                                🌐 Qu'est-ce que MCP ?
                            </a>
                            <Link to="/register" className="mcp-btn-primary">
                                Commencer →
                            </Link>
                        </div>
                    </aside>
                </section>
            </main>

            <footer className="welcome-footer">
                <span>🚀 RocketReport</span>
                <p>{t('footer_text')}</p>
            </footer>
        </div>
    );
};

export default McpDocsPage;
