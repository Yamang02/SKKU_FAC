import React, { createContext, useContext } from 'react';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import type { ErrorState } from '../../hooks/useErrorHandler';

interface AdminErrorContextType {
    error: ErrorState;
    showError: (title: string, message: string, details?: string, type?: 'error' | 'warning') => void;
    hideError: () => void;
    clearError: () => void;
}

const AdminErrorContext = createContext<AdminErrorContextType | undefined>(undefined);

export const AdminErrorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const errorHandler = useErrorHandler();

    return (
        <AdminErrorContext.Provider value={errorHandler}>
            {children}
        </AdminErrorContext.Provider>
    );
};

export const useAdminError = () => {
    const context = useContext(AdminErrorContext);
    if (context === undefined) {
        throw new Error('useAdminError must be used within an AdminErrorProvider');
    }
    return context;
};
