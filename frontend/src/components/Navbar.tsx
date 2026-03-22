import { useState } from 'react';
import { Globe, Sun, Moon, Settings, User, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';
import type { Language } from '../context/LanguageContext';
import './Navbar.css';

const Navbar = () => {
    const { theme, toggleTheme } = useTheme();
    const { language, setLanguage, t } = useLanguage();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const closeMenu = () => setIsMenuOpen(false);

    const handleNavigate = (path: string) => {
        navigate(path);
        closeMenu();
    };

    return (
        <header className="navbar">
            <div className="navbar-left">
                {/* Page title injected via CSS / can be extended with context */}
            </div>

            {/* Mobile Toggle */}
            <button
                className="navbar-mobile-toggle"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
            >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div className={`navbar-controls ${isMenuOpen ? 'is-open' : ''}`}>
                {/* Language */}
                <div className="navbar-control-item language-wrapper">
                    <Globe size={16} className="control-icon" />
                    <select
                        className="language-select"
                        value={language}
                        onChange={(e) => {
                            setLanguage(e.target.value as Language);
                            closeMenu();
                        }}
                        aria-label={t('language')}
                    >
                        <option value="fr">FR</option>
                        <option value="en">EN</option>
                    </select>
                </div>

                {/* Theme toggle */}
                <button
                    className="navbar-icon-btn"
                    onClick={() => {
                        toggleTheme();
                        closeMenu();
                    }}
                    aria-label={t('theme')}
                    title={t('theme')}
                >
                    {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                </button>

                {/* Settings */}
                <button className="navbar-icon-btn" aria-label="Settings" title="Paramètres" onClick={() => handleNavigate('/settings')}>
                    <Settings size={18} />
                </button>

                {/* Profile */}
                <button className="navbar-profile-btn" aria-label="Profile" title={user?.name || user?.email || 'Profile'} onClick={() => handleNavigate('/settings')}>
                    <div className="profile-avatar">
                        <User size={16} />
                    </div>
                    <span className="profile-name">{user?.name || user?.email}</span>
                </button>
            </div>
        </header>
    );
};

export default Navbar;
