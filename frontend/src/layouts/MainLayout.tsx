import type { ReactNode } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import './MainLayout.css';

interface MainLayoutProps {
    children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
    return (
        <div className="app-shell">
            <Sidebar />
            <div className="main-area">
                <Navbar />
                <main className="main-content">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
