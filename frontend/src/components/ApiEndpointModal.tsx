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

    const modalStyle = {
        background: 'var(--bg-primary, #ffffff)',
        border: '1px solid var(--border-color, #e2e8f0)',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        width: '100%',
        maxWidth: '600px',
        display: 'flex',
        flexDirection: 'column' as const,
        overflow: 'hidden'
    };

    const inputStyle = {
        padding: '0.65rem 0.85rem',
        borderRadius: '8px',
        border: '1px solid var(--border-color, #cbd5e1)',
        background: 'var(--bg-secondary, #f8fafc)',
        color: 'var(--text-primary, #1e293b)',
        fontSize: '0.9rem',
        outline: 'none',
        width: '100%'
    };

    return (
        <div className="modal-overlay">
            <div style={modalStyle}>
                <div className="modal-header">
                    <div className="modal-title">
                        <Zap size={20} />
                        <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                            {editing?.id ? 'Modifier le document' : 'Nouveau document'}
                        </h2>
                    </div>
                    <button className="modal-close" onClick={onClose} aria-label="Fermer">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                    <div className="modal-body" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto' }}>
                        
                        <div className="form-field">
                            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary, #64748b)', marginBottom: '0.4rem', display: 'block' }}>
                                Nom du document
                            </label>
                            <input 
                                type="text" 
                                value={name} 
                                onChange={e => setName(e.target.value)} 
                                style={inputStyle}
                                placeholder="Ex: Liste des factures"
                                required
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ flex: '0 0 120px' }}>
                                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary, #64748b)', marginBottom: '0.4rem', display: 'block' }}>
                                    Méthode
                                </label>
                                <select value={method} onChange={e => setMethod(e.target.value)} style={inputStyle}>
                                    {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary, #64748b)', marginBottom: '0.4rem', display: 'block' }}>
                                    Chemin (Path)
                                </label>
                                <input 
                                    type="text" 
                                    value={path} 
                                    onChange={e => setPath(e.target.value)} 
                                    style={inputStyle}
                                    placeholder="/api/v1/resource"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-field">
                            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary, #64748b)', marginBottom: '0.4rem', display: 'block' }}>
                                Variables à extraire
                            </label>
                            <div className="variable-input-container" style={{ border: '1px solid var(--border-color, #cbd5e1)', borderRadius: '8px', padding: '0.5rem', background: 'var(--bg-secondary, #f8fafc)' }}>
                                <div className="variable-tags" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: variables.length > 0 ? '0.5rem' : '0' }}>
                                    {variables.map(v => (
                                        <span key={v} className="variable-tag" style={{ background: 'var(--accent-color, #6366f1)', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {v} <X size={12} onClick={() => toggleVariable(v)} style={{ cursor: 'pointer' }} />
                                        </span>
                                    ))}
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Ajouter une clé (ex: user.name) + Entrée"
                                    style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', fontSize: '0.85rem' }}
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
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem', display: 'block' }}>
                                {variables.length > 0 
                                    ? "Uniquement ces variables seront récupérées (supporte la notation pointée : parent.enfant)." 
                                    : "Si vide, toutes les données seront récupérées."}
                            </span>
                        </div>

                        <div className="form-field">
                            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary, #64748b)', marginBottom: '0.4rem', display: 'block' }}>
                                Description (optionnel)
                            </label>
                            <textarea 
                                style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                                value={description} 
                                onChange={e => setDescription(e.target.value)}
                                rows={2}
                            />
                        </div>

                        {editing?.id && (
                            <div className="test-section" style={{ borderTop: '1px solid var(--border-color, #e2e8f0)', paddingTop: '1.25rem' }}>
                                <button 
                                    type="button" 
                                    className={`btn-test ${testing ? 'loading' : ''}`}
                                    onClick={handleTest}
                                    disabled={testing}
                                    style={{ 
                                        width: '100%', 
                                        justifyContent: 'center', 
                                        marginBottom: '1rem', 
                                        padding: '0.75rem', 
                                        borderRadius: '8px', 
                                        background: 'transparent',
                                        border: '1px solid var(--accent-color, #6366f1)',
                                        color: 'var(--accent-color, #6366f1)',
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {testing ? <Loader2 size={16} className="spin" /> : <Zap size={16} />}
                                    Tester la récupération des données
                                </button>

                                {testResult && (
                                    <div className={`test-result-box ${testResult.success ? 'success' : 'error'}`} style={{ 
                                        maxHeight: '250px', 
                                        overflowY: 'auto',
                                        padding: '1rem',
                                        borderRadius: '8px',
                                        background: testResult.success ? 'rgba(34, 197, 94, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                                        border: testResult.success ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontWeight: 600, color: testResult.success ? '#166534' : '#991b1b' }}>
                                            {testResult.success ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                                            {testResult.success ? 'Récupération réussie' : 'Erreur de configuration'}
                                        </div>
                                        
                                        {testResult.missing_variables && testResult.missing_variables.length > 0 && (
                                            <div style={{ marginBottom: '0.75rem', color: '#991b1b', fontSize: '0.85rem', fontWeight: 500 }}>
                                                Variables non trouvées : {testResult.missing_variables.join(', ')}
                                            </div>
                                        )}

                                        <pre className="test-result-data" style={{ margin: 0, padding: '0.5rem', background: 'rgba(0,0,0,0.03)', borderRadius: '4px', fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
                                            {testResult.success 
                                                ? JSON.stringify(testResult.data, null, 2)
                                                : testResult.error || 'Certaines variables obligatoires sont manquantes.'}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="modal-footer" style={{ padding: '1.25rem 1.5rem', background: 'var(--bg-secondary, #f8fafc)', borderTop: '1px solid var(--border-color, #e2e8f0)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                        <button type="button" className="btn-cancel" onClick={onClose} style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer' }}>
                            Annuler
                        </button>
                        <button type="submit" className="btn-save" disabled={saving || !name || !path} style={{ padding: '0.6rem 1.5rem', borderRadius: '8px', border: 'none', background: 'var(--accent-color, #6366f1)', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
                            <Save size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                            {saving ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ApiEndpointModal;
