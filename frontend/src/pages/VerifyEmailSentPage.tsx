import { Link } from 'react-router-dom';
import './ForgotPasswordPage.css';

const VerifyEmailSentPage = () => {
    return (
        <div className="fp-page">
            <div className="fp-card">
                <Link to="/" className="fp-logo">
                    <span className="fp-logo-icon">🚀</span>
                    <span className="fp-logo-text">RocketReport</span>
                </Link>

                <div style={{ textAlign: 'center', margin: '1.5rem 0' }}>
                    <span style={{ fontSize: '3rem' }}>📧</span>
                </div>

                <h1 className="fp-title">Vérifiez votre email</h1>
                <p className="fp-subtitle">
                    Un lien d'activation a été envoyé à votre adresse email.
                    Cliquez sur ce lien pour activer votre compte.
                </p>

                <div className="fp-success" style={{ marginTop: '1rem' }}>
                    <strong>Pensez à vérifier vos spams</strong> si vous ne trouvez pas l'email dans votre boîte de réception.
                </div>

                <div className="fp-footer" style={{ marginTop: '1.5rem' }}>
                    <Link to="/login">← Retour à la connexion</Link>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmailSentPage;
