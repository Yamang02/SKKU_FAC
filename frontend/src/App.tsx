import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminApp from './apps/admin/App';
import MainApp from './apps/main/App';
import { NotFound } from './shared/components/NotFound';

const App: React.FC = () => {
    return (
        <Routes>
            {/* Admin 앱 - 완전 분리된 라우팅 */}
            <Route path="/admin/*" element={<AdminApp />} />

            {/* Main 앱 - 추후 구현 */}
            <Route path="/main/*" element={<MainApp />} />
            <Route path="/*" element={<MainApp />} /> {/* 기본 경로 */}

            {/* 404 처리 */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default App;
