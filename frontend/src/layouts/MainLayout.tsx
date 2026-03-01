import type { ReactNode } from 'react';
import Navbar from '../components/Navbar';
import './MainLayout.css';

interface MainLayoutProps {
    children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
    return (
        <div className="layout-container">
            <Navbar />
            <main className="layout-content">
                {children}
            </main>
        </div>
    );
};

export default MainLayout;
