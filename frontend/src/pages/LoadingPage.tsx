import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import WelcomeNavbar from '../components/WelcomeNavbar';
import './LoadingPage.css';

/* Utility: add "in-view" class when element enters viewport */
function useInView(selector: string) {
    useEffect(() => {
        const els = document.querySelectorAll(selector);
        const obs = new IntersectionObserver(
            entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in-view'); obs.unobserve(e.target); } }),
            { threshold: 0.12 }
        );
        els.forEach(el => obs.observe(el));
        return () => obs.disconnect();
    }, [selector]);
}

const FEATURES = [
    { icon: '📡', key: 'feat1' },
    { icon: '🎨', key: 'feat2' },
    { icon: '⚙️', key: 'feat3' },
    { icon: '📄', key: 'feat4' },
];

const LoadingPage = () => {
    const { t } = useLanguage();
    useInView('.reveal');

    return (
        <div className="welcome-page">
            <WelcomeNavbar />

            {/* ── HERO ── */}
            <section className="welcome-hero">
                <div className="welcome-hero-overlay" />
                <div className="welcome-noise" />

                <div className="welcome-hero-content">
                    <div className="welcome-badge">🚀 {t('tagline')}</div>
                    <h1 className="welcome-hero-title">{t('hero_title')}</h1>
                    <p className="welcome-hero-subtitle">{t('hero_subtitle')}</p>
                    <div className="welcome-hero-actions">
                        <Link to="/register" className="welcome-btn-primary">{t('get_started')} →</Link>
                        <Link to="/mcp-docs" className="welcome-btn-outline">{t('request_demo')} →</Link>
                    </div>
                </div>

                <div className="welcome-scroll-hint">
                    <div className="welcome-scroll-arrow" />
                </div>
            </section>

            {/* ── FEATURES ── */}
            <section id="features" className="welcome-features">
                <div className="welcome-section-inner">
                    <p className="welcome-section-label reveal">{t('why_choose')}</p>
                    <h2 className="welcome-section-title reveal">{t('hero_title')}</h2>

                    <div className="welcome-cards-grid">
                        {FEATURES.map(({ icon, key }, i) => (
                            <div key={key} className="welcome-card reveal" style={{ '--delay': `${i * 0.1}s` } as React.CSSProperties}>
                                <div className="welcome-card-icon">{icon}</div>
                                <h3>{t(`${key}_title` as any)}</h3>
                                <p>{t(`${key}_desc` as any)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section id="process" className="welcome-steps">
                <div className="welcome-section-inner">
                    <p className="welcome-section-label reveal">{t('how_title')}</p>
                    <h2 className="welcome-section-title reveal">{t('how_title')}</h2>

                    <div className="welcome-steps-grid">
                        {(['1','2','3','4'] as const).map((n, i) => (
                            <div key={n} className="welcome-step reveal" style={{ '--delay': `${i * 0.12}s` } as React.CSSProperties}>
                                <span className="welcome-step-num">0{n}</span>
                                <h4>{t(`step${n}_title` as any)}</h4>
                                <p>{t(`step${n}_desc` as any)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer id="about" className="welcome-footer">
                <span>🚀 RocketReport</span>
                <p>{t('footer_text')}</p>
                <span>{t('footer_links')}</span>
            </footer>

        </div>
    );
};

export default LoadingPage;

