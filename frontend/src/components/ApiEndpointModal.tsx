import React, { useState } from 'react';
import { X, Save, Zap, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { apiSourceService } from '../services/apiSourceService';
import type { ApiEndpoint, ApiEndpointPayload } from '../services/apiSourceService';
import './ApiSourceModal.css';

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
    const [testResult, setTestResult] = useState<{ 
        success: boolean; 
        data?: any; 
        error?: string;
        missing_variables?: string[];
    } | null>(null);

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
            <div className="modal-panel api-modal-panel">
                <div className="modal-header">
                    <div className="modal-title">
                        <Zap size={20} />
                        <h2>{editing?.id ? 'Modifier le document' : 'Nouveau document'}</h2>
                    </div>
                    <button className="modal-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                    <div className="modal-body">
                        <div className="form-field">
                            <label>Nom du document</label>
                            <input 
                                type="text" 
                                value={name} 
                                onChange={e => setName(e.target.value)} 
                                placeholder="Ex: Liste des factures"
                                required
                            />
                        </div>

                        <div className="modal-row">
                            <div className="form-field form-field--sm">
                                <label>Méthode</label>
                                <select value={method} onChange={e => setMethod(e.target.value)}>
                                    {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-field">
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

                        <div className="form-field">
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
                            <span className="field-hint">Si vide, toutes les données seront récupérées.</span>
                        </div>

                        <div className="form-field">
                            <label>Description (optionnel)</label>
                            <textarea 
                                className="template-editor"
                                style={{ minHeight: '80px' }}
                                value={description} 
                                onChange={e => setDescription(e.target.value)}
                                rows={2}
                            />
                        </div>

                        {editing?.id && (
                            <div className="test-section" style={{ marginTop: '0.5rem' }}>
                                <button 
                                    type="button" 
                                    className={`btn-test ${testing ? 'loading' : ''}`}
                                    onClick={handleTest}
                                    disabled={testing}
                                    style={{ width: '100%', justifyContent: 'center', marginBottom: '1rem', padding: '0.6rem' }}
                                >
                                    {testing ? <Loader2 size={16} className="spin" /> : <Zap size={16} />}
                                    Tester la récupération des données
                                </button>

                                {testResult && (
                                    <div className={`test-result-box ${testResult.success ? 'success' : 'error'}`} style={{ maxHeight: '250px', overflowY: 'auto' }}>
                                        <div className="test-result-header">
                                            {testResult.success ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                            {testResult.success ? 'Récupération réussie' : 'Échec du test'}
                                        </div>
                                        
                                        {testResult.missing_variables && testResult.missing_variables.length > 0 && (
                                            <div className="modal-error" style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <AlertCircle size={14} />
                                                <span>Variables manquantes : {testResult.missing_variables.join(', ')}</span>
                                            </div>
                                        )}

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

                    <div className="modal-footer" style={{ padding: '1.25rem 1.5rem' }}>
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            Annuler
                        </button>
                        <button type="submit" className="btn-save" disabled={saving || !name || !path}>
                            <Save size={18} />
                            {saving ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ApiEndpointModal;
