import React from 'react';
import { AdminLayout, AdminDashboard } from '../../components/admin';

const DashboardScreen = () => {
    return (
        <AdminLayout title="관리자 대시보드">
            <AdminDashboard />
        </AdminLayout>
    );
};

export default DashboardScreen;
