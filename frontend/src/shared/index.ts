/**
 * Shared 모듈 통합 Export
 * 애플리케이션 공통 모듈들
 */

// API 관련 (새로운 구조)
export { api, BaseApi } from './api';
export type { ApiResponse } from './api/types';

// 설정
export * from './config';

// 타입 (global types만 export)
export type {
    UserRole,
    UserStatus,
    ArtworkStatus,
    ExhibitionStatus,
    BaseEntity,
    AppError,
    LoadingState
} from './types/global.types';

// 유틸리티
export { default as storage } from './utils/storage';
export { csrfManager } from './utils/csrfManager';
export { showSuccessMessage, showErrorMessage, showInfoMessage, showWarningMessage } from './utils/notification';

// 컨텍스트
export * from './contexts/AuthContext';
