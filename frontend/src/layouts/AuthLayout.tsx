import type { ReactNode } from 'react';
import Navbar from '../components/Navbar';
import './AuthLayout.css';

interface AuthLayoutProps {
    children: ReactNode;
    illustration?: 'rocket' | 'files' | 'nodes';
}

const AuthLayout = ({ children, illustration = 'rocket' }: AuthLayoutProps) => {
    return (
        <div className="auth-layout">
            {/* We keep the Navbar so user can switch language/theme easily */}
            <Navbar />

            <div className="auth-container">
                {/* Left side: Premium Branding Illusion */}
                <div className={`auth-branding auth-branding-${illustration}`}>
                    <div className="auth-branding-content">
                        <h2 className="auth-branding-title">RocketReport</h2>
                        <p className="auth-branding-subtitle">
                            L'avenir du reporting automatisé, accessible dès aujourd'hui.
                        </p>
                    </div>
                    <div className="auth-shapes">
                        <div className="shape shape-1"></div>
                        <div className="shape shape-2"></div>
                        <div className="shape shape-3"></div>
                    </div>
                </div>

                {/* Right side: The form */}
                <div className="auth-form-wrapper">
                    <div className="auth-form-container">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
