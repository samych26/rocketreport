import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';
import AuthLayout from '../layouts/AuthLayout';
import './AuthPages.css';

const Login = () => {
    const { t } = useLanguage();
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login({ email, password });
            navigate('/dashboard'); // Redirect to dashboard or home after successful login
        } catch (err: any) {
            setError(err.response?.data?.error || err.response?.data?.message || 'Identifiants invalides ou erreur serveur.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout illustration="rocket">
            <div className="auth-form-header">
                <h1 className="auth-title">{t('login_title')}</h1>
                <p className="auth-subtitle">{t('welcome')}</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
                {error && <div className="auth-error-message">{error}</div>}

                <div className="form-group">
                    <label htmlFor="email" className="form-label">{t('email_label')}</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="form-input"
                        placeholder={t('email_placeholder')}
                        required
                        disabled={isLoading}
                    />
                </div>

                <div className="form-group">
                    <div className="form-label-row">
                        <label htmlFor="password" className="form-label">{t('password_label')}</label>
                        <a href="#" className="forgot-password-link">{t('forgot_password')}</a>
                    </div>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="form-input"
                        placeholder={t('password_placeholder')}
                        required
                        disabled={isLoading}
                    />
                </div>

                <button type="submit" className="btn-primary auth-submit-btn" disabled={isLoading}>
                    {isLoading ? '...' : t('login_submit')}
                </button>
            </form>

            <div className="auth-footer">
                <p>
                    {t('no_account')} <Link to="/register" className="auth-link">{t('sign_up_link')}</Link>
                </p>
            </div>
        </AuthLayout>
    );
};

export default Login;
