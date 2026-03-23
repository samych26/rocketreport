import React, { useState } from 'react';
import { X, Save, Zap, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { apiSourceService } from '../services/apiSourceService';
import type { ApiEndpoint, ApiEndpointPayload } from '../services/apiSourceService';
import './ApiSourceModal.css'; // On réutilise la base CSS des modales

interface ApiEndpointModalProps {
    sourceId: number;
    editing: Partial<ApiEndpoint> | null;
    onSave: (payload: ApiEndpointPayload, id?: number) => Promise<void>;
    onClose: () => void;
}

const ApiEndpointModal = ({ sourceId, editing, onSave, onClose }: ApiEndpointModalProps) => {
    const [name, setName] = useState(editing?.name || '');
    const [path, setPath] = useState(editing?.path || '');
    const [method, setMethod] = useState(editing?.method || 'GET');
    const [variables, setVariables] = useState<string[]>(editing?.variables || []);
    const [description, setDescription] = useState(editing?.description || '');
    
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; data?: any; error?: string } | null>(null);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await onSave({ name, path, method, variables, description }, editing?.id);
        } finally {
            setSaving(false);
        }
    };

    const handleTest = async () => {
        if (!editing?.id) return;
        setTesting(true);
        setTestResult(null);
        try {
            const res = await apiSourceService.testEndpoint(sourceId, editing.id);
            setTestResult(res);
        } catch (err) {
            setTestResult({ success: false, error: 'Erreur réseau ou serveur' });
        } finally {
            setTesting(false);
        }
    };

    const toggleVariable = (v: string) => {
        setVariables(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container" style={{ maxWidth: '600px' }}>
                <div className="modal-header">
                    <div className="modal-title-wrapper">
                        <div className="modal-icon">
                            <Zap size={20} />
                        </div>
                        <h2>{editing?.id ? 'Modifier le document' : 'Nouveau document'}</h2>
                    </div>
                    <button className="modal-close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSave}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label>Nom du document</label>
                            <input 
                                type="text" 
                                value={name} 
                                onChange={e => setName(e.target.value)} 
                                placeholder="Ex: Liste des factures"
                                required
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label>Méthode</label>
                                <select value={method} onChange={e => setMethod(e.target.value)}>
                                    {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Chemin (Path)</label>
                                <input 
                                    type="text" 
                                    value={path} 
                                    onChange={e => setPath(e.target.value)} 
                                    placeholder="/api/v1/resource"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Variables à extraire</label>
                            <div className="variable-input-container">
                                <div className="variable-tags">
                                    {variables.map(v => (
                                        <span key={v} className="variable-tag">
                                            {v} <X size={10} onClick={() => toggleVariable(v)} style={{ cursor: 'pointer' }} />
                                        </span>
                                    ))}
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Ajouter une clé + Entrée"
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
                        </div>

                        <div className="form-group">
                            <label>Description (optionnel)</label>
                            <textarea 
                                value={description} 
                                onChange={e => setDescription(e.target.value)}
                                rows={2}
                            />
                        </div>

                        {editing?.id && (
                            <div className="test-section" style={{ marginTop: '1rem' }}>
                                <button 
                                    type="button" 
                                    className={`btn-test ${testing ? 'loading' : ''}`}
                                    onClick={handleTest}
                                    disabled={testing}
                                    style={{ width: '100%', justifyContent: 'center', marginBottom: '1rem' }}
                                >
                                    {testing ? <Loader2 size={16} className="spin" /> : <Zap size={16} />}
                                    Tester la récupération des données
                                </button>

                                {testResult && (
                                    <div className={`test-result-box ${testResult.success ? 'success' : 'error'}`} style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                        <div className="test-result-header">
                                            {testResult.success ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                            {testResult.success ? 'Récupération réussie' : 'Échec du test'}
                                        </div>
                                        {testResult.success ? (
                                            <pre className="test-result-data">{JSON.stringify(testResult.data, null, 2)}</pre>
                                        ) : (
                                            <p className="test-result-error">{testResult.error}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Annuler
                        </button>
                        <button type="submit" className="btn-primary" disabled={saving || !name || !path}>
                            <Save size={18} />
                            {saving ? 'Enregistrement...' : 'Enregistrer le document'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ApiEndpointModal;
