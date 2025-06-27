import { useState } from 'react';

export interface ErrorState {
    show: boolean;
    title: string;
    message: string;
    type: 'error' | 'warning';
    details?: string;
}

export const useErrorHandler = () => {
    const [error, setError] = useState<ErrorState>({
        show: false,
        title: '',
        message: '',
        type: 'error'
    });

    const showError = (
        title: string,
        message: string,
        details?: string,
        type: 'error' | 'warning' = 'error'
    ) => {
        setError({
            show: true,
            title,
            message,
            type,
            details
        });
    };

    const hideError = () => {
        setError(prev => ({ ...prev, show: false }));
    };

    const clearError = () => {
        setError({
            show: false,
            title: '',
            message: '',
            type: 'error'
        });
    };

    return {
        error,
        showError,
        hideError,
        clearError
    };
};
