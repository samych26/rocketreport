import { History } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import './PlaceholderPage.css';

const GenerationsPage = () => (
    <MainLayout>
        <div className="page-container">
            <div className="page-header">
                <div className="page-title">
                    <History size={24} strokeWidth={1.8} />
                    <h1>Générations</h1>
                </div>
            </div>
            <div className="page-empty">
                <History size={48} strokeWidth={1} className="empty-icon" />
                <h3>Aucune génération pour l'instant</h3>
                <p>L'historique de vos générations de documents PDF apparaîtra ici.</p>
            </div>
        </div>
    </MainLayout>
);

export default GenerationsPage;
