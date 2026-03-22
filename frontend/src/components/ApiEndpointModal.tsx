import { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Globe } from 'lucide-react';
import { apiSourceService } from '../services/apiSourceService';
import type { ApiEndpoint, ApiEndpointPayload } from '../services/apiSourceService';

interface ApiEndpointModalProps {
    sourceId: number;
    sourceName: string;
    onClose: () => void;
}

const ApiEndpointModal = ({ sourceId, sourceName, onClose }: ApiEndpointModalProps) => {
    const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<Partial<ApiEndpoint> | null>(null);
    const [saving, setSaving] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const data = await apiSourceService.listEndpoints(sourceId);
            setEndpoints(data);
        } catch (err) {
            console.error('Failed to load endpoints', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [sourceId]);

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
                await apiSourceService.updateEndpoint(sourceId, editing.id, payload);
            } else {
                await apiSourceService.createEndpoint(sourceId, payload);
            }
            setEditing(null);
            load();
        } catch (err) {
            alert('Erreur lors de la sauvegarde de l\'endpoint');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Supprimer cet endpoint ?')) return;
        try {
            await apiSourceService.deleteEndpoint(sourceId, id);
            load();
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

    return (
        <div className="modal-overlay">
            <div className="modal-content modal-content--large">
                <div className="modal-header">
                    <div className="modal-title">
                        <Globe size={18} />
                        <h2>Endpoints pour "{sourceName}"</h2>
                    </div>
                    <button className="modal-close" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="modal-body">
                    <div className="endpoint-manager">
                        {/* List */}
                        <div className="endpoint-list-section">
                            <div className="section-header">
                                <h3>Endpoints existants</h3>
                                <button className="btn-primary-action btn-sm" onClick={() => setEditing({ method: 'GET', variables: [] })}>
                                    <Plus size={14} /> Ajouter
                                </button>
                            </div>

                            {loading ? (
                                <div className="loading-state">Chargement…</div>
                            ) : endpoints.length === 0 ? (
                                <div className="empty-state">Aucun endpoint défini.</div>
                            ) : (
                                <div className="endpoint-grid">
                                    {endpoints.map(ep => (
                                        <div key={ep.id} className={`endpoint-item ${editing?.id === ep.id ? 'active' : ''}`} onClick={() => setEditing(ep)}>
                                            <div className="endpoint-item-main">
                                                <span className={`method-badge method-${ep.method.toLowerCase()}`}>{ep.method}</span>
                                                <span className="endpoint-path">{ep.path}</span>
                                            </div>
                                            <div className="endpoint-item-name">{ep.name}</div>
                                            <button className="endpoint-delete-btn" onClick={(e) => { e.stopPropagation(); handleDelete(ep.id); }}>
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Form */}
                        <div className="endpoint-form-section">
                            {editing ? (
                                <div className="endpoint-form">
                                    <h3>{editing.id ? 'Modifier' : 'Nouveau'} Endpoint</h3>
                                    
                                    <div className="form-field">
                                        <label>Nom de l'action *</label>
                                        <input 
                                            type="text" 
                                            value={editing.name || ''} 
                                            onChange={e => setEditing({...editing, name: e.target.value})} 
                                            placeholder="Ex: Liste des utilisateurs"
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
                                            <label>Chemin (Path) *</label>
                                            <input 
                                                type="text" 
                                                value={editing.path || ''} 
                                                onChange={e => setEditing({...editing, path: e.target.value})} 
                                                placeholder="/users"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-field">
                                        <label>Variables à extraire (optionnel)</label>
                                        <div className="variable-inputs">
                                            <div className="variable-tags">
                                                {(editing.variables || []).map(v => (
                                                    <span key={v} className="variable-tag">
                                                        {v} <X size={10} onClick={() => toggleVariable(v)} />
                                                    </span>
                                                ))}
                                            </div>
                                            <input 
                                                type="text" 
                                                placeholder="Ajouter une variable (entrée pour valider)"
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
                                            <p className="field-hint">Spécifiez les clés JSON que vous voulez exposer (ex: id, name, email)</p>
                                        </div>
                                    </div>

                                    <div className="form-field">
                                        <label>Description</label>
                                        <textarea 
                                            value={editing.description || ''} 
                                            onChange={e => setEditing({...editing, description: e.target.value})}
                                            rows={2}
                                        />
                                    </div>

                                    <div className="form-actions">
                                        <button className="btn-secondary" onClick={() => setEditing(null)}>Annuler</button>
                                        <button className="btn-primary" onClick={handleSave} disabled={saving || !editing.name || !editing.path}>
                                            <Save size={16} /> {saving ? 'Enregistrement…' : 'Enregistrer'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="form-placeholder">
                                    <Globe size={40} strokeWidth={1} />
                                    <p>Sélectionnez un endpoint pour le modifier ou créez-en un nouveau.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApiEndpointModal;
