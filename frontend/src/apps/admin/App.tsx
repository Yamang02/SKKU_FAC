import React from 'react';
import { ConfigProvider } from 'antd';
import { AuthProvider, useAuth } from '../../shared/contexts/AuthContext';
import AdminLoginForm from './components/AdminLoginForm';
import { AdminLayout } from './components/layout/AdminLayout';
import { AdminDashboard } from './components/domain/Dashboard';
import { UserManagement } from './components/domain/UserManagement';
import { useAdminNavigation } from './hooks/useAdminNavigation';
// import { AdminRoutes } from './routes';
// import './styles/globals.css';

const AdminContent: React.FC = () => {
    const { isAuthenticated, isAdmin, loading } = useAuth();
    const { currentPage, navigateTo, getBreadcrumbItems } = useAdminNavigation();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                로딩 중...
            </div>
        );
    }

    // 로그인되지 않았거나 관리자가 아닌 경우 로그인 화면 표시
    if (!isAuthenticated() || !isAdmin()) {
        return <AdminLoginForm />;
    }

    // 현재 페이지에 따른 컴포넌트 렌더링
    const renderCurrentPage = () => {
        switch (currentPage) {
            case 'dashboard':
                return <AdminDashboard />;
            case 'users':
                return <UserManagement />;
            case 'artworks':
                return <div>작품 관리 페이지 (준비 중)</div>;
            case 'exhibitions':
                return <div>전시 관리 페이지 (준비 중)</div>;
            default:
                return <AdminDashboard />;
        }
    };

    // 메뉴 키 매핑
    const getMenuKey = (page: string) => {
        const keyMap: Record<string, string> = {
            'dashboard': '1',
            'users': '2',
            'artworks': '3',
            'exhibitions': '4',
        };
        return keyMap[page] || '1';
    };

    // 인증된 관리자인 경우 레이아웃과 함께 현재 페이지 표시
    return (
        <AdminLayout
            breadcrumbItems={getBreadcrumbItems(currentPage)}
            selectedMenuKey={getMenuKey(currentPage)}
            onMenuClick={navigateTo}
        >
            {renderCurrentPage()}
        </AdminLayout>
    );
};

const AdminApp: React.FC = () => {
    return (
        <ConfigProvider>
            <AuthProvider>
                <AdminContent />
            </AuthProvider>
        </ConfigProvider>
    );
};

export default AdminApp;
