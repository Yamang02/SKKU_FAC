/**
 * API 설정
 * React Native Web에서 이관된 API 엔드포인트와 관련 설정을 관리합니다.
 */

import { env } from './env';

export const API_CONFIG = {
    BASE_URL: env.VITE_API_BASE_URL,
    TIMEOUT: 10000, // 10초
    RETRY_COUNT: 3,
    RETRY_DELAY: 1000, // 1초
} as const;

export const API_ENDPOINTS = {
    // 인증 관련
    AUTH: {
        LOGIN: '/auth/login',
        LOGOUT: '/auth/logout',
        REGISTER: '/auth/register',
        REFRESH: '/auth/refresh',
        VERIFY: '/auth/verify',
        FORGOT_PASSWORD: '/auth/forgot-password',
        RESET_PASSWORD: '/auth/reset-password',
        PASSWORD_RESET_REQUEST: '/auth/password-reset/request',
        PASSWORD_RESET_CONFIRM: '/auth/password-reset/confirm',
        EMAIL_VERIFICATION_REQUEST: '/auth/email-verification/request',
        EMAIL_VERIFICATION_CONFIRM: '/auth/email-verification/confirm',
        ME: '/auth/me',
        SESSION: '/auth/session',
        ACCOUNT: '/auth/account',
        PASSWORD: '/auth/password',
        PROFILE: '/auth/profile',

        // JWT 관련
        JWT_LOGIN: '/auth/jwt/login',
        JWT_REFRESH: '/auth/jwt/refresh',
        JWT_LOGOUT: '/auth/jwt/logout',
        // 백엔드의 requireJwtAuthApi, requireJwtAdminApi 미들웨어가 자동으로 토큰 검증을 처리
    },

    // 사용자 관리
    USERS: {
        LIST: '/api/users',
        DETAIL: (id: number) => `/api/users/${id}`,
        CREATE: '/api/users',
        UPDATE: (id: number) => `/api/users/${id}`,
        DELETE: (id: number) => `/api/users/${id}`,
        PROFILE: '/api/users/profile',
    },

    // 관리자 - 사용자 관리
    ADMIN: {
        USERS: {
            LIST: '/api/admin/users',
            DETAIL: (id: number) => `/api/admin/users/${id}`,
            CREATE: '/api/admin/users',
            UPDATE: (id: number) => `/api/admin/users/${id}`,
            DELETE: (id: number) => `/api/admin/users/${id}`,
            BULK_DELETE: '/api/admin/users/bulk-delete',
        },
        ARTWORKS: {
            LIST: '/api/admin/artworks',
            DETAIL: (id: number) => `/api/admin/artworks/${id}`,
            CREATE: '/api/admin/artworks',
            UPDATE: (id: number) => `/api/admin/artworks/${id}`,
            DELETE: (id: number) => `/api/admin/artworks/${id}`,
            BULK_DELETE: '/api/admin/artworks/bulk-delete',
        },
        EXHIBITIONS: {
            LIST: '/api/admin/exhibitions',
            DETAIL: (id: number) => `/api/admin/exhibitions/${id}`,
            CREATE: '/api/admin/exhibitions',
            UPDATE: (id: number) => `/api/admin/exhibitions/${id}`,
            DELETE: (id: number) => `/api/admin/exhibitions/${id}`,
            BULK_DELETE: '/api/admin/exhibitions/bulk-delete',
        },
    },

    // 작품 관리
    ARTWORKS: {
        LIST: '/api/artworks',
        DETAIL: (id: number) => `/api/artworks/${id}`,
        CREATE: '/api/artworks',
        UPDATE: (id: number) => `/api/artworks/${id}`,
        DELETE: (id: number) => `/api/artworks/${id}`,
        BY_USER: (userId: number) => `/api/artworks/user/${userId}`,
        BY_EXHIBITION: (exhibitionId: number) => `/api/artworks/exhibition/${exhibitionId}`,
    },

    // 전시 관리
    EXHIBITIONS: {
        LIST: '/api/exhibitions',
        DETAIL: (id: number) => `/api/exhibitions/${id}`,
        CREATE: '/api/exhibitions',
        UPDATE: (id: number) => `/api/exhibitions/${id}`,
        DELETE: (id: number) => `/api/exhibitions/${id}`,
        ACTIVE: '/api/exhibitions/active',
        FEATURED: '/api/exhibitions/featured',
    },

    // 기타
    CSRF: '/csrf-token',
    HEALTH: '/health',
} as const;

export const STORAGE_KEYS = {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
    USER: 'user',
    THEME: 'theme',
    LANGUAGE: 'language',
} as const;

export const AUTH_HEADER_TYPE = 'Bearer' as const;

// 에러 코드 상수
export const ERROR_CODES = {
    CSRF_TOKEN_MISSING: 'CSRF_TOKEN_MISSING',
    CSRF_TOKEN_INVALID: 'CSRF_TOKEN_INVALID',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    NOT_FOUND: 'NOT_FOUND',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const;

// HTTP 상태 코드
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
} as const;
