import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { Globe, Menu, X } from 'lucide-react';
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
                    <a href="#features" className="welcome-nav-link" onClick={() => setIsMenuOpen(false)}>
                        {t('nav_features' as any)}
                    </a>
                    <a href="#process" className="welcome-nav-link" onClick={() => setIsMenuOpen(false)}>
                        {t('nav_process' as any)}
                    </a>
                    <a href="#pricing" className="welcome-nav-link" onClick={() => setIsMenuOpen(false)}>
                        {t('nav_pricing' as any)}
                    </a>
                    <a href="#about" className="welcome-nav-link" onClick={() => setIsMenuOpen(false)}>
                        {t('nav_about' as any)}
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
