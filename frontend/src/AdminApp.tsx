import React, { useEffect } from 'react';
import { ConfigProvider, Spin } from 'antd';
import koKR from 'antd/locale/ko_KR';

import { AuthProvider, useAuth } from './shared/contexts/AuthContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { AdminLoginForm } from './components/auth/AdminLoginForm';
import { AdminLayout, type AdminPage } from './components/layout/AdminLayout';
import { Dashboard } from './components/domain/Dashboard';
import { UserManagement } from './components/domain/UserManagement';
import { useAdminNavigation } from './hooks/useAdminNavigation';
import BaseApi from './shared/api/BaseApi';

// 추후 구현할 컴포넌트들의 placeholder
const ArtworkManagement = () => <div>작품 관리 - 구현 예정</div>;
const ExhibitionManagement = () => <div>전시 관리 - 구현 예정</div>;

const AdminContent: React.FC = () => {
    const authContext = useAuth();
    const { isAuthenticated, isAdmin, loading } = authContext;
    const { currentPage, navigateTo } = useAdminNavigation();

    // BaseApi에 AuthContext 설정 - 인증된 상태에서만
    useEffect(() => {
        if (authContext.isAuthenticated() && authContext.accessToken) {
            BaseApi.setAuthContext(authContext);
        }
    }, [authContext]);

    // 로딩 중일 때 스피너 표시
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                <Spin size="large" />
            </div>
        );
    }

    // 로그인되지 않았거나 관리자가 아닌 경우 로그인 화면 표시
    if (!isAuthenticated() || !isAdmin()) {
        return <AdminLoginForm />;
    }

    const getSelectedMenuKey = (page: AdminPage): string => {
        const keyMap: Record<AdminPage, string> = {
            'dashboard': '1',
            'users': '2',
            'artworks': '3',
            'exhibitions': '4',
        };
        return keyMap[page];
    };

    const renderPageContent = () => {
        switch (currentPage) {
            case 'dashboard':
                return <Dashboard />;
            case 'users':
                return <UserManagement />;
            case 'artworks':
                return <ArtworkManagement />;
            case 'exhibitions':
                return <ExhibitionManagement />;
            default:
                return <Dashboard />;
        }
    };

    return (
        <AdminLayout
            selectedMenuKey={getSelectedMenuKey(currentPage)}
            onMenuClick={navigateTo}
        >
            {renderPageContent()}
        </AdminLayout>
    );
};

const AdminApp: React.FC = () => {
    return (
        <ConfigProvider locale={koKR}>
            <AuthProvider>
                <ErrorBoundary>
                    <AdminContent />
                </ErrorBoundary>
            </AuthProvider>
        </ConfigProvider>
    );
};

export default AdminApp;
