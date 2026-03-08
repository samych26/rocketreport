import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './ForgotPasswordPage.css';

const VerifyEmailPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token') ?? '';

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setErrorMessage('Lien de vérification invalide.');
            return;
        }

        api.post('/auth/verify-email', { token })
            .then(() => {
                setStatus('success');
                setTimeout(() => navigate('/login?verified=1'), 2500);
            })
            .catch((err: any) => {
                setStatus('error');
                setErrorMessage(err.response?.data?.error || 'Lien invalide ou déjà utilisé.');
            });
    }, [token]);

    return (
        <div className="fp-page">
            <div className="fp-card">
                <Link to="/" className="fp-logo">
                    <span className="fp-logo-icon">🚀</span>
                    <span className="fp-logo-text">RocketReport</span>
                </Link>

                {status === 'loading' && (
                    <>
                        <div style={{ textAlign: 'center', margin: '1.5rem 0', fontSize: '2rem' }}>⏳</div>
                        <h1 className="fp-title">Vérification en cours…</h1>
                        <p className="fp-subtitle">Merci de patienter quelques instants.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div style={{ textAlign: 'center', margin: '1.5rem 0', fontSize: '3rem' }}>✅</div>
                        <h1 className="fp-title">Compte vérifié !</h1>
                        <p className="fp-subtitle">Votre compte est maintenant actif. Redirection vers la connexion…</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div style={{ textAlign: 'center', margin: '1.5rem 0', fontSize: '3rem' }}>❌</div>
                        <h1 className="fp-title">Lien invalide</h1>
                        <div className="fp-error">{errorMessage}</div>
                        <div className="fp-footer" style={{ marginTop: '1rem' }}>
                            <Link to="/login">← Retour à la connexion</Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default VerifyEmailPage;
