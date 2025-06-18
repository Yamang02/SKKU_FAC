import React, { createContext, useContext, useState, useEffect } from 'react';
import storage from '../utils/storage';
import { API_BASE_URL, API_ENDPOINTS, AUTH_HEADER_TYPE, STORAGE_KEYS } from '../constants/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // 앱 시작 시 저장된 토큰 확인
    useEffect(() => {
        checkStoredAuth();
    }, []);

    const checkStoredAuth = async () => {
        try {
            const [storedToken, storedUser] = await Promise.all([
                storage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
                storage.getItem(STORAGE_KEYS.USER)
            ]);

            if (storedToken && storedUser) {
                setAccessToken(storedToken);
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error('저장된 인증 정보 확인 오류:', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (loginData) => {
        try {
            setAccessToken(loginData.accessToken);
            setUser(loginData.user);

            // localStorage에 저장
            await storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, loginData.accessToken);
            await storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, loginData.refreshToken);
            await storage.setItem(STORAGE_KEYS.USER, JSON.stringify(loginData.user));

            return true;
        } catch (error) {
            console.error('로그인 처리 오류:', error);
            return false;
        }
    };

    const logout = async () => {
        try {
            // localStorage에서 제거
            await storage.multiRemove([STORAGE_KEYS.ACCESS_TOKEN, STORAGE_KEYS.REFRESH_TOKEN, STORAGE_KEYS.USER]);

            setAccessToken(null);
            setUser(null);
        } catch (error) {
            console.error('로그아웃 처리 오류:', error);
        }
    };

    const refreshToken = async () => {
        try {
            const storedRefreshToken = await storage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
            if (!storedRefreshToken) {
                await logout();
                return false;
            }

            const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.JWT_REFRESH}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken: storedRefreshToken })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                await storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.data.accessToken);
                setAccessToken(data.data.accessToken);
                return true;
            } else {
                await logout();
                return false;
            }
        } catch (error) {
            console.error('토큰 갱신 오류:', error);
            await logout();
            return false;
        }
    };

    // 관리자 토큰 검증
    const verifyAdminToken = async () => {
        try {
            if (!accessToken) {
                return false;
            }

            const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.JWT_VERIFY_ADMIN}`, {
                method: 'GET',
                headers: getAuthHeaders()
            });

            const data = await response.json();

            if (response.ok && data.success && data.data.valid && data.data.isAdmin) {
                return true;
            } else {
                // 관리자 권한이 없거나 토큰이 무효한 경우
                await logout();
                return false;
            }
        } catch (error) {
            console.error('관리자 토큰 검증 오류:', error);
            await logout();
            return false;
        }
    };

    // API 호출용 헤더 생성
    const getAuthHeaders = () => {
        if (!accessToken) return {};

        return {
            'Authorization': `${AUTH_HEADER_TYPE} ${accessToken}`,
            'Content-Type': 'application/json'
        };
    };

    // 인증된 API 호출
    const authenticatedFetch = async (url, options = {}) => {
        let headers = {
            ...getAuthHeaders(),
            ...options.headers
        };

        let response = await fetch(url, {
            ...options,
            headers
        });

        // 토큰 만료시 갱신 시도
        if (response.status === 401 && accessToken) {
            const refreshSuccess = await refreshToken();
            if (refreshSuccess) {
                headers = {
                    ...getAuthHeaders(),
                    ...options.headers
                };
                response = await fetch(url, {
                    ...options,
                    headers
                });
            }
        }

        return response;
    };

    const isAdmin = () => {
        return user?.role === 'ADMIN';
    };

    const isAuthenticated = () => {
        return !!accessToken && !!user;
    };

    const value = {
        user,
        accessToken,
        loading,
        login,
        logout,
        refreshToken,
        verifyAdminToken,
        getAuthHeaders,
        authenticatedFetch,
        isAdmin,
        isAuthenticated
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
