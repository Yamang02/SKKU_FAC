/**
 * 환경변수 관리
 * 타입 안전한 환경변수 접근을 제공합니다.
 */

// 환경변수 타입 정의
interface EnvConfig {
    NODE_ENV: 'development' | 'production' | 'test';
    VITE_API_BASE_URL: string;
    VITE_APP_TITLE: string;
    DEV: boolean;
    PROD: boolean;
}

// 환경변수 검증 및 기본값 설정
const createEnvConfig = (): EnvConfig => {
    const nodeEnv = import.meta.env.NODE_ENV || 'development';

    return {
        NODE_ENV: nodeEnv as EnvConfig['NODE_ENV'],
        VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
        VITE_APP_TITLE: import.meta.env.VITE_APP_TITLE || 'SKKU Gallery',
        DEV: nodeEnv === 'development',
        PROD: nodeEnv === 'production',
    };
};

// 환경변수 객체 생성
export const env = createEnvConfig();

// 개발/프로덕션 환경 확인 유틸리티
export const isDev = env.DEV;
export const isProd = env.PROD;

// 환경변수 검증
export const validateEnv = (): void => {
    const required = ['VITE_API_BASE_URL'];

    for (const key of required) {
        if (!import.meta.env[key]) {
            throw new Error(`Missing required environment variable: ${key}`);
        }
    }
};

export default env;
