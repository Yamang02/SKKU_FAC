/**
 * API 관련 상수
 */

// 기본 API URL - 개발/운영 환경에 따라 수정
export const API_BASE_URL = 'http://localhost:3000';

// API 엔드포인트들
export const API_ENDPOINTS = {
    // Auth 관련
    AUTH: {
        JWT_LOGIN: '/auth/jwt/login',
        JWT_REFRESH: '/auth/jwt/refresh',
        JWT_VERIFY: '/auth/jwt/verify',
        JWT_VERIFY_ADMIN: '/auth/jwt/verify-admin',
        JWT_LOGOUT: '/auth/jwt/logout',
    },

    // Admin API 엔드포인트들
    ADMIN: {
        USERS: '/api/admin/users',
        EXHIBITIONS: '/api/admin/exhibitions',
        ARTWORKS: '/api/admin/artworks',
    }
};

// 인증 헤더 타입
export const AUTH_HEADER_TYPE = 'Bearer';

// 토큰 스토리지 키
export const STORAGE_KEYS = {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
    USER: 'user'
};
