import path from 'path';
import { fileURLToPath } from 'url';
import Joi from 'joi';
import dotenv from 'dotenv';
import environmentManager from './EnvironmentManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 환경변수 로드 - 환경에 따라 적절한 파일 선택
const loadEnvironmentFile = () => {
    // Railway 환경에서는 환경변수가 이미 설정되어 있으므로 파일 로드 불필요
    if (process.env.RAILWAY_ENVIRONMENT) {
        console.log('🚂 Railway 환경 감지 - 환경변수 파일 로드 생략');
        return;
    }

    // Docker 환경 또는 로컬 환경에서 .env.docker 또는 .env 파일 시도
    const envFiles = ['.env.docker', '.env'];

    for (const envFile of envFiles) {
        const envPath = path.resolve(process.cwd(), envFile);
        try {
            const result = dotenv.config({ path: envPath });
            if (!result.error) {
                console.log(`🔧 환경변수 파일 로드: ${envPath}`);
                return;
            }
        } catch (error) {
            // 파일이 없으면 다음 파일 시도
        }
    }

    console.log('⚠️ 환경변수 파일을 찾을 수 없습니다. 시스템 환경변수를 사용합니다.');
};

loadEnvironmentFile();

console.log(`🌍 NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);
console.log(`📦 현재 작업 디렉토리: ${process.cwd()}`);

class Config {
    constructor() {
        this.config = {};
        this.environment = environmentManager.getEnvironment();
        this.hasEnvironmentConfig = true;
        this.validationSchema = this.createValidationSchema();

        this.loadEnvironmentVariables();
        this.validateCriticalEnvironmentVariables();
        this.loadConfigFromEnvironmentManager();
        this.validate();
    }


    createValidationSchema() {
        return Joi.object({
            port: Joi.number().port().default(3000),
            database: Joi.object({
                host: Joi.string().required(),
                port: Joi.number().port().default(3306),
                database: Joi.string().required(),
                username: Joi.string().required(),
                password: Joi.string().required()
            }).required(),
            session: Joi.object({
                secret: Joi.string().required(),
                maxAge: Joi.number().default(1800000)
            }).required(),
            storage: Joi.object({
                type: Joi.string().valid('local', 'cloudinary').default('local'),
                uploadPath: Joi.string().default('./uploads'),
                maxFileSize: Joi.number().default(5 * 1024 * 1024),
                cloudinary: Joi.object({
                    cloudName: Joi.string().allow(''),
                    apiKey: Joi.string().allow(''),
                    apiSecret: Joi.string().allow('')
                })
            }).required(),
            jwt: Joi.object({
                accessTokenSecret: Joi.string().required(),
                refreshTokenSecret: Joi.string().required(),
                accessTokenExpiresIn: Joi.string().default('15m'),
                refreshTokenExpiresIn: Joi.string().default('7d')
            }).required(),
            email: Joi.object({
                service: Joi.string().default('gmail'),
                user: Joi.string().email().required(),
                pass: Joi.string().required()
            }).required()
        });
    }

    validate() {
        const { error, value } = this.validationSchema.validate(this.config, {
            allowUnknown: true,
            stripUnknown: false
        });

        if (error) {
            console.error('❌ 설정 검증 실패:', error.details);
            throw new Error(`Config validation failed: ${error.message}`);
        }

        this.config = value;
        console.log('✅ 설정 검증 완료');
    }

    loadEnvironmentVariables() {
        const requiredEnvVars = [
            'DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD',
            'SESSION_SECRET', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET',
            'EMAIL_USER', 'EMAIL_PASS'
        ];

        console.log('🔍 환경변수 디버깅:');
        for (const envVar of requiredEnvVars) {
            const value = process.env[envVar];
            if (!value) {
                console.warn(`⚠️ 환경 변수 ${envVar}가 설정되지 않았습니다.`);
            } else {
                console.log(`✅ ${envVar}: ${envVar.includes('SECRET') || envVar.includes('PASS') ? '[HIDDEN]' : value}`);
            }
        }
    }

    validateCriticalEnvironmentVariables() {
        // EnvironmentManager를 통해 검증
        environmentManager.validateCriticalEnvironmentVariables();
    }

    /**
     * EnvironmentManager로부터 설정 로드
     */
    loadConfigFromEnvironmentManager() {
        // EnvironmentManager에서 모든 설정을 가져와서 병합
        const envConfigs = environmentManager.getAllConfigs();

        this.config = {
            app: {
                name: process.env.APP_NAME || 'SKKU ArtClub Gallery',
                port: parseInt(process.env.PORT, 10) || 3000,
                environment: this.environment
            },
            database: envConfigs.database,
            session: envConfigs.session,
            storage: envConfigs.storage,
            jwt: envConfigs.jwt,
            email: {
                service: process.env.EMAIL_SERVICE || 'gmail',
                user: process.env.EMAIL_USER || '',
                pass: process.env.EMAIL_PASS || ''
            },
            redis: envConfigs.redis,
            qr: {
                enabled: process.env.QR_ENABLED !== 'false',
                baseUrl: process.env.QR_BASE_URL || 'http://localhost:3000'
            },
            swagger: {
                enabled: process.env.SWAGGER_ENABLED !== 'false'
            },
            logging: envConfigs.logging,
            rateLimit: envConfigs.rateLimit,
            cors: envConfigs.cors,

            // Environment Manager 플래그들도 포함
            flags: envConfigs.flags
        };

        // 환경별 디버그 정보 출력
        if (environmentManager.is('enableDebugMode')) {
            environmentManager.printEnvironmentInfo();
        }
    }

    /**
     * 환경별 설정 로드 (기존 호환성 유지)
     */
    loadEnvironmentSpecificConfig() {
        // EnvironmentManager가 이미 처리했으므로 빈 메서드로 유지 (호환성)
        console.log(`🎯 환경별 설정 로드 완료: ${this.environment}`);
    }

    // Getter 메서드들 (기존 API 호환성 유지)
    get(key, defaultValue = null) {
        const keys = key.split('.');
        let current = this.config;

        for (const k of keys) {
            if (current && typeof current === 'object' && k in current) {
                current = current[k];
            } else {
                return defaultValue;
            }
        }

        return current !== undefined ? current : defaultValue;
    }

    set(key, value) {
        const keys = key.split('.');
        let current = this.config;

        for (let i = 0; i < keys.length - 1; i++) {
            const k = keys[i];
            if (!(k in current) || typeof current[k] !== 'object') {
                current[k] = {};
            }
            current = current[k];
        }

        current[keys[keys.length - 1]] = value;
    }

    getAll() {
        return this.config;
    }

    getSupportedEnvironments() {
        return ['development', 'production', 'test', 'local-test'];
    }

    getEnvironment() {
        return this.environment;
    }

    isEnvironment(environment) {
        return this.environment === environment;
    }

    getEnvironmentLoadingStatus() {
        return {
            current: this.environment,
            hasConfig: this.hasEnvironmentConfig,
            supportedEnvironments: this.getSupportedEnvironments()
        };
    }

    isValid() {
        try {
            this.validationSchema.validate(this.config);
            return true;
        } catch (error) {
            return false;
        }
    }

    logConfigInfo() {
        console.log('\n🔧 Configuration Summary:');
        console.log(`   Environment: ${this.environment}`);
        console.log(`   Database: ${this.get('database.host')}:${this.get('database.port')}/${this.get('database.database')}`);
        console.log(`   Redis: ${this.get('redis.enabled') ? 'Enabled' : 'Disabled'}`);
        console.log(`   Port: ${this.get('app.port')}`);
        console.log(`   Debug Mode: ${environmentManager.is('enableDebugMode')}`);
        console.log(`   Stack Trace: ${environmentManager.is('enableStackTrace')}`);
    }

    deepMerge(target, source) {
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                target[key] = target[key] || {};
                this.deepMerge(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
        return target;
    }

    // 환경 확인 메서드들 (EnvironmentManager 위임)
    isDevelopment() {
        return environmentManager.is('isDevelopment');
    }

    isProduction() {
        return environmentManager.is('isProduction');
    }

    isTest() {
        return environmentManager.is('isTest');
    }

    isLocalTest() {
        return environmentManager.is('isLocalTest');
    }

    // 설정 섹션별 getter 메서드들
    getDatabaseConfig() {
        return this.get('database');
    }

    getRedisConfig() {
        return this.get('redis');
    }

    getSessionConfig() {
        return this.get('session');
    }

    getJwtConfig() {
        return this.get('jwt');
    }

    getEmailConfig() {
        return this.get('email');
    }

    getStorageConfig() {
        return this.get('storage');
    }

    getAppConfig() {
        return this.get('app');
    }

    /**
     * 보안 설정 (EnvironmentManager에서 가져오기)
     */
    getSecurityConfig() {
        return {
            enableSecureCookies: environmentManager.is('enableSecureCookies'),
            strictCSP: environmentManager.is('strictCSP'),
            allowUnsafeEval: environmentManager.is('allowUnsafeEval'),
            forceHTTPS: environmentManager.is('forceHTTPS')
        };
    }

    getLoggingConfig() {
        return this.get('logging');
    }

    getRateLimitConfig() {
        return this.get('rateLimit');
    }

    // JWT 토큰별 설정
    getJwtAccessTokenConfig() {
        const jwtConfig = this.getJwtConfig();
        return {
            secret: jwtConfig.accessTokenSecret,
            expiresIn: jwtConfig.accessTokenExpiresIn,
            issuer: jwtConfig.issuer,
            audience: jwtConfig.audience
        };
    }

    getJwtRefreshTokenConfig() {
        const jwtConfig = this.getJwtConfig();
        return {
            secret: jwtConfig.refreshTokenSecret,
            expiresIn: jwtConfig.refreshTokenExpiresIn,
            issuer: jwtConfig.issuer,
            audience: jwtConfig.audience
        };
    }

    /**
     * 환경별 플래그 확인 (EnvironmentManager 위임)
     */
    isFlag(flag) {
        return environmentManager.is(flag);
    }

    /**
     * 환경 매니저 인스턴스 반환
     */
    getEnvironmentManager() {
        return environmentManager;
    }
}

// 싱글톤 인스턴스 생성 및 내보내기
const config = new Config();

export default config;
export { Config };
