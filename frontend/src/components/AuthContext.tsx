// AuthContext.js

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the types for the context
type AuthContextType = {
    authResult: any; // Replace 'any' with the actual type of your authentication result
    setAuth: (result: any) => void; // Replace 'any' with the actual type of your authentication result
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [authResult, setAuthResult] = useState<any | null>(null);

    const setAuth = (result: any) => {
        setAuthResult(result);
    };

    return (
        <AuthContext.Provider value={{ authResult, setAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
