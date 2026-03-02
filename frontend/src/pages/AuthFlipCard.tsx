import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import Navbar from '../components/Navbar';
import './AuthFlipCard.css';

interface Props { initialSide?: 'login' | 'register'; }

const AuthFlipCard = ({ initialSide = 'login' }: Props) => {
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

    const { login, register } = useAuth();
    const navigate = useNavigate();
    const { t } = useLanguage();

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
        setRegLoading(true);
        try {
            await register({ name: regName, email: regEmail, password: regPassword });
            navigate('/dashboard');
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
                            {loginError && <div className="fc-error">{loginError}</div>}

                            <div className="fc-field">
                                <label>{t('email_label')}</label>
                                <input type="email" value={loginEmail}
                                       onChange={e => setLoginEmail(e.target.value)}
                                       placeholder={t('email_placeholder')}
                                       required disabled={loginLoading} />
                            </div>

                            <div className="fc-field">
                                <label>{t('password_label')}</label>
                                <input type="password" value={loginPassword}
                                       onChange={e => setLoginPassword(e.target.value)}
                                       placeholder="••••••••"
                                       required disabled={loginLoading} />
                            </div>

                            <button type="submit" className="fc-btn" disabled={loginLoading}>
                                {loginLoading ? '...' : t('login_submit')}
                            </button>
                        </form>
                    </div>

                    {/* Back — Register */}
                    <div className="fc-face fc-face--back">
                        <h2 className="fc-title">{t('register_title')}</h2>
                        <p className="fc-subtitle">{t('no_account')}</p>

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
                                <input type="password" value={regPassword}
                                       onChange={e => setRegPassword(e.target.value)}
                                       placeholder="••••••••"
                                       required disabled={regLoading} />
                            </div>

                            <div className="fc-field">
                                <label>Confirmer le mot de passe</label>
                                <input type="password" value={regConfirm}
                                       onChange={e => setRegConfirm(e.target.value)}
                                       placeholder="••••••••"
                                       required disabled={regLoading} />
                            </div>

                            <button type="submit" className="fc-btn" disabled={regLoading}>
                                {regLoading ? '...' : t('register_submit')}
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AuthFlipCard;
