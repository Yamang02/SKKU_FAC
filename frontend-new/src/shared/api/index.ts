/**
 * API 모듈 통합 Export - TypeScript 버전
 * 도메인별로 분리된 API 구조
 */

// 공통 모듈
export { default as BaseApi } from './BaseApi';
export type { PaginationParams, FilterParams, ListResponse } from './BaseApi';

// 인증 API
export { default as AuthApi } from './AuthApi';
export type {
    LoginCredentials,
    RegisterData,
    User,
    AuthResponse,
    SessionResponse
} from './AuthApi';

// API 유틸리티
export { api, ApiError } from '../utils/api';
export type { ApiResponse, RequestOptions } from '../utils/api';

// 설정
export * from '../config/api.config';

// 유틸리티
export * from '../utils/notification';
export { csrfManager } from '../utils/csrfManager';
