// Admin 도메인 전용 상수들

// Admin 라우트 경로
export const ADMIN_ROUTES = {
    DASHBOARD: '/admin',
    USERS: '/admin/users',
    USER_DETAIL: '/admin/users/:id',
    EXHIBITIONS: '/admin/exhibitions',
    EXHIBITION_DETAIL: '/admin/exhibitions/:id',
    ARTWORKS: '/admin/artworks',
    ARTWORK_DETAIL: '/admin/artworks/:id',
    SETTINGS: '/admin/settings',
};

// Admin 메뉴 구성
export const ADMIN_MENU_ITEMS = [
    {
        key: 'dashboard',
        label: '대시보드',
        icon: 'dashboard',
        path: ADMIN_ROUTES.DASHBOARD,
    },
    {
        key: 'users',
        label: '회원 관리',
        icon: 'users',
        path: ADMIN_ROUTES.USERS,
    },
    {
        key: 'exhibitions',
        label: '전시 관리',
        icon: 'exhibition',
        path: ADMIN_ROUTES.EXHIBITIONS,
    },
    {
        key: 'artworks',
        label: '작품 관리',
        icon: 'artworks',
        path: ADMIN_ROUTES.ARTWORKS,
    },
    {
        key: 'settings',
        label: '설정',
        icon: 'settings',
        path: ADMIN_ROUTES.SETTINGS,
    },
];

// Admin 권한 레벨
export const ADMIN_PERMISSIONS = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    ADMIN: 'ADMIN',
    MODERATOR: 'MODERATOR',
};

// 사용자 상태
export const USER_STATUS = {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    BLOCKED: 'BLOCKED',
    UNVERIFIED: 'UNVERIFIED',
};

// 사용자 역할
export const USER_ROLES = {
    ADMIN: 'ADMIN',
    SKKU_MEMBER: 'SKKU_MEMBER',
    EXTERNAL_MEMBER: 'EXTERNAL_MEMBER',
};

// 사용자 상태 표시명
export const USER_STATUS_LABELS = {
    [USER_STATUS.ACTIVE]: '활성',
    [USER_STATUS.INACTIVE]: '비활성',
    [USER_STATUS.BLOCKED]: '차단',
    [USER_STATUS.UNVERIFIED]: '미인증',
};

// 사용자 역할 표시명
export const USER_ROLE_LABELS = {
    [USER_ROLES.ADMIN]: '관리자',
    [USER_ROLES.SKKU_MEMBER]: '성균관대 구성원',
    [USER_ROLES.EXTERNAL_MEMBER]: '외부인',
};
