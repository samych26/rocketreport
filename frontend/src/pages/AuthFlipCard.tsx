import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import Navbar from '../components/Navbar';
import api from '../services/api';
import './AuthFlipCard.css';

const passwordRules = [
    { id: 'length',   label: '8 caractères minimum',      test: (p: string) => p.length >= 8 },
    { id: 'upper',    label: '1 majuscule',                test: (p: string) => /[A-Z]/.test(p) },
    { id: 'number',   label: '1 chiffre',                  test: (p: string) => /[0-9]/.test(p) },
    { id: 'special',  label: '1 caractère spécial',        test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

const PasswordRules = ({ password }: { password: string }) => (
    <ul className="fc-pwd-rules">
        {passwordRules.map(rule => (
            <li key={rule.id} className={rule.test(password) ? 'fc-pwd-rule--ok' : 'fc-pwd-rule--ko'}>
                <span className="fc-pwd-rule-icon">{rule.test(password) ? '✓' : '✗'}</span>
                {rule.label}
            </li>
        ))}
    </ul>
);

interface Props { initialSide?: 'login' | 'register'; }

const AuthFlipCard = ({ initialSide = 'login' }: Props) => {
    const [searchParams] = useSearchParams();
    const verified = searchParams.get('verified') === '1';

    const [isFlipped, setIsFlipped] = useState(initialSide === 'register');

    const [loginEmail,    setLoginEmail]    = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginError,    setLoginError]    = useState('');
    const [loginLoading,  setLoginLoading]  = useState(false);

    const [regName,     setRegName]     = useState('');
    const [regEmail,    setRegEmail]    = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regConfirm,  setRegConfirm]  = useState('');
    const [regError,    setRegError]    = useState('');
    const [regLoading,  setRegLoading]  = useState(false);
    const [regSuccess,  setRegSuccess]  = useState(false);

    const [showLoginPwd,  setShowLoginPwd]  = useState(false);
    const [showRegPwd,    setShowRegPwd]    = useState(false);
    const [showRegConfirm, setShowRegConfirm] = useState(false);

    const [_googleLoading, setGoogleLoading] = useState(false);
    const [googleError,   setGoogleError]   = useState('');

    const { login, register, loginWithUser } = useAuth();
    const navigate = useNavigate();
    const { t } = useLanguage();

    const handleGoogleAuth = async (accessToken: string) => {
        setGoogleLoading(true);
        setGoogleError('');
        try {
            const res = await api.post('/auth/google', { access_token: accessToken });
            if (res.data?.user) {
                loginWithUser(res.data.user);
            }
            navigate('/dashboard');
        } catch (err: any) {
            setGoogleError(err.response?.data?.error || 'Connexion Google échouée. Réessayez.');
        } finally {
            setGoogleLoading(false);
        }
    };

    const googleLogin = useGoogleLogin({
        onSuccess: (tokenResponse) => handleGoogleAuth(tokenResponse.access_token),
        onError: () => setGoogleError('Connexion Google annulée ou échouée.'),
    });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError('');
        setLoginLoading(true);
        try {
            await login({ email: loginEmail, password: loginPassword });
            navigate('/dashboard');
        } catch (err: any) {
            setLoginError(err.response?.data?.error || err.response?.data?.message || 'Identifiants invalides');
        } finally { setLoginLoading(false); }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setRegError('');
        if (regPassword !== regConfirm) { setRegError('Les mots de passe ne correspondent pas'); return; }
        const failed = passwordRules.find(r => !r.test(regPassword));
        if (failed) { setRegError(`Le mot de passe doit contenir ${failed.label.toLowerCase()}.`); return; }
        setRegLoading(true);
        try {
            await register({ name: regName, email: regEmail, password: regPassword });
            setRegSuccess(true);
        } catch (err: any) {
            setRegError(err.response?.data?.error || err.response?.data?.message || "Erreur lors de l'inscription");
        } finally { setRegLoading(false); }
    };

    return (
        <div className="fc-page">
            <Navbar />

            <div className="fc-center">
                {/* ── Toggle ── */}
                <div className="fc-switch-row">
                    <span className={`fc-tab ${!isFlipped ? 'fc-tab--active' : ''}`}
                          onClick={() => setIsFlipped(false)}>
                        {t('login_title')}
                    </span>

                    <label className="fc-switch">
                        <input type="checkbox" checked={isFlipped}
                               onChange={() => setIsFlipped(v => !v)} />
                        <span className="fc-slider" />
                    </label>

                    <span className={`fc-tab ${isFlipped ? 'fc-tab--active' : ''}`}
                          onClick={() => setIsFlipped(true)}>
                        {t('register_title')}
                    </span>
                </div>

                {/* ── Card ── */}
                <div className={`fc-inner ${isFlipped ? 'fc-inner--flipped' : ''}`}>

                    {/* Front — Login */}
                    <div className="fc-face fc-face--front">
                        <h2 className="fc-title">{t('login_title')}</h2>
                        <p className="fc-subtitle">{t('welcome')}</p>

                        <form className="fc-form" onSubmit={handleLogin}>
                            {verified && (
                                <div className="fc-success">
                                    ✅ Compte vérifié ! Vous pouvez vous connecter.
                                </div>
                            )}
                            {loginError && <div className="fc-error">{loginError}</div>}

                            <div className="fc-field">
                                <label>{t('email_label')}</label>
                                <input type="email" value={loginEmail}
                                       onChange={e => setLoginEmail(e.target.value)}
                                       placeholder={t('email_placeholder')}
                                       required disabled={loginLoading} />
                            </div>

                            <div className="fc-field">
                                <div className="fc-field-row">
                                    <label>{t('password_label')}</label>
                                    <Link to="/forgot-password" className="fc-forgot">Mot de passe oublié ?</Link>
                                </div>
                                <div className="fc-pwd-wrapper">
                                    <input type={showLoginPwd ? 'text' : 'password'} value={loginPassword}
                                           onChange={e => setLoginPassword(e.target.value)}
                                           placeholder="••••••••"
                                           required disabled={loginLoading} />
                                    <button type="button" className="fc-pwd-toggle" onClick={() => setShowLoginPwd(v => !v)} tabIndex={-1}>
                                        {showLoginPwd ? '🙈' : '👁️'}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" className="fc-btn" disabled={loginLoading}>
                                {loginLoading ? '...' : t('login_submit')}
                            </button>

                            <div className="fc-divider"><span>ou</span></div>

                            {googleError && <div className="fc-error">{googleError}</div>}
                            <button
                                type="button"
                                className="fc-btn-google"
                                onClick={() => googleLogin()}
                                disabled={_googleLoading}
                            >
                                <svg className="fc-google-icon" viewBox="0 0 24 24" aria-hidden="true">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                                {_googleLoading ? 'Connexion...' : 'Continuer avec Google'}
                            </button>
                        </form>
                    </div>

                    {/* Back — Register */}
                    <div className="fc-face fc-face--back">
                        <h2 className="fc-title">{t('register_title')}</h2>
                        <p className="fc-subtitle">{t('no_account')}</p>

                        {regSuccess ? (
                            <div className="fc-verify-notice">
                                <div className="fc-verify-icon">📧</div>
                                <p className="fc-verify-title">Vérifiez votre boîte mail !</p>
                                <p className="fc-verify-text">
                                    Un lien d'activation a été envoyé à <strong>{regEmail}</strong>.
                                    Cliquez sur ce lien pour activer votre compte.
                                </p>
                                <p className="fc-verify-hint">Pensez à vérifier vos spams.</p>
                                <button
                                    type="button"
                                    className="fc-btn fc-btn--outline"
                                    onClick={() => { setIsFlipped(false); setRegSuccess(false); }}
                                >
                                    Aller à la connexion
                                </button>
                            </div>
                        ) : (
                        <form className="fc-form" onSubmit={handleRegister}>
                            {regError && <div className="fc-error">{regError}</div>}

                            <div className="fc-field">
                                <label>Nom</label>
                                <input type="text" value={regName}
                                       onChange={e => setRegName(e.target.value)}
                                       placeholder="Votre nom"
                                       disabled={regLoading} />
                            </div>

                            <div className="fc-field">
                                <label>{t('email_label')}</label>
                                <input type="email" value={regEmail}
                                       onChange={e => setRegEmail(e.target.value)}
                                       placeholder={t('email_placeholder')}
                                       required disabled={regLoading} />
                            </div>

                            <div className="fc-field">
                                <label>{t('password_label')}</label>
                                <div className="fc-pwd-wrapper">
                                    <input type={showRegPwd ? 'text' : 'password'} value={regPassword}
                                           onChange={e => setRegPassword(e.target.value)}
                                           placeholder="••••••••"
                                           required disabled={regLoading} />
                                    <button type="button" className="fc-pwd-toggle" onClick={() => setShowRegPwd(v => !v)} tabIndex={-1}>
                                        {showRegPwd ? '🙈' : '👁️'}
                                    </button>
                                </div>
                                {regPassword.length > 0 && <PasswordRules password={regPassword} />}
                            </div>

                            <div className="fc-field">
                                <label>Confirmer le mot de passe</label>
                                <div className="fc-pwd-wrapper">
                                    <input type={showRegConfirm ? 'text' : 'password'} value={regConfirm}
                                           onChange={e => setRegConfirm(e.target.value)}
                                           placeholder="••••••••"
                                           required disabled={regLoading} />
                                    <button type="button" className="fc-pwd-toggle" onClick={() => setShowRegConfirm(v => !v)} tabIndex={-1}>
                                        {showRegConfirm ? '🙈' : '👁️'}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" className="fc-btn" disabled={regLoading}>
                                {regLoading ? '...' : t('register_submit')}
                            </button>
                        </form>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AuthFlipCard;
