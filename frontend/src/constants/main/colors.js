import commonColors from '../common/colors.js';

// 메인 갤러리 도메인 전용 색상들
export const mainColors = {
    // 공통 색상 상속
    ...commonColors,

    // Gallery specific colors
    gallery: {
        // 갤러리 헤더/네비게이션
        header: '#ffffff',
        headerText: '#111827',
        headerBorder: '#e5e7eb',

        // 갤러리 카드/작품 표시
        cardBackground: '#ffffff',
        cardBorder: '#e5e7eb',
        cardHover: '#f9fafb',
        cardShadow: 'rgba(0, 0, 0, 0.08)',

        // 갤러리 오버레이
        overlay: 'rgba(0, 0, 0, 0.7)',
        overlayText: '#ffffff',

        // 갤러리 필터/카테고리
        filterActive: '#3b82f6',
        filterInactive: '#6b7280',
        filterBackground: '#f3f4f6',
    },

    // Exhibition specific colors
    exhibition: {
        featured: '#7c3aed',
        featuredBackground: '#f5f3ff',
        upcoming: '#059669',
        upcomingBackground: '#f0fdf4',
        ongoing: '#f59e0b',
        ongoingBackground: '#fefbf3',
        ended: '#6b7280',
        endedBackground: '#f9fafb',
    },

    // Artwork category colors
    artwork: {
        painting: '#ef4444',
        paintingBackground: '#fef2f2',
        sculpture: '#8b5cf6',
        sculptureBackground: '#f5f3ff',
        photography: '#06b6d4',
        photographyBackground: '#f0fdfa',
        digital: '#f59e0b',
        digitalBackground: '#fefbf3',
        mixed: '#6b7280',
        mixedBackground: '#f9fafb',
    },

    // User interaction colors for main site
    interaction: {
        like: '#ef4444',
        likeBackground: '#fef2f2',
        bookmark: '#f59e0b',
        bookmarkBackground: '#fefbf3',
        share: '#06b6d4',
        shareBackground: '#f0fdfa',
    }
};

export default mainColors;
