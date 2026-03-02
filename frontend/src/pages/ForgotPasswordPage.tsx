import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './ForgotPasswordPage.css';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            setSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Une erreur est survenue.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fp-page">
            <div className="fp-card">
                <Link to="/" className="fp-logo">
                    <span className="fp-logo-icon">🚀</span>
                    <span className="fp-logo-text">RocketReport</span>
                </Link>

                <h1 className="fp-title">Mot de passe oublié</h1>
                <p className="fp-subtitle">
                    Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                </p>

                {success ? (
                    <div className="fp-success">
                        ✅ <strong>Email envoyé !</strong><br />
                        Si cette adresse est associée à un compte, vous recevrez un lien dans les prochaines minutes.
                        Vérifiez également vos spams.
                    </div>
                ) : (
                    <form className="fp-form" onSubmit={handleSubmit}>
                        {error && <div className="fp-error">{error}</div>}

                        <div>
                            <label className="fp-label">Adresse email</label>
                            <input
                                type="email"
                                className="fp-input"
                                placeholder="vous@exemple.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <button type="submit" className="fp-btn" disabled={isLoading}>
                            {isLoading ? 'Envoi en cours…' : 'Envoyer le lien de réinitialisation'}
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

export default ForgotPasswordPage;
