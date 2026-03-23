import { useState, useEffect } from 'react';
import { Plus, Plug, Pencil, Trash2, RefreshCw, Zap, CheckCircle, XCircle, Clock, Globe } from 'lucide-react';
import { apiSourceService } from '../services/apiSourceService';
import type { ApiSource } from '../services/apiSourceService';
import ApiSourceModal from '../components/ApiSourceModal';
import type { ApiSourcePayload } from '../services/apiSourceService';
import MainLayout from '../layouts/MainLayout';
import { useNavigate } from 'react-router-dom';
import './PlaceholderPage.css';
import './ApiSourcesPage.css';

type TestState = 'idle' | 'loading' | 'ok' | 'error';

const AUTH_LABELS: Record<string, string> = {
    none:    'Aucune auth',
    bearer:  'Bearer Token',
    api_key: 'Clé API',
    basic:   'Basic Auth',
};



const ApiSourcesPage = () => {
    const [sources, setSources]       = useState<ApiSource[]>([]);
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState('');
    const [showModal, setShowModal]   = useState(false);
    const [editing, setEditing]       = useState<ApiSource | null>(null);
    const [testStates, setTestStates] = useState<Record<number, TestState>>({});
    const [testMsgs, setTestMsgs]     = useState<Record<number, string>>({});
    const navigate = useNavigate();

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            setSources(await apiSourceService.list());
        } catch {
            setError('Impossible de charger les sources API.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleSave = async (payload: ApiSourcePayload, id?: number) => {
        if (id) {
            const updated = await apiSourceService.update(id, payload);
            setSources(s => s.map(src => src.id === id ? updated : src));
        } else {
            const created = await apiSourceService.create(payload);
            setSources(s => [created, ...s]);
        }
        setShowModal(false);
        setEditing(null);
    };

    const handleDelete = async (src: ApiSource) => {
        if (!confirm(`Supprimer "${src.name}" ?`)) return;
        try {
            await apiSourceService.delete(src.id);
            setSources(s => s.filter(x => x.id !== src.id));
        } catch {
            alert('Erreur lors de la suppression.');
        }
    };

    const handleTest = async (src: ApiSource) => {
        setTestStates(s => ({ ...s, [src.id]: 'loading' }));
        setTestMsgs(m => ({ ...m, [src.id]: '' }));
        try {
            const result = await apiSourceService.test(src.id);
            setTestStates(s => ({ ...s, [src.id]: result.success ? 'ok' : 'error' }));
            setTestMsgs(m => ({
                ...m,
                [src.id]: result.success
                    ? `HTTP ${result.status_code} — ${result.message}`
                    : result.error || 'Échec de la connexion',
            }));
        } catch {
            setTestStates(s => ({ ...s, [src.id]: 'error' }));
            setTestMsgs(m => ({ ...m, [src.id]: 'Erreur réseau ou serveur' }));
        }
    };

    const openNew  = () => { setEditing(null); setShowModal(true); };
    const openEdit = (s: ApiSource) => { setEditing(s); setShowModal(true); };

    return (
        <MainLayout>
            <div className="page-container">
                <div className="page-header">
                    <div>
                        <div className="page-title">
                            <Plug size={22} strokeWidth={1.8} />
                            <h1>API Sources</h1>
                        </div>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                            Connecteurs vers vos APIs externes
                        </p>
                    </div>
                    <div className="page-header-actions">
                        <button className="btn-icon" onClick={load} title="Rafraîchir">
                            <RefreshCw size={16} />
                        </button>
                        <button className="btn-primary-action" onClick={openNew}>
                            <Plus size={16} /> Nouvelle source
                        </button>
                    </div>
                </div>

                {error && <div className="page-error">{error}</div>}

                {loading ? (
                    <div className="api-grid">
                        {[1, 2, 3].map(i => <div key={i} className="skeleton-card" />)}
                    </div>
                ) : sources.length === 0 ? (
                    <div className="page-empty">
                        <Plug size={48} strokeWidth={1} className="empty-icon" />
                        <h3>Aucune source API</h3>
                        <p>Connectez votre première API REST pour alimenter vos rapports en données.</p>
                        <button className="btn-primary-action" onClick={openNew}>
                            <Plus size={16} /> Ajouter une source
                        </button>
                    </div>
                ) : (
                    <div className="api-grid">
                        {sources.map(src => {
                            const ts = testStates[src.id] ?? 'idle';
                            return (
                                <div key={src.id} className="api-card">
                                    <div className="api-card-header">
                                        <div className="api-card-icon" onClick={() => navigate(`/api-sources/${src.id}/endpoints`)} style={{ cursor: 'pointer' }}>
                                            <Plug size={16} />
                                        </div>
                                        <div className="api-card-meta" onClick={() => navigate(`/api-sources/${src.id}/endpoints`)} style={{ cursor: 'pointer' }}>
                                            <span className="api-card-name">{src.name}</span>
                                            <span className={`api-status-pill api-status-${src.status}`}>{src.status}</span>
                                        </div>
                                        <div className="api-card-actions">
                                            <button className="tpl-action-btn" onClick={() => navigate(`/api-sources/${src.id}/endpoints`)} title="Gérer les Endpoints">
                                                <Globe size={13} />
                                            </button>
                                            <button className="tpl-action-btn" onClick={() => openEdit(src)} title="Modifier">
                                                <Pencil size={13} />
                                            </button>
                                            <button className="tpl-action-btn tpl-action-btn--danger" onClick={() => handleDelete(src)} title="Supprimer">
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="api-card-body" onClick={() => navigate(`/api-sources/${src.id}/endpoints`)} style={{ cursor: 'pointer' }}>
                                        <p className="api-url">{src.url_base}</p>
                                        {src.description && <p className="api-desc">{src.description}</p>}
                                        <span className="api-auth-badge">{AUTH_LABELS[src.auth_type] ?? src.auth_type}</span>
                                    </div>

                                    {/* Test connexion */}
                                    <div className="api-card-footer">
                                        <button
                                            className={`api-test-btn api-test-${ts}`}
                                            onClick={() => handleTest(src)}
                                            disabled={ts === 'loading'}>
                                            {ts === 'loading' && <><span className="mini-spinner" /> Test en cours…</>}
                                            {ts === 'idle'    && <><Zap size={13} /> Tester la connexion</>}
                                            {ts === 'ok'      && <><CheckCircle size={13} /> Connexion OK</>}
                                            {ts === 'error'   && <><XCircle size={13} /> Connexion échouée</>}
                                        </button>
                                        {testMsgs[src.id] && (
                                            <span className={`test-msg test-msg-${ts}`}>{testMsgs[src.id]}</span>
                                        )}
                                    </div>

                                    <div className="api-card-date">
                                        <Clock size={11} />
                                        {new Date(src.created_at).toLocaleDateString('fr-FR')}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {showModal && (
                <ApiSourceModal
                    editing={editing}
                    onSave={handleSave}
                    onClose={() => { setShowModal(false); setEditing(null); }}
                />
            )}
        </MainLayout>
    );
};

export default ApiSourcesPage;
