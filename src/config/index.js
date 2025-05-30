import Config from './Config.js';

// Config 인스턴스 생성
const config = Config.getInstance();

// 환경별 설정을 비동기적으로 로드
if (config.hasEnvironmentConfig) {
    config.loadEnvironmentOverridesAsync().catch(error => {
        console.error('환경별 설정 로드 실패:', error.message);
    });
}

// 설정 유효성 검사
if (!config.isValid()) {
    console.error('❌ Config 설정이 유효하지 않습니다!');
    if (config.getEnvironment() === 'production') {
        process.exit(1);
    }
}

// 개발 환경에서 설정 정보 출력
if (config.getEnvironment() === 'development') {
    config.logConfigInfo();
}

// 개별 설정 내보내기 (기존 코드와의 호환성)
export const databaseConfig = config.get('database');
export const storageConfig = config.get('storage');
export const securityConfig = config.get('security');
export const sessionConfig = config.get('session');
export const loggingConfig = config.get('logging');
export const emailConfig = config.get('email');
export const rateLimitConfig = config.get('rateLimit');

// 기본 내보내기
export default config;
