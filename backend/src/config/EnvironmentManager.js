/**
 * 환경별 설정 중앙 관리 클래스
 * 모든 환경별 분기 로직과 설정을 한 곳에서 관리
 */
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EnvironmentManager {
    constructor() {
        this.environment = this.detectEnvironment();
        this.config = {};

        // 환경별 플래그 캐시
        this.flags = this.generateEnvironmentFlags();

        console.log(`🌍 Environment Manager 초기화: ${this.environment}`);
        console.log('📋 Environment Flags:', this.flags);
    }

    /**
     * 환경 감지 로직 (우선순위별)
     */
    detectEnvironment() {
        // 1. 명시적 NODE_ENV 설정
        if (process.env.NODE_ENV) {
            return process.env.NODE_ENV;
        }

        // 2. Railway 배포 환경 감지
        if (process.env.RAILWAY_ENVIRONMENT) {
            return 'production';
        }

        // 3. 기본값
        return 'development';
    }

    /**
     * 환경별 설정 로드 (비동기)
     */
    async loadConfiguration() {
        try {
            // 기본 설정 로드
            const { baseConfig, mergeConfig } = await import('./environments/base.js');

            // 환경별 설정 로드
            const envConfigPath = `./environments/${this.environment}.js`;
            const envConfig = await import(envConfigPath);

            this.config = mergeConfig(baseConfig, envConfig.default);
            return this.config;
        } catch (error) {
            console.warn(`⚠️ 환경별 설정 파일 로드 실패 (${this.environment}), 기본 설정 사용`);
            this.config = {};
            return this.config;
        }
    }

    /**
     * 환경별 플래그 생성
     */
    generateEnvironmentFlags() {
        const env = this.environment;

        return {
            // 기본 환경 플래그
            isDevelopment: env === 'development',
            isProduction: env === 'production',
            isTest: env === 'test' || env === 'testing' || env === 'local-test',
            isLocalTest: env === 'local-test',

            // 복합 플래그
            isLocalDevelopment: env === 'development' && !process.env.RAILWAY_ENVIRONMENT,
            isRailwayDeployment: !!process.env.RAILWAY_ENVIRONMENT,
            isCloudDeployment: !!process.env.RAILWAY_ENVIRONMENT || !!process.env.VERCEL || !!process.env.HEROKU,

            // 기능별 플래그
            enableDebugMode: env === 'development' || env === 'local-test',
            enableStackTrace: env === 'development' || env === 'local-test',
            enableDetailedLogs: env !== 'production',
            enableSecureCookies: env === 'production',
            enableFileLogging: env === 'development' || env === 'production',
            enableSwagger: env !== 'production',
            enableCors: env === 'development' || env === 'local-test',

            // 성능 관련 플래그
            useMemorySession: env === 'test' || env === 'local-test' || (env === 'development' && !process.env.REDIS_HOST),
            useRedisCache: !!process.env.REDIS_HOST && env !== 'test',
            useDatabaseLogging: env === 'development',

            // 보안 관련 플래그
            strictCSP: env === 'production',
            allowUnsafeEval: env === 'development',
            forceHTTPS: env === 'production',
            enableRateLimit: true // 모든 환경에서 활성화, 제한만 다름
        };
    }

    /**
     * 환경별 값 반환 헬퍼
     */
    getEnvironmentValue(values) {
        if (typeof values === 'object' && values !== null) {
            return values[this.environment] || values.default || null;
        }
        return values;
    }

    /**
     * 환경별 데이터베이스 설정
     */
    getDatabaseConfig() {
        const baseConfig = {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT, 10) || 3306,
            database: process.env.DB_NAME || 'skku_sfa_gallery',
            username: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            dialect: 'mysql',
            timezone: '+09:00'
        };

        const poolConfig = this.getEnvironmentValue({
            production: { max: 20, min: 5, acquire: 60000, idle: 300000 },
            development: { max: 5, min: 0, acquire: 30000, idle: 10000 },
            test: { max: 2, min: 0, acquire: 30000, idle: 10000 },
            'local-test': { max: 2, min: 0, acquire: 30000, idle: 10000 }
        });

        return {
            ...baseConfig,
            pool: poolConfig,
            logging: this.flags.useDatabaseLogging ? console.log : false
        };
    }

    /**
     * 환경별 Redis 설정
     */
    getRedisConfig() {
        if (!this.flags.useRedisCache) {
            return null;
        }

        const baseConfig = {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT, 10) || 6379,
            password: process.env.REDIS_PASSWORD || null,
            db: parseInt(process.env.REDIS_DB, 10) || 0
        };

        // 환경별 기본 비밀번호 (REDIS_PASSWORD가 없을 때)
        if (!baseConfig.password) {
            baseConfig.password = this.getEnvironmentValue({
                development: 'devredispass',
                'local-test': 'testredispass',
                production: null,
                test: null
            });
        }

        return {
            ...baseConfig,
            maxRetriesPerRequest: 3,
            retryDelayOnFailover: 100,
            connectTimeout: 10000,
            lazyConnect: true
        };
    }

    /**
     * 환경별 세션 설정
     */
    getSessionConfig() {
        return {
            secret: process.env.SESSION_SECRET || this.getEnvironmentValue({
                development: 'dev-session-secret',
                test: 'test-session-secret',
                production: 'REQUIRED' // 프로덕션에서는 반드시 설정되어야 함
            }),
            name: this.getEnvironmentValue({
                development: 'dev_gallery_sid',
                production: 'gallery_sid',
                test: 'test_gallery_sid',
                'local-test': 'test_gallery_sid'
            }),
            cookie: {
                secure: this.flags.enableSecureCookies,
                httpOnly: true,
                maxAge: this.getEnvironmentValue({
                    development: 24 * 60 * 60 * 1000, // 24시간
                    production: 12 * 60 * 60 * 1000,  // 12시간
                    test: 60 * 60 * 1000,             // 1시간
                    'local-test': 60 * 60 * 1000      // 1시간
                }),
                sameSite: this.flags.isProduction ? 'strict' : 'lax'
            },
            rolling: true,
            unset: 'destroy',
            proxy: this.flags.isRailwayDeployment
        };
    }

    /**
     * 환경별 JWT 설정
     */
    getJWTConfig() {
        return {
            accessTokenSecret: process.env.JWT_ACCESS_SECRET || this.getEnvironmentValue({
                development: 'dev-access-secret',
                test: 'test-access-secret',
                production: 'REQUIRED'
            }),
            refreshTokenSecret: process.env.JWT_REFRESH_SECRET || this.getEnvironmentValue({
                development: 'dev-refresh-secret',
                test: 'test-refresh-secret',
                production: 'REQUIRED'
            }),
            accessTokenExpiresIn: this.getEnvironmentValue({
                development: '1h',
                production: '15m',
                test: '15m'
            }),
            refreshTokenExpiresIn: this.getEnvironmentValue({
                development: '30d',
                production: '7d',
                test: '1d'
            }),
            issuer: `skku-fac-gallery-${this.environment}`,
            audience: `skku-fac-gallery-${this.environment}-users`
        };
    }

    /**
     * 환경별 로깅 설정
     */
    getLoggingConfig() {
        return {
            level: this.getEnvironmentValue({
                development: 'debug',
                production: 'info',
                test: 'warn'
            }),
            enableFileLogging: this.flags.enableFileLogging,
            enableConsoleLogging: true,
            silent: process.env.TEST_SILENT === 'true'
        };
    }

    /**
     * 환경별 Rate Limiting 설정
     */
    getRateLimitConfig() {
        return {
            windowMs: 15 * 60 * 1000, // 15분
            max: this.getEnvironmentValue({
                development: 500,
                production: 200,
                test: 1000,
                'local-test': 1000
            }),
            message: 'API 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
            standardHeaders: true,
            legacyHeaders: false
        };
    }

    /**
     * 환경별 CORS 설정
     */
    getCorsConfig() {
        if (!this.flags.enableCors) {
            return false;
        }

        return {
            origin: this.getEnvironmentValue({
                development: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3003'],
                'local-test': ['http://localhost:3001', 'http://localhost:3003'],
                production: process.env.ALLOWED_ORIGINS?.split(',') || false
            }),
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
        };
    }

    /**
     * 환경별 스토리지 설정
     */
    getStorageConfig() {
        return {
            type: process.env.CLOUDINARY_CLOUD_NAME ? 'cloudinary' : 'local',
            uploadPath: process.env.UPLOAD_PATH || this.getEnvironmentValue({
                development: './uploads',
                production: './uploads',
                test: './test-uploads',
                'local-test': './test-uploads'
            }),
            maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024,
            cloudinary: {
                cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
                apiKey: process.env.CLOUDINARY_API_KEY || '',
                apiSecret: process.env.CLOUDINARY_API_SECRET || ''
            }
        };
    }

    /**
     * 필수 환경 변수 검증
     */
    validateCriticalEnvironmentVariables() {
        const critical = {
            production: ['DB_HOST', 'DB_NAME', 'DB_USER', 'SESSION_SECRET', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'],
            development: ['DB_HOST', 'DB_NAME', 'DB_USER'],
            test: [],
            'local-test': []
        };

        const required = critical[this.environment] || [];
        const missing = required.filter(envVar => !process.env[envVar]);

        if (missing.length > 0) {
            const message = `${this.environment} 환경에서 필수 환경 변수가 누락되었습니다: ${missing.join(', ')}`;

            if (this.flags.isProduction) {
                throw new Error(message);
            } else {
                console.warn(`⚠️ ${message}`);
            }
        }

        return missing.length === 0;
    }

    /**
     * 환경 정보 출력
     */
    printEnvironmentInfo() {
        console.log('\n🔧 Environment Configuration:');
        console.log(`   Environment: ${this.environment}`);
        console.log(`   Node Version: ${process.version}`);
        console.log(`   Platform: ${process.platform}`);
        console.log(`   Debug Mode: ${this.flags.enableDebugMode}`);
        console.log(`   Stack Trace: ${this.flags.enableStackTrace}`);
        console.log(`   Redis Cache: ${this.flags.useRedisCache}`);
        console.log(`   Secure Cookies: ${this.flags.enableSecureCookies}`);
        console.log(`   Railway Deploy: ${this.flags.isRailwayDeployment}`);
        console.log('');
    }

    /**
     * 플래그 확인 메서드
     */
    is(flag) {
        return this.flags[flag] || false;
    }

    /**
     * 환경 확인 메서드
     */
    getEnvironment() {
        return this.environment;
    }

    /**
     * 모든 설정을 통합하여 반환
     */
    getAllConfigs() {
        return {
            environment: this.environment,
            flags: this.flags,
            database: this.getDatabaseConfig(),
            redis: this.getRedisConfig(),
            session: this.getSessionConfig(),
            jwt: this.getJWTConfig(),
            logging: this.getLoggingConfig(),
            rateLimit: this.getRateLimitConfig(),
            cors: this.getCorsConfig(),
            storage: this.getStorageConfig()
        };
    }
}

// 싱글톤 인스턴스 생성
const environmentManager = new EnvironmentManager();

export default environmentManager;
export { EnvironmentManager };
