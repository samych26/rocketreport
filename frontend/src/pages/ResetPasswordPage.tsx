import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import './ForgotPasswordPage.css';

const passwordRules = [
    { id: 'length',  label: '8 caractères minimum',  test: (p: string) => p.length >= 8 },
    { id: 'upper',   label: '1 majuscule',            test: (p: string) => /[A-Z]/.test(p) },
    { id: 'number',  label: '1 chiffre',              test: (p: string) => /[0-9]/.test(p) },
    { id: 'special', label: '1 caractère spécial',    test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token') ?? '';
    console.log('ResetPasswordPage token:', token);

    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirm) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }
        const failed = passwordRules.find(r => !r.test(password));
        if (failed) { setError(`Le mot de passe doit contenir ${failed.label.toLowerCase()}.`); return; }

        setIsLoading(true);
        try {
            await api.post('/auth/reset-password', { token, password });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Lien invalide ou expiré.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="fp-page">
                <div className="fp-card">
                    <div className="fp-error">Lien de réinitialisation invalide.</div>
                    <div className="fp-footer" style={{ marginTop: '1rem' }}>
                        <Link to="/forgot-password">Faire une nouvelle demande</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fp-page">
            <div className="fp-card">
                <Link to="/" className="fp-logo">
                    <span className="fp-logo-icon">🚀</span>
                    <span className="fp-logo-text">RocketReport</span>
                </Link>

                <h1 className="fp-title">Nouveau mot de passe</h1>
                <p className="fp-subtitle">Choisissez un nouveau mot de passe sécurisé pour votre compte.</p>

                {success ? (
                    <div className="fp-success">
                        ✅ <strong>Mot de passe réinitialisé !</strong><br />
                        Redirection vers la connexion dans 3 secondes…
                    </div>
                ) : (
                    <form className="fp-form" onSubmit={handleSubmit}>
                        {error && <div className="fp-error">{error}</div>}

                        <div>
                            <label className="fp-label">Nouveau mot de passe</label>
                            <input
                                type="password"
                                className="fp-input"
                                placeholder="8 caractères minimum"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                            {password.length > 0 && (
                                <ul className="fc-pwd-rules" style={{ marginTop: '0.5rem' }}>
                                    {passwordRules.map(rule => (
                                        <li key={rule.id} className={rule.test(password) ? 'fc-pwd-rule--ok' : 'fc-pwd-rule--ko'}>
                                            <span className="fc-pwd-rule-icon">{rule.test(password) ? '✓' : '✗'}</span>
                                            {rule.label}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div>
                            <label className="fp-label">Confirmer le mot de passe</label>
                            <input
                                type="password"
                                className="fp-input"
                                placeholder="Répétez le mot de passe"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <button type="submit" className="fp-btn" disabled={isLoading}>
                            {isLoading ? 'Réinitialisation…' : 'Réinitialiser le mot de passe'}
                        </button>
                    </form>
                )}

                <div className="fp-footer">
                    <Link to="/login">← Retour à la connexion</Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
