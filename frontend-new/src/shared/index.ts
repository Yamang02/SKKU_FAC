/**
 * Shared 모듈 통합 Export
 * React Native Web에서 이관된 공통 모듈들
 */

// API 관련
export { default as BaseApi } from './api/BaseApi';
export { default as AuthApi } from './api/AuthApi';

// 설정
export * from './config';

// 타입 (중복 방지를 위해 명시적 export)
export type { UserRole } from './types';

// 유틸리티
export { default as storage } from './utils/storage';
export { default as api } from './utils/api';
export type { ApiResponse, ApiError } from './utils/api';
export { default as csrfManager } from './utils/csrfManager';
export { showSuccessMessage, showErrorMessage, showInfoMessage, showWarningMessage } from './utils/notification';

// 컨텍스트
export * from './contexts/AuthContext';
