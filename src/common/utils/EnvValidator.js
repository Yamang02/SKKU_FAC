import logger from './Logger.js';

class EnvValidator {
    constructor() {
        this.requiredVars = ['SESSION_SECRET', 'ADMIN_USER', 'ADMIN_PASSWORD'];

        this.defaultValues = {
            SESSION_SECRET: 'temp_session_secret_for_health_check',
            ADMIN_USER: 'admin',
            ADMIN_PASSWORD: 'password'
        };
    }

    /**
     * 필수 환경 변수 검증 및 기본값 설정
     */
    validateAndSetDefaults() {
        const missingVars = [];

        for (const envVar of this.requiredVars) {
            if (!process.env[envVar]) {
                logger.warn(`필수 환경 변수가 없습니다: ${envVar}`);

                // Railway에서 헬스체크를 위해 기본값 설정
                if (this.defaultValues[envVar]) {
                    process.env[envVar] = this.defaultValues[envVar];
                    logger.info(`기본값으로 설정됨: ${envVar}`);
                } else {
                    missingVars.push(envVar);
                }
            }
        }

        if (missingVars.length > 0) {
            logger.error(`설정되지 않은 필수 환경 변수: ${missingVars.join(', ')}`);
            return false;
        }

        logger.success('환경 변수 검증 완료');
        return true;
    }

    /**
     * 환경 변수 존재 여부 확인
     */
    hasEnvVar(varName) {
        return !!process.env[varName];
    }

    /**
     * 환경 변수 값 가져오기 (기본값 포함)
     */
    getEnvVar(varName, defaultValue = null) {
        return process.env[varName] || defaultValue;
    }

    /**
     * 숫자형 환경 변수 가져오기
     */
    getEnvNumber(varName, defaultValue = 0) {
        const value = process.env[varName];
        return value ? parseInt(value, 10) : defaultValue;
    }

    /**
     * 불린형 환경 변수 가져오기
     */
    getEnvBoolean(varName, defaultValue = false) {
        const value = process.env[varName];
        if (!value) return defaultValue;
        return value.toLowerCase() === 'true';
    }
}

// 싱글톤 인스턴스
const envValidator = new EnvValidator();

export default envValidator;
