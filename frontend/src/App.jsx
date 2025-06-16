import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserListScreen, UserDetailScreen, DashboardScreen } from './screens';

const App = () => {
    return (
        <Router>
            <Routes>
                {/* 기본 경로를 관리자 대시보드로 리다이렉트 */}
                <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

                {/* 관리자 라우트 */}
                <Route path="/admin/dashboard" element={<DashboardScreen />} />
                <Route path="/admin/users" element={<UserListScreen />} />
                <Route path="/admin/users/:id" element={<UserDetailScreen />} />

                {/* 기타 경로들은 대시보드로 리다이렉트 */}
                <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </Routes>
        </Router>
    );
};

export default App;
