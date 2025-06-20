import { useState } from 'react';

export type AdminPage = 'dashboard' | 'users' | 'artworks' | 'exhibitions';

export const useAdminNavigation = () => {
    const [currentPage, setCurrentPage] = useState<AdminPage>('dashboard');

    const navigateTo = (page: AdminPage) => {
        setCurrentPage(page);
    };

    const getBreadcrumbItems = (page: AdminPage) => {
        const breadcrumbMap = {
            dashboard: [{ title: '관리자' }, { title: '대시보드' }],
            users: [{ title: '관리자' }, { title: '회원 관리' }],
            artworks: [{ title: '관리자' }, { title: '작품 관리' }],
            exhibitions: [{ title: '관리자' }, { title: '전시 관리' }],
        };

        return breadcrumbMap[page];
    };

    const getPageTitle = (page: AdminPage) => {
        const titleMap = {
            dashboard: '대시보드',
            users: '사용자 관리',
            artworks: '작품 관리',
            exhibitions: '전시 관리',
        };

        return titleMap[page];
    };

    return {
        currentPage,
        navigateTo,
        getBreadcrumbItems,
        getPageTitle,
    };
};
