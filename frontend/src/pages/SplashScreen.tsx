import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SplashScreen.css';
import logo from '../assets/logo-white.svg';

const SplashScreen = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/welcome');
        }, 2000);
        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="splash-screen">
            <div className="splash-particles">
                {[...Array(12)].map((_, i) => (
                    <div key={i} className={`particle particle-${i + 1}`} />
                ))}
            </div>

            <div className="splash-content">
                <div className="splash-logo-wrapper">
                    <div className="splash-glow" />
                    <img
                        src={logo}
                        alt="RocketReport"
                        className="splash-logo"
                    />
                </div>

                <h1 className="splash-title">RocketReport</h1>
                <p className="splash-tagline">Generate · Automate · Deliver</p>

                <div className="splash-progress-track">
                    <div className="splash-progress-bar" />
                </div>
            </div>
        </div>
    );
};

export default SplashScreen;
