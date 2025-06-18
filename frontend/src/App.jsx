import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import BaseApi from './api/common/BaseApi';
import AdminLoginForm from './components/auth/AdminLoginForm';
import {
    UserListScreen,
    UserDetailScreen,
    DashboardScreen,
    ExhibitionListScreen,
    ExhibitionDetailScreen,
    ArtworkListScreen
} from './screens';

// 보호된 라우트 컴포넌트
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isAdmin, verifyAdminToken, loading } = useAuth();
    const [adminVerified, setAdminVerified] = useState(null);

    useEffect(() => {
        const checkAdminAccess = async () => {
            if (isAuthenticated() && isAdmin()) {
                const isValid = await verifyAdminToken();
                setAdminVerified(isValid);
            } else {
                setAdminVerified(false);
            }
        };

        checkAdminAccess();
    }, [isAuthenticated, isAdmin, verifyAdminToken]);

    if (loading || adminVerified === null) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div>관리자 권한 확인 중...</div>
            </div>
        );
    }

    if (!isAuthenticated() || !isAdmin() || !adminVerified) {
        return <LoginScreen />;
    }

    return children;
};

// 로그인 화면 컴포넌트
const LoginScreen = () => {
    const { login } = useAuth();

    const handleLoginSuccess = async (loginData) => {
        await login(loginData);
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center' }}>
            <AdminLoginForm onLoginSuccess={handleLoginSuccess} />
        </div>
    );
};

// 앱 라우트 컴포넌트
const AppRoutes = () => {
    const authContext = useAuth();

    // BaseApi에 AuthContext 설정
    useEffect(() => {
        BaseApi.setAuthContext(authContext);
    }, [authContext]);

    return (
        <Routes>
            {/* 보호된 관리자 라우트들 */}
            <Route path="/" element={
                <ProtectedRoute>
                    <Navigate to="/admin/dashboard" replace />
                </ProtectedRoute>
            } />

            <Route path="/admin/dashboard" element={
                <ProtectedRoute>
                    <DashboardScreen />
                </ProtectedRoute>
            } />

            {/* 사용자 관리 */}
            <Route path="/admin/users" element={
                <ProtectedRoute>
                    <UserListScreen />
                </ProtectedRoute>
            } />
            <Route path="/admin/users/:id" element={
                <ProtectedRoute>
                    <UserDetailScreen />
                </ProtectedRoute>
            } />

            {/* 전시 관리 */}
            <Route path="/admin/exhibitions" element={
                <ProtectedRoute>
                    <ExhibitionListScreen />
                </ProtectedRoute>
            } />
            <Route path="/admin/exhibitions/:id" element={
                <ProtectedRoute>
                    <ExhibitionDetailScreen />
                </ProtectedRoute>
            } />

            {/* 작품 관리 */}
            <Route path="/admin/artworks" element={
                <ProtectedRoute>
                    <ArtworkListScreen />
                </ProtectedRoute>
            } />

            {/* 기타 경로들은 대시보드로 리다이렉트 */}
            <Route path="*" element={
                <ProtectedRoute>
                    <Navigate to="/admin/dashboard" replace />
                </ProtectedRoute>
            } />
        </Routes>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <AppRoutes />
            </Router>
        </AuthProvider>
    );
};

export default App;
