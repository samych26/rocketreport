import { Link } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import './LoadingPage.css';

const LoadingPage = () => {
    const { t } = useLanguage();

    return (
        <div className="landing-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="tagline">{t('tagline')}</div>
                <h1 className="hero-title">{t('hero_title')}</h1>
                <p className="hero-subtitle">{t('hero_subtitle')}</p>

                <div className="hero-actions">
                    <Link to="/register" className="btn-primary" style={{ textDecoration: 'none' }}>{t('get_started')} &rarr;</Link>
                    <Link to="/login" className="btn-secondary" style={{ textDecoration: 'none' }}>{t('login_submit')} &rarr;</Link>
                </div>

                {/* Central Graphic / Loading Area */}
                <div className="hero-graphic-container">
                    <div className="graphic-mockup">
                        <div className="logo-wrapper">
                            <img src="/src/assets/logoWhite (2).svg" alt="RocketReport Logo" className="hero-logo" />
                        </div>
                        <div className="loading-status">
                            <p className="loading-subtitle">{t('preparing')}</p>
                            <div className="loading-progress">
                                <div className="progress-bar"></div>
                            </div>
                        </div>

                        <div className="connector left-1"><div className="icon">{"{ }"}</div></div>
                        <div className="connector left-2"><div className="icon">x=y</div></div>
                        <div className="connector right-1"><div className="icon">📄</div></div>
                        <div className="connector right-2"><div className="icon">JS</div></div>
                    </div>
                </div>
            </section>

            {/* Features Section - 4 Cards */}
            <section className="why-choose-section">
                <h2 className="section-title">{t('why_choose')}</h2>

                <div className="feature-cards-grid four-col">
                    {/* API Source */}
                    <div className="small-feature-card">
                        <div className="card-icon api-icon">📡</div>
                        <h3>{t('feat1_title')}</h3>
                        <p>{t('feat1_desc')}</p>
                    </div>

                    {/* Templates */}
                    <div className="small-feature-card">
                        <div className="card-icon template-icon">🎨</div>
                        <h3>{t('feat2_title')}</h3>
                        <p>{t('feat2_desc')}</p>
                    </div>

                    {/* Code Processor */}
                    <div className="small-feature-card">
                        <div className="card-icon code-icon">⚙️</div>
                        <h3>{t('feat3_title')}</h3>
                        <p>{t('feat3_desc')}</p>
                    </div>

                    {/* PDF Generation */}
                    <div className="small-feature-card">
                        <div className="card-icon pdf-icon">📄</div>
                        <h3>{t('feat4_title')}</h3>
                        <p>{t('feat4_desc')}</p>
                    </div>
                </div>
            </section>

            {/* How it Works Section */}
            <section className="how-it-works-section">
                <h2 className="section-title">{t('how_title')}</h2>

                <div className="timeline-container">
                    <div className="timeline-step">
                        <div className="step-circle">1</div>
                        <h4>{t('step1_title')}</h4>
                        <p>{t('step1_desc')}</p>
                    </div>
                    <div className="timeline-connector"></div>
                    <div className="timeline-step">
                        <div className="step-circle">2</div>
                        <h4>{t('step2_title')}</h4>
                        <p>{t('step2_desc')}</p>
                    </div>
                    <div className="timeline-connector"></div>
                    <div className="timeline-step">
                        <div className="step-circle">3</div>
                        <h4>{t('step3_title')}</h4>
                        <p>{t('step3_desc')}</p>
                    </div>
                    <div className="timeline-connector"></div>
                    <div className="timeline-step">
                        <div className="step-circle">4</div>
                        <h4>{t('step4_title')}</h4>
                        <p>{t('step4_desc')}</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-content">
                    <div className="footer-logo">🚀 RocketReport</div>
                    <p className="footer-copyright">{t('footer_text')}</p>
                    <div className="footer-links">{t('footer_links')}</div>
                </div>
            </footer>
        </div>
    );
};

export default LoadingPage;
