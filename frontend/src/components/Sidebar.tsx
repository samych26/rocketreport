import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    FileText,
    Plug,
    Hammer,
    History,
} from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import './Sidebar.css';

const navItems = [
    { path: '/dashboard',    icon: LayoutDashboard, labelKey: 'nav_dashboard' },
    { path: '/templates',    icon: FileText,         labelKey: 'nav_templates' },
    { path: '/api-sources',  icon: Plug,             labelKey: 'nav_api_sources' },
    { path: '/build',        icon: Hammer,           labelKey: 'nav_build' },
    { path: '/generations',  icon: History,          labelKey: 'nav_generations' },
];

const Sidebar = () => {
    const { t } = useLanguage();
    const location = useLocation();

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <span className="sidebar-logo-icon">🚀</span>
                <span className="sidebar-logo-text">RocketReport</span>
            </div>

            <nav className="sidebar-nav">
                {navItems.map(({ path, icon: Icon, labelKey }) => (
                    <NavLink
                        key={path}
                        to={path}
                        className={`sidebar-item ${location.pathname === path ? 'active' : ''}`}
                    >
                        <Icon size={20} strokeWidth={1.8} />
                        <span>{t(labelKey as any)}</span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;
