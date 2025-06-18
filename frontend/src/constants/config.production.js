/**
 * 운영환경 설정 오버라이드
 * 이 파일의 설정들이 기본 설정을 덮어씁니다
 */

export const PRODUCTION_CONFIG = {
    // API 설정
    API: {
        BASE_URL: 'https://api.skku-gallery.com',
        TIMEOUT: 15000,
    },

    // 디버그 설정
    DEBUG: {
        ENABLED: false,
        LOG_LEVEL: 'error',
        PERFORMANCE_MONITORING: true,
    },

    // Feature Flags
    FEATURES: {
        ADMIN_PANEL: true,
        DARK_MODE: true,
        PWA: true,
    },

    // 외부 서비스
    EXTERNAL: {
        GOOGLE_ANALYTICS_ID: 'G-XXXXXXXXXX', // 실제 운영 GA ID로 변경
        SENTRY_DSN: 'https://xxxxx@xxxxx.ingest.sentry.io/xxxxx', // 실제 Sentry DSN으로 변경
    },

    // 캐시 설정
    CACHE: {
        ENABLED: true,
        DURATION: 600000, // 10분
    },
};

export default PRODUCTION_CONFIG;
