import commonColors from '../common/colors.js';

// 관리자 도메인 전용 색상들
export const adminColors = {
    // 공통 색상 상속
    ...commonColors,

    // Admin specific colors
    admin: {
        sidebar: '#f8fafc',
        sidebarBorder: '#e5e7eb',
        header: '#ffffff',
        active: '#eff6ff',
        activeText: '#3b82f6',
        navHover: '#f1f5f9',
        cardShadow: 'rgba(0, 0, 0, 0.1)',
    },

    // Badge colors for admin panel
    badge: {
        admin: '#dc2626',
        adminBackground: '#fef2f2',
        skku: '#059669',
        skkuBackground: '#f0fdf4',
        external: '#7c3aed',
        externalBackground: '#f5f3ff',
        active: '#059669',
        activeBackground: '#f0fdf4',
        inactive: '#6b7280',
        inactiveBackground: '#f9fafb',
        blocked: '#dc2626',
        blockedBackground: '#fef2f2',
        unverified: '#d97706',
        unverifiedBackground: '#fefbf3',
    },

    // Table colors for admin data
    table: {
        header: '#f9fafb',
        headerText: '#374151',
        stripe: '#f9fafb',
        hover: '#f3f4f6',
        border: '#e5e7eb',
    },

    // Form colors for admin forms
    form: {
        inputBorder: '#d1d5db',
        inputFocus: '#3b82f6',
        inputError: '#ef4444',
        inputBackground: '#ffffff',
        labelText: '#374151',
    }
};

export default adminColors;
