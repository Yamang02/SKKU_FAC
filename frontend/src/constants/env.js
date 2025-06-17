/**
 * 앱 설정 관리
 * 빌드 타임에 결정되는 정적 설정값들
 * 배포 환경별로 다른 설정 파일을 사용
 */

/**
 * 환경 설정 상수 - 웹 환경용
 */

// 개발 환경 감지 (웹 환경에서 hostname 기반)
export const IS_DEVELOPMENT = window.location.hostname === 'localhost';

// API 설정
export const API_CONFIG = {
    BASE_URL: IS_DEVELOPMENT ? 'http://localhost:3000' : 'https://api.skku-gallery.com',
    TIMEOUT: 30000,
    MAX_RETRIES: 3
};

// 디버그 설정
export const DEBUG_CONFIG = {
    ENABLED: IS_DEVELOPMENT,
    LOG_LEVEL: IS_DEVELOPMENT ? 'debug' : 'error'
};

// 앱 기본 정보
export const APP_CONFIG = {
    NAME: 'SKKU Gallery',
    VERSION: '1.0.0',
    DESCRIPTION: 'SKKU 순수미술동아리 갤러리',
};

// 개발 서버 설정
export const DEV_CONFIG = {
    PORT: 3003,
    HOST: 'localhost',
    GENERATE_SOURCEMAP: IS_DEVELOPMENT,
    FAST_REFRESH: IS_DEVELOPMENT,
};

// Feature Flags
export const FEATURES = {
    ADMIN_PANEL: true,
    DARK_MODE: false, // 운영환경에서만 다크모드 활성화
    PWA: false, // 운영환경에서만 PWA 활성화
};

// 외부 서비스 (운영환경에서만 활성화)
export const EXTERNAL_SERVICES = {
    GOOGLE_ANALYTICS_ID: false ? 'G-XXXXXXXXXX' : null,
    SENTRY_DSN: false ? 'https://xxxxx@xxxxx.ingest.sentry.io/xxxxx' : null,
};

// 파일 업로드 설정
export const UPLOAD_CONFIG = {
    MAX_FILE_SIZE: 10485760, // 10MB
    ALLOWED_IMAGE_TYPES: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp'
    ],
};

// UI 설정
export const UI_CONFIG = {
    THEME: 'light',
    DEFAULT_LANGUAGE: 'ko',
    ITEMS_PER_PAGE: 10,
};

// 캐시 설정
export const CACHE_CONFIG = {
    ENABLED: true,
    DURATION: IS_DEVELOPMENT ? 300000 : 600000, // 개발: 5분, 운영: 10분
};

// 환경별 조건부 설정
export const IS_PRODUCTION = !IS_DEVELOPMENT;
export const IS_TEST = false;

// 전체 설정 객체 (하위 호환성)
export const ENV = {
    ...APP_CONFIG,
    API: API_CONFIG,
    DEV: DEV_CONFIG,
    DEBUG: DEBUG_CONFIG,
    FEATURES,
    EXTERNAL: EXTERNAL_SERVICES,
    UPLOAD: UPLOAD_CONFIG,
    UI: UI_CONFIG,
    CACHE: CACHE_CONFIG,
};

export default ENV;
