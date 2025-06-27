/**
 * 사용자 역할 상수
 * 데이터베이스 스키마와 일치: enum('ADMIN','SKKU_MEMBER','EXTERNAL_MEMBER')
 */
export const USER_ROLES = {
    ADMIN: 'ADMIN',
    SKKU_MEMBER: 'SKKU_MEMBER',
    EXTERNAL_MEMBER: 'EXTERNAL_MEMBER'
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

/**
 * 권한 체크 유틸리티 함수들
 */
export const isAdmin = (role?: string): boolean => {
    return role === USER_ROLES.ADMIN;
};

export const isSkkuMember = (role?: string): boolean => {
    return role === USER_ROLES.SKKU_MEMBER;
};

export const isExternalMember = (role?: string): boolean => {
    return role === USER_ROLES.EXTERNAL_MEMBER;
};

/**
 * 사용자 역할 표시명
 */
export const USER_ROLE_LABELS = {
    [USER_ROLES.ADMIN]: '관리자',
    [USER_ROLES.SKKU_MEMBER]: '성균관대 재학/졸업생',
    [USER_ROLES.EXTERNAL_MEMBER]: '외부 인원'
} as const;
