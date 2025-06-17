/**
 * API 모듈 통합 Export
 * 도메인별로 분리된 API 구조
 */

// 공통 모듈
export * from './common/index.js';

// Admin 도메인 API
export * from './admin/index.js';

// Main 도메인 API
export * from './main/index.js';

// 하위 호환성을 위한 기본 Export (기존 방식)
// 점진적으로 새로운 구조로 마이그레이션하면서 제거 예정
export { default as UserApi } from './main/UserApi.js';
export { AuthApi } from './common/index.js';
export { default as ArtworkApi } from './main/ArtworkApi.js';

// 기존 파일들은 향후 제거 예정
// export { default as UserApi } from './UserApi.js';  // -> main/UserApi.js로 이동
// export { default as ArtworkApi } from './ArtworkApi.js';  // -> main/ArtworkApi.js로 이동
// export { default as ExhibitionApi } from './ExhibitionApi.js';  // -> main/ExhibitionApi.js로 이동
// export { default as AuthApi } from './AuthApi.js';  // -> common/AuthApi.js로 이동
