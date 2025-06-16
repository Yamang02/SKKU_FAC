import React, { createContext, useContext, useState, useCallback } from 'react';
import { Alert, Platform } from 'react-native';

export interface NotificationConfig {
    duration?: number;
    position?: 'top' | 'bottom' | 'center';
}

export interface ConfirmOptions {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
}

export interface NotificationContextType {
    showSuccess: (message: string, config?: NotificationConfig) => void;
    showError: (message: string, config?: NotificationConfig) => void;
    showConfirm: (options: ConfirmOptions) => Promise<boolean>;
    showLoading: (isLoading: boolean, message?: string) => void;
    isLoading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

interface NotificationProviderProps {
    children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('처리 중입니다...');

    const showSuccess = useCallback((message: string, config?: NotificationConfig) => {
        if (Platform.OS === 'web') {
            // Web에서는 브라우저 알림 또는 커스텀 토스트 사용
            console.log('Success:', message);
            // TODO: 웹용 토스트 컴포넌트 구현
        } else {
            // 모바일에서는 Alert 사용
            Alert.alert('성공', message);
        }
    }, []);

    const showError = useCallback((message: string, config?: NotificationConfig) => {
        if (Platform.OS === 'web') {
            // Web에서는 브라우저 알림 또는 커스텀 토스트 사용
            console.error('Error:', message);
            // TODO: 웹용 토스트 컴포넌트 구현
        } else {
            // 모바일에서는 Alert 사용
            Alert.alert('오류', message);
        }
    }, []);

    const showConfirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            const { title = '확인', message, confirmText = '확인', cancelText = '취소' } = options;

            if (Platform.OS === 'web') {
                // Web에서는 브라우저 confirm 또는 커스텀 모달 사용
                const result = window.confirm(`${title}\n\n${message}`);
                resolve(result);
            } else {
                // 모바일에서는 Alert.alert 사용
                Alert.alert(
                    title,
                    message,
                    [
                        {
                            text: cancelText,
                            style: 'cancel',
                            onPress: () => resolve(false),
                        },
                        {
                            text: confirmText,
                            style: 'default',
                            onPress: () => resolve(true),
                        },
                    ],
                    { cancelable: true, onDismiss: () => resolve(false) }
                );
            }
        });
    }, []);

    const showLoading = useCallback((loading: boolean, message?: string) => {
        setIsLoading(loading);
        if (message) {
            setLoadingMessage(message);
        }
    }, []);

    const value: NotificationContextType = {
        showSuccess,
        showError,
        showConfirm,
        showLoading,
        isLoading,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export default NotificationContext;
