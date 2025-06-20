import React from 'react';
import { ConfigProvider } from 'antd';
// import { MainLayout } from './components/layout/MainLayout';
// import { mainTheme } from './styles/themes/main-theme';
// import { MainRoutes } from './routes';
// import './styles/globals.css';

const MainApp: React.FC = () => {
    return (
        <ConfigProvider>
            <div style={{ padding: '20px' }}>
                <h1>🌐 Main App</h1>
                <p>메인 갤러리 애플리케이션 (추후 구현 예정)</p>
                <p>현재는 백엔드 EJS 템플릿이 처리합니다.</p>
                {/* <MainLayout>
          <MainRoutes />
        </MainLayout> */}
            </div>
        </ConfigProvider>
    );
};

export default MainApp;
