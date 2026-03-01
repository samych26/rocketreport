import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../hooks/useLanguage';
import type { Language } from '../context/LanguageContext';
import './Navbar.css';

const Navbar = () => {
    const { theme, toggleTheme } = useTheme();
    const { language, setLanguage, t } = useLanguage();

    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <span className="logo-icon">🚀</span>
                <span className="logo-text">RocketReport</span>
            </div>

            <div className="navbar-controls">
                <select
                    className="language-select"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as Language)}
                    aria-label={t('language')}
                >
                    <option value="fr">FR</option>
                    <option value="en">EN</option>
                </select>

                <button
                    className="theme-toggle"
                    onClick={toggleTheme}
                    aria-label={t('theme')}
                >
                    {theme === 'light' ? '🌙' : '☀️'}
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
