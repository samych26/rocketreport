import { useState } from 'react';
import { User, Lock, Palette, LogOut, Trash2, Check, Loader2, Sun, Moon, Eye, EyeOff, Code, Copy, RefreshCw } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import api from '../services/api';
import './SettingsPage.css';

const SettingsPage = () => {
    const { user, logout, loginWithUser } = useAuth();
    const { theme, toggleTheme } = useTheme();

    // API Key
    const [apiKey, setApiKey] = useState(user?.api_token || '');
    const [showApiKey, setShowApiKey] = useState(false);
    const [apiKeyRegenerating, setApiKeyRegenerating] = useState(false);
    const [apiKeyCopied, setApiKeyCopied] = useState(false);

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
    const regenerateApiKey = async () => {
        if (!window.confirm('Voulez-vous vraiment régénérer votre clé API ? L\'ancienne clé ne fonctionnera plus.')) return;
        setApiKeyRegenerating(true);
        try {
            const response = await api.post('/auth/regenerate-api-token');
            const newToken = response.data.api_token;
            setApiKey(newToken);
            if (user) {
                loginWithUser({ ...user, api_token: newToken });
            }
        } catch (e: any) {
            alert(e.response?.data?.error || 'Erreur lors de la régénération.');
        } finally {
            setApiKeyRegenerating(false);
        }
    };

    const copyApiKey = () => {
        navigator.clipboard.writeText(apiKey);
        setApiKeyCopied(true);
        setTimeout(() => setApiKeyCopied(false), 2000);
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

                {/* Developer / API Key */}
                <section className="settings-section">
                    <div className="settings-section-title">
                        <Code size={16} />
                        <span>Développeur</span>
                    </div>
                    <div className="settings-card">
                        <p className="settings-card-desc">
                            Utilisez votre clé API pour intégrer RocketReport dans vos applications ou via le package NPM.
                        </p>
                        <div className="settings-field">
                            <label>Clé API</label>
                            <div className="api-key-input-wrap">
                                <input
                                    type={showApiKey ? 'text' : 'password'}
                                    value={apiKey}
                                    readOnly
                                    className="settings-input api-key-input"
                                />
                                <div className="api-key-actions">
                                    <button className="api-key-btn" onClick={() => setShowApiKey(!showApiKey)} title={showApiKey ? 'Masquer' : 'Afficher'}>
                                        {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                    <button className="api-key-btn" onClick={copyApiKey} title="Copier">
                                        {apiKeyCopied ? <Check size={16} className="success-icon" /> : <Copy size={16} />}
                                    </button>
                                </div>
                            </div>
                            <span className="field-hint">Gardez cette clé secrète !</span>
                        </div>
                        <button
                            className="settings-btn-secondary"
                            onClick={regenerateApiKey}
                            disabled={apiKeyRegenerating}
                        >
                            {apiKeyRegenerating ? <Loader2 size={15} className="spin" /> : <RefreshCw size={15} />}
                            Régénérer la clé API
                        </button>
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
