import React from 'react';
import { ConfigProvider } from 'antd';
import { AuthProvider, useAuth } from '../../shared/contexts/AuthContext';
import AdminLoginForm from './components/AdminLoginForm';
import { AdminLayout } from './components/layout/AdminLayout';
import { AdminDashboard } from './components/domain/Dashboard';
// import { AdminRoutes } from './routes';
// import './styles/globals.css';

const AdminContent: React.FC = () => {
    const { isAuthenticated, isAdmin, loading } = useAuth();

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

    // 인증된 관리자인 경우 대시보드 표시
    return (
        <AdminLayout>
            <AdminDashboard />
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
