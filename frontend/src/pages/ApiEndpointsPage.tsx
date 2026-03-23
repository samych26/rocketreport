import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Plus, Trash2, ArrowLeft, 
    ChevronRight, AlertCircle, Loader2, Pencil, RefreshCw, FileText
} from 'lucide-react';
import { apiSourceService } from '../services/apiSourceService';
import type { ApiSource, ApiEndpoint, ApiEndpointPayload } from '../services/apiSourceService';
import MainLayout from '../layouts/MainLayout';
import ApiEndpointModal from '../components/ApiEndpointModal';
import './ApiEndpointsPage.css';

const ApiEndpointsPage = () => {
    const { sourceId } = useParams<{ sourceId: string }>();
    const navigate = useNavigate();
    const id = Number(sourceId);

    const [source, setSource] = useState<ApiSource | null>(null);
    const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<ApiEndpoint | null>(null);

    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            const [src, eps] = await Promise.all([
                apiSourceService.get(id),
                apiSourceService.listEndpoints(id)
            ]);
            setSource(src);
            setEndpoints(eps);
        } catch (err) {
            setError('Impossible de charger les documents de la source API.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) loadData();
    }, [id]);

    const handleSave = async (payload: ApiEndpointPayload, epId?: number) => {
        try {
            if (epId) {
                await apiSourceService.updateEndpoint(id, epId, payload);
            } else {
                await apiSourceService.createEndpoint(id, payload);
            }
            setShowModal(false);
            setEditing(null);
            loadData();
        } catch (err) {
            alert('Erreur lors de la sauvegarde du document');
        }
    };

    const handleDelete = async (epId: number) => {
        if (!confirm('Supprimer ce document ?')) return;
        try {
            await apiSourceService.deleteEndpoint(id, epId);
            loadData();
        } catch (err) {
            alert('Erreur lors de la suppression');
        }
    };

    const openNew  = () => { setEditing(null); setShowModal(true); };
    const openEdit = (ep: ApiEndpoint) => { setEditing(ep); setShowModal(true); };

    if (loading && !source) {
        return (
            <MainLayout>
                <div className="loading-container">
                    <Loader2 className="spin" size={32} />
                    <p>Chargement des documents...</p>
                </div>
            </MainLayout>
        );
    }

    if (error) {
        return (
            <MainLayout>
                <div className="error-container">
                    <AlertCircle size={48} />
                    <h2>Erreur</h2>
                    <p>{error}</p>
                    <button className="btn-secondary" onClick={() => navigate('/api-sources')}>
                        <ArrowLeft size={16} /> Retour aux sources
                    </button>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="page-container">
                <div className="page-header">
                    <div className="header-left">
                        <button className="btn-back" onClick={() => navigate('/api-sources')} title="Retour aux sources">
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <div className="page-breadcrumb">
                                <span onClick={() => navigate('/api-sources')} style={{ cursor: 'pointer' }}>API Sources</span>
                                <ChevronRight size={14} />
                                <span className="current">{source?.name}</span>
                            </div>
                            <div className="page-title">
                                <FileText size={22} strokeWidth={1.8} />
                                <h1>Documents configurés</h1>
                            </div>
                        </div>
                    </div>
                    <div className="page-header-actions">
                        <button className="btn-icon" onClick={loadData} title="Rafraîchir">
                            <RefreshCw size={16} />
                        </button>
                        <button className="btn-primary-action" onClick={openNew}>
                            <Plus size={16} /> Nouveau Document
                        </button>
                    </div>
                </div>

                {endpoints.length === 0 && !loading ? (
                    <div className="page-empty">
                        <FileText size={48} strokeWidth={1} className="empty-icon" />
                        <h3>Aucun document</h3>
                        <p>Configurez des documents pour extraire des données depuis cette source API.</p>
                        <button className="btn-primary-action" onClick={openNew}>
                            <Plus size={16} /> Ajouter un document
                        </button>
                    </div>
                ) : (
                    <div className="api-grid">
                        {endpoints.map(ep => (
                            <div key={ep.id} className="api-card">
                                <div className="api-card-header">
                                    <div className="api-card-icon">
                                        <FileText size={16} />
                                    </div>
                                    <div className="api-card-meta">
                                        <span className="api-card-name">{ep.name}</span>
                                        <span className={`method-badge method-${ep.method.toLowerCase()}`}>{ep.method}</span>
                                    </div>
                                    <div className="api-card-actions">
                                        <button className="tpl-action-btn" onClick={() => openEdit(ep)} title="Modifier">
                                            <Pencil size={13} />
                                        </button>
                                        <button className="tpl-action-btn tpl-action-btn--danger" onClick={() => handleDelete(ep.id)} title="Supprimer">
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </div>

                                <div className="api-card-body" onClick={() => openEdit(ep)} style={{ cursor: 'pointer' }}>
                                    <p className="api-url" style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{ep.path}</p>
                                    {ep.description && <p className="api-desc">{ep.description}</p>}
                                    
                                    <div className="variable-tags" style={{ marginTop: '0.75rem' }}>
                                        {(ep.variables || []).map(v => (
                                            <span key={v} className="variable-tag">{v}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showModal && (
                <ApiEndpointModal
                    sourceId={id}
                    editing={editing}
                    onSave={handleSave}
                    onClose={() => { setShowModal(false); setEditing(null); }}
                />
            )}
        </MainLayout>
    );
};

export default ApiEndpointsPage;
