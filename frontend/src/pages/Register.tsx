import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';
import AuthLayout from '../layouts/AuthLayout';
import './AuthPages.css';

const Register = () => {
    const { t } = useLanguage();
    const { register } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit= async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }

        setIsLoading(true);

        try {
            await register({ name, email, password });
            navigate('/verify-email-sent'); // Redirect to "check your email" page
        } catch (err: any) {
            setError(err.response?.data?.message || err.response?.data?.error || 'Erreur lors de la création du compte.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout illustration="nodes">
            <div className="auth-form-header">
                <h1 className="auth-title">{t('register_title')}</h1>
                <p className="auth-subtitle">Créez votre compte pour commencer.</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
                {error && <div className="auth-error-message">{error}</div>}

                <div className="form-group">
                    <label htmlFor="name" className="form-label">{t('name_label')}</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="form-input"
                        placeholder={t('name_placeholder')}
                        required
                        disabled={isLoading}
                    />
                </div>

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
                    <label htmlFor="password" className="form-label">{t('password_label')}</label>
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

                <div className="form-group">
                    <label htmlFor="confirmPassword" className="form-label">{t('confirm_password_label')}</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="form-input"
                        placeholder={t('password_placeholder')}
                        required
                        disabled={isLoading}
                    />
                </div>

                <button type="submit" className="btn-primary auth-submit-btn" disabled={isLoading}>
                    {isLoading ? '...' : t('register_submit')}
                </button>
            </form>

            <div className="auth-footer">
                <p>
                    {t('have_account')} <Link to="/login" className="auth-link">{t('sign_in_link')}</Link>
                </p>
            </div>
        </AuthLayout>
    );
};

export default Register;
