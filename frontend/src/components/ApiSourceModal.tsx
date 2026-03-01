import { useState, useEffect } from 'react';
import { X, Plug, Plus, Trash2 } from 'lucide-react';
import type { ApiSource, ApiSourcePayload } from '../services/apiSourceService';
import './ApiSourceModal.css';

interface Props {
    editing?: ApiSource | null;
    onSave: (payload: ApiSourcePayload, id?: number) => Promise<void>;
    onClose: () => void;
}

type AuthType = 'none' | 'bearer' | 'api_key' | 'basic';

interface HeaderRow { key: string; value: string; }

const AUTH_OPTIONS: { value: AuthType; label: string; hint: string }[] = [
    { value: 'none',    label: 'Aucune',          hint: '' },
    { value: 'bearer',  label: 'Bearer Token',     hint: 'Authorization: Bearer <token>' },
    { value: 'api_key', label: 'API Key',           hint: 'X-API-Key: <key>' },
    { value: 'basic',   label: 'Basic Auth',        hint: 'Authorization: Basic base64(login:password)' },
];

const ApiSourceModal = ({ editing, onSave, onClose }: Props) => {
    const isEditing = !!editing;

    const [name, setName]           = useState(editing?.name ?? '');
    const [description, setDesc]    = useState(editing?.description ?? '');
    const [urlBase, setUrlBase]     = useState(editing?.url_base ?? '');
    const [authType, setAuthType]   = useState<AuthType>(editing?.auth_type ?? 'none');
    const [authToken, setAuthToken] = useState('');
    const [headers, setHeaders]     = useState<HeaderRow[]>([{ key: '', value: '' }]);
    const [loading, setLoading]     = useState(false);
    const [error, setError]         = useState('');
    const [showHeaders, setShowHeaders] = useState(false);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    const addHeader    = () => setHeaders(h => [...h, { key: '', value: '' }]);
    const removeHeader = (i: number) => setHeaders(h => h.filter((_, idx) => idx !== i));
    const setHeader    = (i: number, field: 'key' | 'value', val: string) =>
        setHeaders(h => h.map((row, idx) => idx === i ? { ...row, [field]: val } : row));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) { setError('Le nom est requis.'); return; }
        if (!urlBase.trim()) { setError("L'URL de base est requise."); return; }
        try { new URL(urlBase); } catch { setError("L'URL n'est pas valide."); return; }

        setLoading(true);
        setError('');

        const customHeaders: Record<string, string> = {};
        headers.forEach(({ key, value }) => { if (key.trim()) customHeaders[key.trim()] = value; });

        const payload: ApiSourcePayload = {
            name,
            description: description || undefined,
            url_base: urlBase,
            auth_type: authType,
            auth_token: authToken || undefined,
            headers: Object.keys(customHeaders).length ? customHeaders : undefined,
        };

        try {
            await onSave(payload, editing?.id);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Erreur lors de la sauvegarde.');
        } finally {
            setLoading(false);
        }
    };

    const selectedAuth = AUTH_OPTIONS.find(a => a.value === authType);

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal-panel api-modal-panel">
                <div className="modal-header">
                    <div className="modal-title">
                        <Plug size={20} />
                        <h2>{isEditing ? 'Modifier la source API' : 'Nouvelle source API'}</h2>
                    </div>
                    <button className="modal-close" onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body">
                    {error && <div className="modal-error">{error}</div>}

                    {/* Nom + Description */}
                    <div className="form-field">
                        <label>Nom *</label>
                        <input type="text" placeholder="Ex: API Météo, CRM interne…"
                            value={name} onChange={e => setName(e.target.value)} required autoFocus />
                    </div>

                    <div className="form-field">
                        <label>Description</label>
                        <input type="text" placeholder="Description optionnelle…"
                            value={description} onChange={e => setDesc(e.target.value)} />
                    </div>

                    {/* URL */}
                    <div className="form-field">
                        <label>URL de base *</label>
                        <input type="url" placeholder="https://api.example.com/v1"
                            value={urlBase} onChange={e => setUrlBase(e.target.value)} required />
                    </div>

                    {/* Auth */}
                    <div className="form-section-title">Authentification</div>
                    <div className="auth-type-grid">
                        {AUTH_OPTIONS.map(opt => (
                            <button key={opt.value} type="button"
                                className={`auth-type-btn ${authType === opt.value ? 'active' : ''}`}
                                onClick={() => setAuthType(opt.value)}>
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    {authType !== 'none' && (
                        <div className="form-field">
                            <label>
                                {authType === 'bearer'  && 'Token Bearer'}
                                {authType === 'api_key' && 'Clé API'}
                                {authType === 'basic'   && 'Identifiants (login:motdepasse)'}
                            </label>
                            <input type="password"
                                placeholder={selectedAuth?.hint}
                                value={authToken}
                                onChange={e => setAuthToken(e.target.value)} />
                            {!isEditing && (
                                <span className="field-hint">Laissez vide pour ne pas modifier</span>
                            )}
                        </div>
                    )}

                    {/* Custom headers */}
                    <div className="form-section-toggle" onClick={() => setShowHeaders(v => !v)}>
                        <span>En-têtes personnalisés {headers.filter(h => h.key).length > 0 ? `(${headers.filter(h => h.key).length})` : ''}</span>
                        <span className={`toggle-arrow ${showHeaders ? 'open' : ''}`}>▾</span>
                    </div>

                    {showHeaders && (
                        <div className="headers-editor">
                            {headers.map((row, i) => (
                                <div key={i} className="header-row">
                                    <input placeholder="Clé" value={row.key}
                                        onChange={e => setHeader(i, 'key', e.target.value)} />
                                    <input placeholder="Valeur" value={row.value}
                                        onChange={e => setHeader(i, 'value', e.target.value)} />
                                    <button type="button" className="header-remove"
                                        onClick={() => removeHeader(i)} disabled={headers.length === 1}>
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            ))}
                            <button type="button" className="header-add" onClick={addHeader}>
                                <Plus size={13} /> Ajouter un en-tête
                            </button>
                        </div>
                    )}

                    <div className="modal-footer">
                        <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>Annuler</button>
                        <button type="submit" className="btn-save" disabled={loading}>
                            {loading ? 'Sauvegarde…' : isEditing ? 'Mettre à jour' : 'Créer la source'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ApiSourceModal;
