import { FileText, Plug, Hammer, History } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import MainLayout from '../layouts/MainLayout';
import './Dashboard.css';

const stats = [
    { icon: Plug,     labelKey: 'API Sources',  value: '—', color: '#d2a679' },
    { icon: FileText, labelKey: 'Templates',     value: '—', color: '#7fbfaf' },
    { icon: Hammer,   labelKey: 'Builds',        value: '—', color: '#9b8ec4' },
    { icon: History,  labelKey: 'Générations',   value: '—', color: '#e07b7b' },
];

const Dashboard = () => {
    const { user } = useAuth();

    return (
        <MainLayout>
            <div className="dashboard">
                <div className="dashboard-header">
                    <h1>Bonjour, {user?.name || user?.email} 👋</h1>
                    <p className="dashboard-subtitle">Voici un aperçu de votre espace de travail.</p>
                </div>

                <div className="dashboard-stats">
                    {stats.map(({ icon: Icon, labelKey, value, color }) => (
                        <div className="stat-card" key={labelKey}>
                            <div className="stat-icon" style={{ backgroundColor: `${color}20`, color }}>
                                <Icon size={22} strokeWidth={1.8} />
                            </div>
                            <div className="stat-info">
                                <span className="stat-value">{value}</span>
                                <span className="stat-label">{labelKey}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="dashboard-placeholder">
                    <p>🚀 Commencez par créer une <strong>API Source</strong> ou un <strong>Template</strong>.</p>
                </div>
            </div>
        </MainLayout>
    );
};

export default Dashboard;
