// 공통 상수들
export { colors, default as Colors } from './colors.js';
export { sizes, default as Sizes } from './sizes.js';

// 환경 변수 설정
export * from './env.js';

// 하위 호환성을 위한 기존 상수들 (deprecated)
export const API_BASE_URL = 'http://localhost:3000'; // deprecated: use API_CONFIG.BASE_URL
export const APP_NAME = 'SKKU Gallery'; // deprecated: use APP_CONFIG.NAME
export const APP_VERSION = '1.0.0'; // deprecated: use APP_CONFIG.VERSION

// 공통 색상
export { default as commonColors } from './common/colors.js';

// 도메인별 색상
export { default as adminColors } from './admin/colors.js';
export { default as mainColors } from './main/colors.js';

// 도메인별 상수들
// Admin 도메인
export * from './admin/index.js';

// Main 도메인 (향후 구현)
// export * from './main/index.js';
