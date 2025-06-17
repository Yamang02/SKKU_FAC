import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import {
    UserListScreen,
    UserDetailScreen,
    DashboardScreen,
    ExhibitionListScreen,
    ExhibitionDetailScreen,
    ArtworkListScreen
} from './screens';

const App = () => {
    return (
        <Router>
            <Routes>
                {/* 기본 경로를 관리자 대시보드로 리다이렉트 */}
                <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

                {/* 관리자 라우트 */}
                <Route path="/admin/dashboard" element={<DashboardScreen />} />

                {/* 사용자 관리 */}
                <Route path="/admin/users" element={<UserListScreen />} />
                <Route path="/admin/users/:id" element={<UserDetailScreen />} />

                {/* 전시 관리 */}
                <Route path="/admin/exhibitions" element={<ExhibitionListScreen />} />
                <Route path="/admin/exhibitions/:id" element={<ExhibitionDetailScreen />} />

                {/* 작품 관리 */}
                <Route path="/admin/artworks" element={<ArtworkListScreen />} />

                {/* 기타 경로들은 대시보드로 리다이렉트 */}
                <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </Routes>
        </Router>
    );
};

export default App;
