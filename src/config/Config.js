import path from 'path';
import { fileURLToPath } from 'url';
import Joi from 'joi';
import dotenv from 'dotenv';

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
        this.environment = process.env.NODE_ENV || 'development';
        this.hasEnvironmentConfig = true;
        this.validationSchema = this.createValidationSchema();

        this.loadEnvironmentVariables();
        this.validateCriticalEnvironmentVariables();
        this.loadDefaultConfig();
        this.loadEnvironmentSpecificConfig();
        this.validate();
    }

    static getInstance() {
        if (!Config.instance) {
            Config.instance = new Config();
        }
        return Config.instance;
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
        const critical = ['DB_HOST', 'DB_NAME', 'DB_USER', 'SESSION_SECRET'];
        const missing = critical.filter(envVar => !process.env[envVar]);

        if (missing.length > 0 && this.environment === 'production') {
            throw new Error(`프로덕션 환경에서 필수 환경 변수가 누락되었습니다: ${missing.join(', ')}`);
        }
    }

    loadDefaultConfig() {
        this.config = {
            app: {
                name: process.env.APP_NAME || 'SKKU ArtClub Gallery',
                port: parseInt(process.env.PORT, 10) || 3000
            },
            database: {
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT, 10) || 3306,
                database: process.env.DB_NAME || 'skku_sfa_gallery',
                username: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || '',
                pool: {
                    max: 10,
                    min: 0,
                    acquire: 30000,
                    idle: 10000
                }
            },
            session: {
                secret: process.env.SESSION_SECRET || 'default-session-secret',
                maxAge: parseInt(process.env.SESSION_MAX_AGE, 10) || 1800000,
                cookie: {
                    secure: this.environment === 'production',
                    httpOnly: true,
                    maxAge: parseInt(process.env.SESSION_MAX_AGE, 10) || 1800000,
                    sameSite: 'strict'
                }
            },
            storage: {
                type: process.env.CLOUDINARY_CLOUD_NAME ? 'cloudinary' : 'local',
                uploadPath: process.env.UPLOAD_PATH || './uploads',
                maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024,
                cloudinary: {
                    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
                    apiKey: process.env.CLOUDINARY_API_KEY || '',
                    apiSecret: process.env.CLOUDINARY_API_SECRET || ''
                }
            },
            jwt: {
                accessTokenSecret: process.env.JWT_ACCESS_SECRET || 'access-secret',
                refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
                accessTokenExpiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
                refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRES || '7d'
            },
            email: {
                service: process.env.EMAIL_SERVICE || 'gmail',
                user: process.env.EMAIL_USER || '',
                pass: process.env.EMAIL_PASS || ''
            },
            redis: {
                enabled: !!process.env.REDIS_HOST,
                host: process.env.REDIS_HOST || 'localhost',
                port: parseInt(process.env.REDIS_PORT, 10) || 6379,
                password: process.env.REDIS_PASSWORD || null
            },
            qr: {
                enabled: process.env.QR_ENABLED !== 'false',
                baseUrl: process.env.QR_BASE_URL || 'http://localhost:3000'
            },
            swagger: {
                enabled: process.env.SWAGGER_ENABLED !== 'false'
            }
        };
    }

    loadEnvironmentSpecificConfig() {
        try {
            // 환경별 설정을 동기적으로 로드
            const envConfigPath = path.join(__dirname, 'environments', `${this.environment}.js`);
            import(envConfigPath).then(envConfigModule => {
                const envConfig = envConfigModule.default;
                this.config = this.deepMerge(this.config, envConfig);
                console.log(`✅ ${this.environment} 환경 설정 로드 완료`);
            }).catch(error => {
                console.warn(`⚠️ 환경별 설정 파일을 찾을 수 없습니다: ${this.environment}`);
                this.hasEnvironmentConfig = false;
            });
        } catch (error) {
            console.warn(`⚠️ 환경별 설정 파일을 찾을 수 없습니다: ${this.environment}`);
            this.hasEnvironmentConfig = false;
        }
    }

    get(key, defaultValue = null) {
        const keys = key.split('.');
        let value = this.config;

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return defaultValue;
            }
        }

        return value;
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
        return { ...this.config };
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
            environment: this.environment,
            hasEnvironmentConfig: this.hasEnvironmentConfig
        };
    }

    isValid() {
        try {
            this.validate();
            return true;
        } catch {
            return false;
        }
    }

    logConfigInfo() {
        console.log('📊 Config 정보:');
        console.log(`  환경: ${this.environment}`);
        console.log(`  포트: ${this.config.port}`);
        console.log(`  데이터베이스: ${this.config.database.host}:${this.config.database.port}/${this.config.database.database}`);
        console.log(`  스토리지: ${this.config.storage.type}`);
        console.log(`  Redis: ${this.config.redis.enabled ? '활성화' : '비활성화'}`);
        console.log(`  QR 코드: ${this.config.qr.enabled ? '활성화' : '비활성화'}`);
        console.log(`  Swagger: ${this.config.swagger.enabled ? '활성화' : '비활성화'}`);
    }

    deepMerge(target, source) {
        const result = { ...target };
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(result[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        return result;
    }

    // 환경별 헬퍼 메서드
    isDevelopment() {
        return this.environment === 'development';
    }

    isProduction() {
        return this.environment === 'production';
    }

    isTest() {
        return this.environment === 'test' || this.environment === 'local-test';
    }

    isLocalTest() {
        return this.environment === 'local-test';
    }

    // 특정 설정 접근자 메서드
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
        return {
            name: this.get('app.name'),
            port: this.get('app.port'),
            environment: this.environment,
            qr: this.get('qr'),
            swagger: this.get('swagger')
        };
    }

    getSecurityConfig() {
        return this.get('security', {});
    }

    getLoggingConfig() {
        return this.get('logging', {});
    }

    getRateLimitConfig() {
        return this.get('rateLimit', {});
    }

    getJwtAccessTokenConfig() {
        return {
            secret: this.get('jwt.accessTokenSecret'),
            expiresIn: this.get('jwt.accessTokenExpiresIn')
        };
    }

    getJwtRefreshTokenConfig() {
        return {
            secret: this.get('jwt.refreshTokenSecret'),
            expiresIn: this.get('jwt.refreshTokenExpiresIn')
        };
    }
}

export default Config;
