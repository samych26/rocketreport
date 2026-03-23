import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { Globe, Menu, X } from 'lucide-react';
import type { Language } from '../context/LanguageContext';
import './WelcomeNavbar.css';

const WelcomeNavbar = () => {
    const { language, setLanguage, t } = useLanguage();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleLanguage = () => {
        setLanguage(language === 'fr' ? 'en' : 'fr');
    };

    return (
        <nav className={`welcome-navbar ${isScrolled || location.pathname !== '/welcome' ? 'is-scrolled' : ''}`}>
            <div className="welcome-nav-container">
                <Link to="/welcome" className="welcome-nav-logo">
                    <span className="logo-icon">🚀</span>
                    <span className="logo-text">RocketReport</span>
                </Link>

                <div className={`welcome-nav-links ${isMenuOpen ? 'is-open' : ''}`}>
                    <Link to="/mcp-docs" className="welcome-nav-link" onClick={() => setIsMenuOpen(false)}>
                        {t('nav_mcp')}
                    </Link>
                    <a href="https://www.npmjs.com/package/rocketreport-mcp-server" target="_blank" rel="noopener noreferrer" className="welcome-nav-link">
                        {t('nav_npm')}
                    </a>
                    <a href="https://github.com/votre-repo/rocketreport" target="_blank" rel="noopener noreferrer" className="welcome-nav-link">
                        {t('nav_docs')}
                    </a>
                    
                    <div className="welcome-nav-divider" />
                    
                    <button className="welcome-lang-btn" onClick={toggleLanguage}>
                        <Globe size={16} />
                        <span>{language.toUpperCase()}</span>
                    </button>
                    
                    <Link to="/login" className="welcome-nav-btn-outline" onClick={() => setIsMenuOpen(false)}>
                        {t('login_submit')}
                    </Link>
                    <Link to="/register" className="welcome-nav-btn-primary" onClick={() => setIsMenuOpen(false)}>
                        {t('get_started')}
                    </Link>
                </div>

                <button className="welcome-nav-mobile-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <X /> : <Menu />}
                </button>
            </div>
        </nav>
    );
};

export default WelcomeNavbar;
