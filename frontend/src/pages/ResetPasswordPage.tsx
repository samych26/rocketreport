import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import './ForgotPasswordPage.css';

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token') ?? '';

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
        if (password.length < 8) {
            setError('Le mot de passe doit faire au moins 8 caractères.');
            return;
        }

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
                            <p className="fp-password-hint">Minimum 8 caractères</p>
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
