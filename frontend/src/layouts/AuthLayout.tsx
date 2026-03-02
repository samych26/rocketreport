import type { ReactNode } from 'react';
import Navbar from '../components/Navbar';
import './AuthLayout.css';

interface AuthLayoutProps {
    children: ReactNode;
    illustration?: 'rocket' | 'files' | 'nodes';
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
    return (
        <div className="auth-layout">
            <Navbar />
            <div className="auth-center">
                <div className="auth-form-container">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
