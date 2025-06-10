/**
 * 🔧 설정 관리 진입점
 */
import Config from './Config.js';

// Config 인스턴스 생성
const config = Config.getInstance();

console.log(`✅ 설정 로드 완료 (환경: ${config.getEnvironment()})`);

// 개발 환경에서만 설정 정보 출력
if (config.isDevelopment()) {
    config.logConfigInfo();
}

// 개별 설정 내보내기
export const databaseConfig = config.getDatabaseConfig();
export const storageConfig = config.getStorageConfig();
export const sessionConfig = config.getSessionConfig();
export const emailConfig = config.getEmailConfig();
export const redisConfig = config.getRedisConfig();
export const jwtConfig = config.getJwtConfig();
export const appConfig = config.getAppConfig();

// 기본 내보내기
export default config;
