import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    X, Save, Plus, Trash2, Globe, ArrowLeft, 
    ChevronRight, AlertCircle, Loader2, Pencil
} from 'lucide-react';
import { apiSourceService } from '../services/apiSourceService';
import type { ApiSource, ApiEndpoint, ApiEndpointPayload } from '../services/apiSourceService';
import MainLayout from '../layouts/MainLayout';
import './ApiEndpointsPage.css';

const ApiEndpointsPage = () => {
    const { sourceId } = useParams<{ sourceId: string }>();
    const navigate = useNavigate();
    const id = Number(sourceId);

    const [source, setSource] = useState<ApiSource | null>(null);
    const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [editing, setEditing] = useState<Partial<ApiEndpoint> | null>(null);
    const [saving, setSaving] = useState(false);

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
            setError('Impossible de charger les données de la source API.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) loadData();
    }, [id]);

    const handleSave = async () => {
        if (!editing?.name || !editing?.path) return;
        setSaving(true);
        try {
            const payload: ApiEndpointPayload = {
                name: editing.name,
                path: editing.path,
                method: editing.method || 'GET',
                variables: editing.variables || [],
                description: editing.description,
            };

            if (editing.id) {
                await apiSourceService.updateEndpoint(id, editing.id, payload);
            } else {
                await apiSourceService.createEndpoint(id, payload);
            }
            setEditing(null);
            loadData();
        } catch (err) {
            alert('Erreur lors de la sauvegarde de l\'endpoint');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (epId: number) => {
        if (!confirm('Supprimer cet endpoint ?')) return;
        try {
            await apiSourceService.deleteEndpoint(id, epId);
            loadData();
        } catch (err) {
            alert('Erreur lors de la suppression');
        }
    };

    const toggleVariable = (v: string) => {
        const current = editing?.variables || [];
        const next = current.includes(v) 
            ? current.filter(x => x !== v)
            : [...current, v];
        setEditing({ ...editing, variables: next });
    };

    if (loading && !source) {
        return (
            <MainLayout>
                <div className="loading-container">
                    <Loader2 className="spin" size={32} />
                    <p>Chargement de la source API...</p>
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
                        <button className="btn-back" onClick={() => navigate('/api-sources')}>
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <div className="page-breadcrumb">
                                <span>API Sources</span>
                                <ChevronRight size={14} />
                                <span className="current">{source?.name}</span>
                            </div>
                            <h1 className="page-title-main">Gestion des Endpoints</h1>
                        </div>
                    </div>
                    <button className="btn-primary-action" onClick={() => setEditing({ method: 'GET', variables: [] })}>
                        <Plus size={16} /> Nouvel Endpoint
                    </button>
                </div>

                <div className="endpoints-layout">
                    {/* Endpoints List */}
                    <div className="endpoints-list-panel">
                        <div className="panel-header">
                            <h3>{endpoints.length} Endpoint{endpoints.length > 1 ? 's' : ''} configuré{endpoints.length > 1 ? 's' : ''}</h3>
                        </div>
                        
                        {endpoints.length === 0 ? (
                            <div className="endpoints-empty">
                                <Globe size={48} strokeWidth={1} />
                                <p>Aucun endpoint pour cette source.</p>
                                <button className="btn-secondary btn-sm" onClick={() => setEditing({ method: 'GET', variables: [] })}>
                                    Créer le premier endpoint
                                </button>
                            </div>
                        ) : (
                            <div className="endpoints-grid">
                                {endpoints.map(ep => (
                                    <div 
                                        key={ep.id} 
                                        className={`endpoint-card ${editing?.id === ep.id ? 'active' : ''}`}
                                        onClick={() => setEditing(ep)}
                                    >
                                        <div className="ep-card-main">
                                            <span className={`method-badge method-${ep.method.toLowerCase()}`}>{ep.method}</span>
                                            <span className="ep-path">{ep.path}</span>
                                        </div>
                                        <div className="ep-card-footer">
                                            <span className="ep-name">{ep.name}</span>
                                            <div className="ep-actions">
                                                <button className="btn-icon-sm" onClick={(e) => { e.stopPropagation(); setEditing(ep); }}>
                                                    <Pencil size={12} />
                                                </button>
                                                <button className="btn-icon-sm btn-icon-sm--danger" onClick={(e) => { e.stopPropagation(); handleDelete(ep.id); }}>
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Editor Panel */}
                    <div className="endpoints-editor-panel">
                        {editing ? (
                            <div className="editor-card">
                                <div className="editor-header">
                                    <h3>{editing.id ? 'Modifier l\'endpoint' : 'Ajouter un endpoint'}</h3>
                                    <button className="btn-close" onClick={() => setEditing(null)}><X size={18} /></button>
                                </div>
                                
                                <div className="editor-form">
                                    <div className="form-field">
                                        <label>Nom de l'action</label>
                                        <input 
                                            type="text" 
                                            value={editing.name || ''} 
                                            onChange={e => setEditing({...editing, name: e.target.value})} 
                                            placeholder="Ex: Liste des ventes"
                                        />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-field" style={{ flex: '0 0 100px' }}>
                                            <label>Méthode</label>
                                            <select 
                                                value={editing.method || 'GET'} 
                                                onChange={e => setEditing({...editing, method: e.target.value})}
                                            >
                                                {['GET','POST','PUT','PATCH','DELETE'].map(m => <option key={m} value={m}>{m}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-field" style={{ flex: 1 }}>
                                            <label>Chemin (Path)</label>
                                            <input 
                                                type="text" 
                                                value={editing.path || ''} 
                                                onChange={e => setEditing({...editing, path: e.target.value})} 
                                                placeholder="/api/v1/orders"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-field">
                                        <label>Variables à extraire</label>
                                        <div className="variable-input-container">
                                            <div className="variable-tags">
                                                {(editing.variables || []).map(v => (
                                                    <span key={v} className="variable-tag">
                                                        {v} <X size={10} onClick={() => toggleVariable(v)} />
                                                    </span>
                                                ))}
                                            </div>
                                            <input 
                                                type="text" 
                                                placeholder="Ajouter une clé (ex: status) + Entrée"
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') {
                                                        const val = (e.target as HTMLInputElement).value.trim();
                                                        if (val) {
                                                            toggleVariable(val);
                                                            (e.target as HTMLInputElement).value = '';
                                                        }
                                                        e.preventDefault();
                                                    }
                                                }}
                                            />
                                        </div>
                                        <p className="field-hint">Filtrage des données reçues pour n'exposer que ces propriétés.</p>
                                    </div>

                                    <div className="form-field">
                                        <label>Description (optionnel)</label>
                                        <textarea 
                                            value={editing.description || ''} 
                                            onChange={e => setEditing({...editing, description: e.target.value})}
                                            rows={3}
                                            placeholder="À quoi sert cet endpoint ?"
                                        />
                                    </div>

                                    <div className="editor-footer">
                                        <button className="btn-secondary" onClick={() => setEditing(null)}>Annuler</button>
                                        <button className="btn-primary" onClick={handleSave} disabled={saving || !editing.name || !editing.path}>
                                            <Save size={16} /> {saving ? 'Enregistrement…' : 'Enregistrer l\'endpoint'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="editor-empty-state">
                                <div className="placeholder-icon">
                                    <Globe size={48} strokeWidth={1} />
                                </div>
                                <h3>Configuration d'Endpoint</h3>
                                <p>Sélectionnez un endpoint à modifier ou cliquez sur le bouton "Nouvel Endpoint" pour en créer un.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default ApiEndpointsPage;
