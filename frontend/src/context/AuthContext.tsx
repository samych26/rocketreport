import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from '../services/api';

interface User {
    id: string;
    email: string;
    name?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: any) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => Promise<void>;
    loginWithUser: (user: User) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check auth status on initial load by hitting the /me endpoint
    // This verifies if the HttpOnly cookie is present and valid
    const checkAuth = async () => {
        try {
            const response = await api.get('/auth/me');
            if (response.data?.user) {
                setUser(response.data.user);
            }
        } catch (error) {
            // User is not authenticated or token expired, that's fine.
            console.log('Not authenticated on load');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (credentials: any) => {
        // 1. Send login request to backend, which sets the HttpOnly cookie
        const response = await api.post('/auth/login', credentials);
        // 2. Set user directly from login response (avoids a round-trip to /me)
        if (response.data?.user) {
            setUser(response.data.user);
            setIsLoading(false);
        } else {
            // Fallback: fetch user details using the newly set cookie
            await checkAuth();
        }
    };

    const register = async (data: any) => {
        await api.post('/auth/register', data);
        // Do NOT auto-login — user must verify their email first
    };

    const loginWithUser = (userData: User) => {
        setUser(userData);
        setIsLoading(false);
    };

    const logout = async () => {
        try {
            // 1. Tell backend to clear the HttpOnly cookie
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout failed on backend, clearing local state anyway', error);
        } finally {
            // 2. Clear frontend state
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isLoading,
            login,
            register,
            logout,
            loginWithUser,
        }}>
            {children}
        </AuthContext.Provider>
    );
};
