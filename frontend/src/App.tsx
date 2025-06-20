import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminApp from './AdminApp';
import { NotFound } from './shared/components/NotFound';

const App: React.FC = () => {
    return (
        <Routes>
            {/* Admin 앱 - 새로운 구조 */}
            <Route path="/admin/*" element={<AdminApp />} />

            {/* 기본 경로는 admin으로 리다이렉트 (Admin 전용 프로젝트) */}
            <Route path="/" element={<Navigate to="/admin" replace />} />

            {/* 404 처리 */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default App;
