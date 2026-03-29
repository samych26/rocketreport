import { useState, useEffect } from 'react';
import { User, Lock, Palette, LogOut, Trash2, Check, Loader2, Sun, Moon, Code, Copy } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import api from '../services/api';
import './SettingsPage.css';

const SettingsPage = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    // MCP API Keys
    const [mcpKeys, setMcpKeys] = useState<{id: number, name: string, preview: string, createdAt: string, lastUsedAt: string|null}[]>([]);
    const [keysLoading, setKeysLoading] = useState(false);
    
    // New key modal
    const [newKey, setNewKey] = useState<string | null>(null);
    const [newKeyName, setNewKeyName] = useState('');
    const [isGeneratingKey, setIsGeneratingKey] = useState(false);
    const [keyCopied, setKeyCopied] = useState(false);

    // Profile
    const [name, setName] = useState(user?.name || '');
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileSuccess, setProfileSuccess] = useState(false);
    const [profileError, setProfileError] = useState('');

    // Password
    const [currentPwd, setCurrentPwd] = useState('');
    const [newPwd, setNewPwd] = useState('');
    const [confirmPwd, setConfirmPwd] = useState('');
    const [showCurrentPwd, setShowCurrentPwd] = useState(false);
    const [showNewPwd, setShowNewPwd] = useState(false);
    const [pwdSaving, setPwdSaving] = useState(false);
    const [pwdSuccess, setPwdSuccess] = useState(false);
    const [pwdError, setPwdError] = useState('');

    // Danger zone
    const [deleteConfirm, setDeleteConfirm] = useState('');
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        loadMcpKeys();
    }, []);

    const loadMcpKeys = async () => {
        setKeysLoading(true);
        try {
            const response = await api.get('/user/mcp-keys');
            setMcpKeys(response.data.mcpKeys || []);
        } catch (e) {
            console.error('Erreur chargement clés MCP', e);
        } finally {
            setKeysLoading(false);
        }
    };

    const saveProfile = async () => {
        setProfileError('');
        setProfileSuccess(false);
        if (!name.trim()) { setProfileError('Le nom est requis.'); return; }
        setProfileSaving(true);
        try {
            await api.patch('/auth/profile', { name: name.trim() });
            setProfileSuccess(true);
            setTimeout(() => setProfileSuccess(false), 3000);
        } catch (e: any) {
            setProfileError(e.response?.data?.error || 'Erreur lors de la sauvegarde.');
        } finally {
            setProfileSaving(false);
        }
    };

    const changePassword = async () => {
        setPwdError('');
        setPwdSuccess(false);
        if (!currentPwd) { setPwdError('Mot de passe actuel requis.'); return; }
        if (newPwd.length < 8) { setPwdError('Le nouveau mot de passe doit faire au moins 8 caractères.'); return; }
        if (newPwd !== confirmPwd) { setPwdError('Les mots de passe ne correspondent pas.'); return; }
        setPwdSaving(true);
        try {
            await api.post('/auth/change-password', { currentPassword: currentPwd, newPassword: newPwd });
            setPwdSuccess(true);
            setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
            setTimeout(() => setPwdSuccess(false), 3000);
        } catch (e: any) {
            setPwdError(e.response?.data?.error || 'Erreur lors du changement de mot de passe.');
        } finally {
            setPwdSaving(false);
        }
    };

    const deleteAccount = async () => {
        if (deleteConfirm !== 'SUPPRIMER') return;
        setDeleting(true);
        try {
            await api.delete('/auth/account');
            await logout();
        } catch (e: any) {
            alert(e.response?.data?.error || 'Erreur lors de la suppression du compte.');
            setDeleting(false);
        }
    };
    const generateMcpKey = async () => {
        if (!newKeyName.trim()) { alert('Le nom est requis.'); return; }
        setIsGeneratingKey(true);
        try {
            const response = await api.post('/user/mcp-keys', { name: newKeyName.trim() });
            setNewKey(response.data.key);
            setNewKeyName('');
            loadMcpKeys();
        } catch (e: any) {
            alert(e.response?.data?.error || 'Erreur lors de la génération.');
        } finally {
            setIsGeneratingKey(false);
        }
    };

    const revokeMcpKey = async (id: number) => {
        if (!window.confirm('Voulez-vous vraiment révoquer cette clé ? Elle ne fonctionnera plus immédiatement.')) return;
        try {
            await api.delete(`/user/mcp-keys/${id}`);
            loadMcpKeys();
        } catch (e: any) {
            alert(e.response?.data?.error || 'Erreur lors de la révocation.');
        }
    };

    const copyKey = (key: string) => {
        navigator.clipboard.writeText(key);
        setKeyCopied(true);
        setTimeout(() => setKeyCopied(false), 2000);
    };

    return (
        <MainLayout>
            <div className="settings-page">
                <div className="settings-header">
                    <h1>Paramètres</h1>
                    <p className="settings-subtitle">Gérez votre compte et vos préférences</p>
                </div>

                {/* Profile */}
                <section className="settings-section">
                    <div className="settings-section-title">
                        <User size={16} />
                        <span>Profil</span>
                    </div>
                    <div className="settings-card">
                        <div className="settings-field">
                            <label>Email</label>
                            <input type="email" value={user?.email || ''} disabled className="settings-input disabled" />
                            <span className="field-hint">L'adresse email ne peut pas être modifiée.</span>
                        </div>
                        <div className="settings-field">
                            <label>Nom d'affichage</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="settings-input"
                                placeholder="Votre nom…"
                            />
                        </div>
                        {profileError && <p className="settings-error">{profileError}</p>}
                        <button
                            className={`settings-btn-primary${profileSuccess ? ' success' : ''}`}
                            onClick={saveProfile}
                            disabled={profileSaving}
                        >
                            {profileSaving
                                ? <><Loader2 size={15} className="spin" /> Sauvegarde…</>
                                : profileSuccess
                                    ? <><Check size={15} /> Sauvegardé</>
                                    : 'Sauvegarder le profil'}
                        </button>
                    </div>
                </section>

                {/* Password */}
                <section className="settings-section">
                    <div className="settings-section-title">
                        <Lock size={16} />
                        <span>Mot de passe</span>
                    </div>
                    <div className="settings-card">
                        <div className="settings-field">
                            <label>Mot de passe actuel</label>
                            <div className="pwd-input-wrap">
                                <input
                                    type={showCurrentPwd ? 'text' : 'password'}
                                    value={currentPwd}
                                    onChange={e => setCurrentPwd(e.target.value)}
                                    className="settings-input"
                                    placeholder="••••••••"
                                />
                                <button className="pwd-toggle" onClick={() => setShowCurrentPwd(v => !v)} type="button">
                                    {showCurrentPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>
                        <div className="settings-field">
                            <label>Nouveau mot de passe</label>
                            <div className="pwd-input-wrap">
                                <input
                                    type={showNewPwd ? 'text' : 'password'}
                                    value={newPwd}
                                    onChange={e => setNewPwd(e.target.value)}
                                    className="settings-input"
                                    placeholder="8 caractères minimum"
                                />
                                <button className="pwd-toggle" onClick={() => setShowNewPwd(v => !v)} type="button">
                                    {showNewPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>
                        <div className="settings-field">
                            <label>Confirmer le nouveau mot de passe</label>
                            <input
                                type="password"
                                value={confirmPwd}
                                onChange={e => setConfirmPwd(e.target.value)}
                                className="settings-input"
                                placeholder="••••••••"
                            />
                        </div>
                        {pwdError && <p className="settings-error">{pwdError}</p>}
                        <button
                            className={`settings-btn-primary${pwdSuccess ? ' success' : ''}`}
                            onClick={changePassword}
                            disabled={pwdSaving}
                        >
                            {pwdSaving
                                ? <><Loader2 size={15} className="spin" /> Modification…</>
                                : pwdSuccess
                                    ? <><Check size={15} /> Mot de passe modifié</>
                                    : 'Modifier le mot de passe'}
                        </button>
                    </div>
                </section>

                {/* Developer / MCP API Keys */}
                <section className="settings-section">
                    <div className="settings-section-title">
                        <Code size={16} />
                        <span>Clés API / Serveur MCP</span>
                    </div>
                    <div className="settings-card">
                        <p className="settings-card-desc">
                            Utilisez ces clés pour configurer votre serveur MCP externe (Claude, Gemini, Antigravity) ou pour accéder à l'API via Rest/les SDKs.
                        </p>
                        
                        {newKey && (
                            <div className="new-key-alert" style={{ background: 'var(--mcp-surface)', padding: '15px', borderRadius: '8px', border: '1px solid var(--mcp-primary)', marginBottom: '20px' }}>
                                <p style={{ color: 'var(--mcp-text-primary)', fontWeight: 'bold' }}>⚠️ Copiez votre clé maintenant :</p>
                                <p className="field-hint">Pour des raisons de sécurité, cette clé ne sera <strong>plus jamais affichée</strong>.</p>
                                
                                <div className="api-key-input-wrap" style={{ marginTop: '10px' }}>
                                    <input type="text" value={newKey} readOnly className="settings-input api-key-input" style={{ fontFamily: 'monospace' }} />
                                    <div className="api-key-actions">
                                        <button className="api-key-btn" onClick={() => copyKey(newKey)} title="Copier">
                                            {keyCopied ? <Check size={16} className="success-icon" /> : <Copy size={16} />}
                                        </button>
                                    </div>
                                </div>
                                <button className="settings-btn-secondary" onClick={() => setNewKey(null)} style={{ marginTop: '10px' }}>
                                    J'ai bien copié la clé
                                </button>
                            </div>
                        )}

                        <div className="settings-field">
                            <label>Créer une nouvelle clé</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="text"
                                    value={newKeyName}
                                    onChange={e => setNewKeyName(e.target.value)}
                                    className="settings-input"
                                    placeholder="Nom (ex: Claude Desktop)"
                                    style={{ flex: 1 }}
                                />
                                <button
                                    className="settings-btn-primary"
                                    onClick={generateMcpKey}
                                    disabled={isGeneratingKey || !newKeyName.trim()}
                                >
                                    {isGeneratingKey ? <Loader2 size={15} className="spin" /> : 'Créer'}
                                </button>
                            </div>
                        </div>

                        <div className="mcp-keys-list" style={{ marginTop: '30px' }}>
                            <label>Vos clés actives ({mcpKeys.length})</label>
                            {keysLoading ? (
                                <p><Loader2 size={15} className="spin" /> Chargement...</p>
                            ) : mcpKeys.length === 0 ? (
                                <p className="field-hint">Aucune clé API configurée.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                                    {mcpKeys.map(k => (
                                        <div key={k.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--mcp-surface)', border: '1px solid var(--mcp-border)', borderRadius: '6px' }}>
                                            <div>
                                                <div style={{ fontWeight: 500, color: 'var(--mcp-text-primary)' }}>{k.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--mcp-text-secondary)', fontFamily: 'monospace' }}>{k.preview}</div>
                                                {k.lastUsedAt && <div style={{ fontSize: '0.7rem', color: 'var(--mcp-text-secondary)' }}>Dernière util. : {new Date(k.lastUsedAt).toLocaleString()}</div>}
                                            </div>
                                            <button className="settings-btn-danger-outline" style={{ padding: '6px 10px', fontSize: '0.8rem' }} onClick={() => revokeMcpKey(k.id)}>
                                                Révoquer
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </section>
                <section className="settings-section">
                    <div className="settings-section-title">
                        <Palette size={16} />
                        <span>Apparence</span>
                    </div>
                    <div className="settings-card">
                        <div className="settings-theme-row">
                            <div>
                                <p className="theme-label">Thème</p>
                                <p className="field-hint">
                                    {theme === 'light' ? 'Mode clair activé' : 'Mode sombre activé'}
                                </p>
                            </div>
                            <button className="theme-toggle-btn" onClick={toggleTheme}>
                                {theme === 'light'
                                    ? <><Moon size={16} /> Passer en sombre</>
                                    : <><Sun size={16} /> Passer en clair</>}
                            </button>
                        </div>
                    </div>
                </section>

                {/* Danger zone */}
                <section className="settings-section danger-section">
                    <div className="settings-section-title danger-title">
                        <Trash2 size={16} />
                        <span>Zone dangereuse</span>
                    </div>
                    <div className="settings-card danger-card">
                        <div className="danger-row">
                            <div>
                                <p className="danger-label">Se déconnecter</p>
                                <p className="field-hint">Vous serez redirigé vers la page de connexion.</p>
                            </div>
                            <button className="settings-btn-danger-outline" onClick={logout}>
                                <LogOut size={15} /> Déconnexion
                            </button>
                        </div>

                        <hr className="danger-divider" />

                        <div className="danger-row">
                            <div>
                                <p className="danger-label">Supprimer le compte</p>
                                <p className="field-hint">Cette action est irréversible. Toutes vos données seront supprimées.</p>
                            </div>
                        </div>
                        <div className="delete-confirm-row">
                            <input
                                type="text"
                                value={deleteConfirm}
                                onChange={e => setDeleteConfirm(e.target.value)}
                                className="settings-input"
                                placeholder='Tapez "SUPPRIMER" pour confirmer'
                            />
                            <button
                                className="settings-btn-danger"
                                onClick={deleteAccount}
                                disabled={deleteConfirm !== 'SUPPRIMER' || deleting}
                            >
                                {deleting ? <Loader2 size={15} className="spin" /> : <Trash2 size={15} />}
                                Supprimer
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </MainLayout>
    );
};

export default SettingsPage;
