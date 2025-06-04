import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Joi from 'joi';
import forge from 'node-forge';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 중앙집중식 설정 관리 클래스
 * 싱글톤 패턴을 사용하여 애플리케이션 전체에서 하나의 인스턴스만 사용
 */
class Config {
    constructor() {
        if (Config.instance) {
            return Config.instance;
        }

        this.config = {};
        this.environment = process.env.NODE_ENV || 'development';
        this.supportedEnvironments = ['development', 'test', 'staging', 'production'];
        this.environmentOverrides = {};
        this.isInitialized = false;
        this.envLoadingErrors = [];
        this.loadedEnvFiles = [];
        this.validationSchema = this.createValidationSchema();

        // 암호화 관련 속성
        this.masterKey = null;
        this.sensitiveKeys = new Set([
            'database.password',
            'storage.apiSecret',
            'session.secret',
            'email.pass',
            'jwt.accessTokenSecret',
            'jwt.refreshTokenSecret'
        ]);

        this.loadMasterKey();
        this.loadEnvironmentVariables();
        this.validateCriticalEnvironmentVariables();
        this.loadDefaultConfig();
        this.loadEnvironmentSpecificConfig();
        this.loadEnvironmentOverridesSync(); // 동기 버전 사용
        this.encryptExistingSensitiveValues();
        this.validate(); // joi 기반 검증 추가

        this.isInitialized = true;
        Config.instance = this;

        // 초기화 완료 후 환경별 설정 비동기 로드
        this.loadEnvironmentOverridesAsync();
    }

    /**
     * 싱글톤 인스턴스 반환
     * @returns {Config} Config 인스턴스
     */
    static getInstance() {
        if (!Config.instance) {
            Config.instance = new Config();
        }
        return Config.instance;
    }

    /**
     * joi 검증 스키마 생성
     * @returns {Joi.ObjectSchema} 검증 스키마
     */
    createValidationSchema() {
        return Joi.object({
            app: Joi.object({
                name: Joi.string().min(1).max(100).required(),
                version: Joi.string()
                    .pattern(/^\d+\.\d+\.\d+$/)
                    .required(),
                port: Joi.number().integer().min(1).max(65535).required(),
                environment: Joi.string().valid('development', 'test', 'staging', 'production').required(),
                debug: Joi.boolean().optional()
            }).required(),

            database: Joi.object({
                dialect: Joi.string().valid('mysql').required(),
                host: Joi.string().min(1).required(),
                user: Joi.string().min(1).required(),
                password: Joi.string().allow('').optional(),
                database: Joi.string().min(1).required(),
                port: Joi.number().integer().min(1).max(65535).required(),
                timezone: Joi.string().required(),
                logging: Joi.alternatives().try(Joi.boolean(), Joi.function()).required(),
                pool: Joi.object({
                    max: Joi.number().integer().min(1).required(),
                    min: Joi.number().integer().min(0).required(),
                    acquire: Joi.number().integer().min(1000).required(),
                    idle: Joi.number().integer().min(1000).required(),
                    evict: Joi.number().integer().min(100).optional(),
                    handleDisconnects: Joi.boolean().optional(),
                    validate: Joi.function().optional()
                }).required()
            }).required(),

            storage: Joi.object({
                cloudName: Joi.string().min(1).required(),
                apiKey: Joi.string().min(1).required(),
                apiSecret: Joi.string().min(1).required(),
                environment: Joi.string().required(),
                uploadDir: Joi.string().min(1).required(),
                useTestEnvironment: Joi.boolean().optional()
            }).required(),

            security: Joi.object({
                csp: Joi.object({
                    contentSecurityPolicy: Joi.object({
                        directives: Joi.object().required()
                    }).required(),
                    crossOriginEmbedderPolicy: Joi.boolean().required()
                }).required(),
                staticFiles: Joi.object({
                    setHeaders: Joi.function().required()
                }).required()
            }).required(),

            session: Joi.object({
                secret: Joi.string().min(32).required(),
                resave: Joi.boolean().required(),
                saveUninitialized: Joi.boolean().required(),
                rolling: Joi.boolean().optional(),
                unset: Joi.string().valid('destroy', 'keep').optional(),
                name: Joi.string().optional(),
                proxy: Joi.boolean().optional(),
                genid: Joi.function().optional(),
                cookie: Joi.object({
                    secure: Joi.boolean().required(),
                    maxAge: Joi.number().integer().min(60000).required(), // 최소 1분
                    httpOnly: Joi.boolean().optional(),
                    sameSite: Joi.string().valid('strict', 'lax', 'none').optional(),
                    domain: Joi.string().optional(),
                    path: Joi.string().optional()
                }).required()
            }).required(),

            logging: Joi.object({
                level: Joi.string().valid('error', 'warn', 'info', 'debug').required(),
                enableFileLogging: Joi.boolean().required(),
                enableConsoleLogging: Joi.boolean().optional(),
                logDir: Joi.string().min(1).required()
            }).required(),

            email: Joi.object({
                user: Joi.string().email().allow(null, '').optional(),
                pass: Joi.string().allow(null, '').optional(),
                from: Joi.string().allow(null, '').optional(),
                adminEmail: Joi.string().email().allow(null, '').optional()
            }).optional(),

            rateLimit: Joi.object({
                windowMs: Joi.number().integer().min(1000).required(), // 최소 1초
                max: Joi.number().integer().min(1).required(),
                skipPaths: Joi.array().items(Joi.string()).required()
            }).required(),

            // Redis 설정 (선택적)
            redis: Joi.object({
                host: Joi.string().optional(),
                port: Joi.number().integer().min(1).max(65535).optional(),
                username: Joi.string().allow(null).optional(),
                password: Joi.string().allow(null).optional(),
                db: Joi.number().integer().min(0).max(15).optional(),
                cacheDb: Joi.number().integer().min(0).max(15).optional(),
                ttl: Joi.number().integer().min(1).optional(),
                prefix: Joi.string().optional(),
                useTestInstance: Joi.boolean().optional(),
                keyPrefix: Joi.string().optional(),
                database: Joi.number().integer().min(0).max(15).optional()
            }).optional(),

            // 환경별 추가 설정들 (선택적)
            devTools: Joi.object({
                enableHotReload: Joi.boolean().optional(),
                enableSourceMaps: Joi.boolean().optional(),
                enableDebugRoutes: Joi.boolean().optional()
            }).optional(),

            performance: Joi.object({
                enableCompression: Joi.boolean().optional(),
                enableCaching: Joi.boolean().optional(),
                cacheMaxAge: Joi.number().integer().min(0).optional(),
                enableMinification: Joi.boolean().optional()
            }).optional(),

            monitoring: Joi.object({
                enableHealthCheck: Joi.boolean().optional(),
                enableMetrics: Joi.boolean().optional(),
                enableErrorReporting: Joi.boolean().optional(),
                enableDetailedLogging: Joi.boolean().optional()
            }).optional(),

            staging: Joi.object({
                enableTestData: Joi.boolean().optional(),
                enableDebugRoutes: Joi.boolean().optional(),
                enablePerformanceMonitoring: Joi.boolean().optional(),
                enableErrorSimulation: Joi.boolean().optional()
            }).optional(),

            testing: Joi.object({
                enableMocking: Joi.boolean().optional(),
                enableTestRoutes: Joi.boolean().optional(),
                enableTestDatabase: Joi.boolean().optional(),
                resetDatabaseOnStart: Joi.boolean().optional()
            }).optional(),

            // JWT 설정 추가
            jwt: Joi.object({
                accessTokenSecret: Joi.string().min(32).required(),
                refreshTokenSecret: Joi.string().min(32).required(),
                accessTokenExpiry: Joi.string().optional().default('15m'),
                refreshTokenExpiry: Joi.string().optional().default('7d'),
                issuer: Joi.string().optional().default('skku-fac-gallery'),
                audience: Joi.string().optional().default('skku-fac-gallery-users')
            }).required(),

            // OAuth 설정 추가
            oauth: Joi.object({
                google: Joi.object({
                    clientID: Joi.string().optional(),
                    clientSecret: Joi.string().optional(),
                    callbackURL: Joi.string().optional().default('/auth/google/callback')
                }).optional()
            }).optional(),

            features: Joi.object({
                enableBetaFeatures: Joi.boolean().optional(),
                enableA11yTesting: Joi.boolean().optional(),
                enablePerformanceTesting: Joi.boolean().optional()
            }).optional(),

            externalServices: Joi.object({
                cloudinary: Joi.object({
                    shareWithTest: Joi.boolean().optional(),
                    useTestFolder: Joi.boolean().optional()
                }).optional(),
                redis: Joi.object({
                    shareWithTest: Joi.boolean().optional(),
                    useTestDatabase: Joi.boolean().optional()
                }).optional()
            }).optional(),

            notifications: Joi.object({
                enableSlackAlerts: Joi.boolean().optional(),
                enableEmailAlerts: Joi.boolean().optional(),
                alertThreshold: Joi.string().valid('info', 'warning', 'error', 'critical').optional()
            }).optional()
        });
    }

    /**
     * joi를 사용한 설정 검증
     * @throws {Error} 검증 실패 시 에러 발생
     */
    validate() {
        try {
            const { error } = this.validationSchema.validate(this.config, {
                abortEarly: false, // 모든 에러를 수집
                allowUnknown: false, // 정의되지 않은 속성 허용 안함
                stripUnknown: false // 알 수 없는 속성 제거 안함
            });

            if (error) {
                const errorMessages = error.details.map(detail => {
                    const path = detail.path.join('.');
                    return `${path}: ${detail.message}`;
                });

                const errorMessage = `설정 검증 실패:\n${errorMessages.join('\n')}`;

                console.error('❌ Config 검증 오류:');
                errorMessages.forEach(msg => console.error(`  - ${msg}`));

                // 프로덕션 환경에서는 검증 실패 시 애플리케이션 종료
                if (this.environment === 'production') {
                    console.error('💥 프로덕션 환경에서 설정 검증 실패로 애플리케이션을 종료합니다.');
                    throw new Error(errorMessage);
                } else {
                    console.warn('⚠️ 개발 환경에서 설정 검증 실패가 감지되었습니다. 계속 진행합니다.');
                }

                return { isValid: false, errors: errorMessages };
            } else {
                console.log('✅ Config 검증 완료');
                return { isValid: true, errors: [] };
            }
        } catch (validationError) {
            console.error('❌ Config 검증 중 예외 발생:', validationError.message);

            if (this.environment === 'production') {
                throw validationError;
            }

            return { isValid: false, errors: [validationError.message] };
        }
    }

    /**
     * 환경 변수 로드 (개선된 버전)
     */
    loadEnvironmentVariables() {
        const envFiles = ['.env.local', '.env', `.env.${this.environment}`, `.env.${this.environment}.local`];

        for (const envFile of envFiles) {
            try {
                const envPath = path.resolve(process.cwd(), envFile);
                if (fs.existsSync(envPath)) {
                    const result = dotenv.config({ path: envPath });

                    if (result.error) {
                        this.envLoadingErrors.push({
                            file: envFile,
                            error: result.error.message,
                            timestamp: new Date().toISOString()
                        });
                        console.warn(`⚠️ 환경 변수 파일 로드 중 오류 발생 (${envFile}):`, result.error.message);
                    } else {
                        this.loadedEnvFiles.push({
                            file: envFile,
                            path: envPath,
                            timestamp: new Date().toISOString()
                        });
                        console.log(`✅ 환경 변수 파일 로드 성공: ${envFile}`);
                    }
                }
            } catch (error) {
                this.envLoadingErrors.push({
                    file: envFile,
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
                console.warn(`⚠️ 환경 변수 파일 접근 중 오류 발생 (${envFile}):`, error.message);
            }
        }

        // 로딩 결과 요약
        if (this.loadedEnvFiles.length === 0) {
            console.warn('⚠️ 로드된 환경 변수 파일이 없습니다. 시스템 환경 변수만 사용됩니다.');
        } else {
            console.log(`📋 총 ${this.loadedEnvFiles.length}개의 환경 변수 파일이 로드되었습니다.`);
        }
    }

    /**
     * 중요한 환경 변수 검증
     */
    validateCriticalEnvironmentVariables() {
        const criticalVars = {
            // 데이터베이스 관련
            DB_HOST: { required: this.environment !== 'production', type: 'string' },
            DB_USER: { required: this.environment !== 'production', type: 'string' },
            DB_PASSWORD: { required: this.environment !== 'production', type: 'string' },
            DB_NAME: { required: this.environment !== 'production', type: 'string' },

            // 프로덕션 환경 (Railway) 데이터베이스
            MYSQLHOST: { required: this.environment === 'production', type: 'string' },
            MYSQLUSER: { required: this.environment === 'production', type: 'string' },
            MYSQLPASSWORD: { required: this.environment === 'production', type: 'string' },
            MYSQL_DATABASE: { required: this.environment === 'production', type: 'string' },

            // Cloudinary 설정
            CLOUDINARY_CLOUD_NAME: { required: true, type: 'string' },
            CLOUDINARY_API_KEY: { required: true, type: 'string' },
            CLOUDINARY_API_SECRET: { required: true, type: 'string' },

            // 세션 보안
            SESSION_SECRET: { required: true, type: 'string', minLength: 32 },

            // 포트 번호
            PORT: { required: false, type: 'number', min: 1, max: 65535 }
        };

        const validationErrors = [];

        for (const [varName, rules] of Object.entries(criticalVars)) {
            const value = process.env[varName];

            // 필수 변수 확인
            if (rules.required && (!value || value.trim() === '')) {
                validationErrors.push(`필수 환경 변수가 누락되었습니다: ${varName}`);
                continue;
            }

            // 값이 있는 경우에만 타입 및 형식 검증
            if (value) {
                // 타입 검증
                if (rules.type === 'number') {
                    const numValue = parseInt(value, 10);
                    if (isNaN(numValue)) {
                        validationErrors.push(`환경 변수 ${varName}는 숫자여야 합니다: ${value}`);
                        continue;
                    }

                    // 범위 검증
                    if (rules.min !== undefined && numValue < rules.min) {
                        validationErrors.push(`환경 변수 ${varName}는 ${rules.min} 이상이어야 합니다: ${numValue}`);
                    }
                    if (rules.max !== undefined && numValue > rules.max) {
                        validationErrors.push(`환경 변수 ${varName}는 ${rules.max} 이하여야 합니다: ${numValue}`);
                    }
                }

                // 문자열 길이 검증
                if (rules.type === 'string' && rules.minLength && value.length < rules.minLength) {
                    validationErrors.push(`환경 변수 ${varName}는 최소 ${rules.minLength}자 이상이어야 합니다`);
                }

                // URL 형식 검증
                if (rules.type === 'url') {
                    try {
                        new URL(value);
                    } catch {
                        validationErrors.push(`환경 변수 ${varName}는 유효한 URL이어야 합니다: ${value}`);
                    }
                }

                // 이메일 형식 검증
                if (rules.type === 'email') {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(value)) {
                        validationErrors.push(`환경 변수 ${varName}는 유효한 이메일 주소여야 합니다: ${value}`);
                    }
                }
            }
        }

        // 검증 오류가 있으면 경고 출력
        if (validationErrors.length > 0) {
            console.error('❌ 환경 변수 검증 오류:');
            validationErrors.forEach(error => console.error(`  - ${error}`));

            // 프로덕션 환경에서는 중요한 오류가 있으면 종료
            if (this.environment === 'production') {
                const criticalErrors = validationErrors.filter(
                    error => error.includes('MYSQL') || error.includes('CLOUDINARY') || error.includes('SESSION_SECRET')
                );
                if (criticalErrors.length > 0) {
                    console.error('💥 프로덕션 환경에서 중요한 환경 변수 오류가 발견되어 애플리케이션을 종료합니다.');
                    process.exit(1);
                }
            }
        } else {
            console.log('✅ 환경 변수 검증 완료');
        }
    }

    /**
     * 기본 설정 로드
     */
    loadDefaultConfig() {
        this.config = {
            // 애플리케이션 기본 설정
            app: {
                name: process.env.APP_NAME || 'SKKU Gallery',
                version: process.env.APP_VERSION || '1.0.0',
                port: parseInt(process.env.PORT, 10) || 3000,
                environment: this.environment
            },

            // 데이터베이스 설정
            database: this.getDatabaseConfig(),

            // 스토리지 설정 (Cloudinary)
            storage: this.getStorageConfig(),

            // 보안 설정
            security: this.getSecurityConfig(),

            // 세션 설정
            session: {
                secret: process.env.SESSION_SECRET || 'default-secret-key',
                resave: false,
                saveUninitialized: false,
                cookie: {
                    secure: this.environment === 'production',
                    maxAge: parseInt(process.env.SESSION_MAX_AGE, 10) || 24 * 60 * 60 * 1000 // 24시간
                }
            },

            // 로깅 설정
            logging: {
                level: process.env.LOG_LEVEL || (this.environment === 'production' ? 'info' : 'debug'),
                enableFileLogging: this.environment !== 'production' && !process.env.RAILWAY_PROJECT_NAME,
                logDir: process.env.LOG_DIR || 'logs'
            },

            // 이메일 설정
            email: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
                from: process.env.EMAIL_FROM,
                adminEmail: process.env.ADMIN_EMAIL
            },

            // Redis 설정
            redis: {
                host: process.env.REDIS_HOST || 'localhost',
                port: parseInt(process.env.REDIS_PORT, 10) || 6379,
                username: process.env.REDIS_USERNAME || null,
                password: process.env.REDIS_PASSWORD || null,
                db: parseInt(process.env.REDIS_DB, 10) || 0,
                cacheDb: parseInt(process.env.REDIS_CACHE_DB, 10) || 1, // 캐시용 별도 DB
                ttl: parseInt(process.env.REDIS_TTL, 10) || 86400 // 24시간
            },

            // Rate Limiting 설정
            rateLimit: {
                windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15분
                max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 300, // IP당 최대 요청 수
                skipPaths: ['/health', '/favicon.ico']
            },

            // JWT 설정
            jwt: {
                accessTokenSecret: process.env.JWT_ACCESS_SECRET || 'default-access-secret-change-in-production',
                refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change-in-production',
                accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
                refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
                issuer: process.env.JWT_ISSUER || 'skku-fac-gallery',
                audience: process.env.JWT_AUDIENCE || 'skku-fac-gallery-users'
            },

            // OAuth 설정
            oauth: {
                google: {
                    clientID: process.env.GOOGLE_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                    callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback'
                }
            }
        };
    }

    /**
     * 데이터베이스 설정 생성
     * @returns {object} 데이터베이스 설정 객체
     */
    getDatabaseConfig() {
        // 환경별 최적화된 연결 풀 설정
        const getOptimizedPoolConfig = () => {
            switch (this.environment) {
                case 'production':
                    return {
                        max: parseInt(process.env.DB_POOL_MAX, 10) || 20, // 운영: 더 많은 연결
                        min: parseInt(process.env.DB_POOL_MIN, 10) || 5, // 운영: 최소 연결 유지
                        acquire: parseInt(process.env.DB_POOL_ACQUIRE, 10) || 10000, // 10초
                        idle: parseInt(process.env.DB_POOL_IDLE, 10) || 60000, // 60초
                        evict: parseInt(process.env.DB_POOL_EVICT, 10) || 1000, // 1초마다 유휴 연결 확인
                        handleDisconnects: true, // 연결 끊김 자동 처리
                        validate: connection => {
                            // 연결 유효성 검사 - 연결이 존재하고 활성 상태인지 확인
                            return connection && connection.state !== 'disconnected';
                        }
                    };

                case 'test':
                    return {
                        max: parseInt(process.env.DB_POOL_MAX, 10) || 5, // 테스트: 적은 연결
                        min: parseInt(process.env.DB_POOL_MIN, 10) || 1, // 테스트: 최소 1개 유지
                        acquire: parseInt(process.env.DB_POOL_ACQUIRE, 10) || 5000, // 5초
                        idle: parseInt(process.env.DB_POOL_IDLE, 10) || 30000, // 30초
                        evict: parseInt(process.env.DB_POOL_EVICT, 10) || 1000,
                        handleDisconnects: true
                    };

                case 'development':
                    return {
                        max: parseInt(process.env.DB_POOL_MAX, 10) || 10, // 개발: 중간 수준
                        min: parseInt(process.env.DB_POOL_MIN, 10) || 2, // 개발: 최소 2개 유지
                        acquire: parseInt(process.env.DB_POOL_ACQUIRE, 10) || 8000, // 8초
                        idle: parseInt(process.env.DB_POOL_IDLE, 10) || 45000, // 45초
                        evict: parseInt(process.env.DB_POOL_EVICT, 10) || 1000,
                        handleDisconnects: true
                    };

                default:
                    return {
                        max: parseInt(process.env.DB_POOL_MAX, 10) || 10,
                        min: parseInt(process.env.DB_POOL_MIN, 10) || 0,
                        acquire: parseInt(process.env.DB_POOL_ACQUIRE, 10) || 30000,
                        idle: parseInt(process.env.DB_POOL_IDLE, 10) || 10000
                    };
            }
        };

        const baseConfig = {
            dialect: 'mysql',
            timezone: '+09:00',
            logging: this.environment === 'development' ? console.log : false,
            pool: getOptimizedPoolConfig()
        };

        // 환경별 설정을 먼저 생성하고, 나중에 get() 메서드로 password를 가져와서 복호화
        let envConfig;
        switch (this.environment) {
            case 'production':
                envConfig = {
                    ...baseConfig,
                    host: process.env.MYSQLHOST,
                    user: process.env.MYSQLUSER,
                    password: process.env.MYSQLPASSWORD,
                    database: process.env.MYSQL_DATABASE,
                    port: parseInt(process.env.MYSQLPORT, 10) || 3306
                };
                break;

            case 'test':
                envConfig = {
                    ...baseConfig,
                    host: process.env.TEST_DB_HOST || process.env.DB_HOST,
                    user: process.env.TEST_DB_USER || process.env.DB_USER,
                    password: process.env.TEST_DB_PASSWORD || process.env.DB_PASSWORD,
                    database: process.env.TEST_DB_NAME || process.env.DB_NAME,
                    port: parseInt(process.env.TEST_DB_PORT || process.env.DB_PORT, 10) || 3306
                };
                break;

            case 'development':
                envConfig = {
                    ...baseConfig,
                    host: process.env.DEV_DB_HOST || process.env.DB_HOST,
                    user: process.env.DEV_DB_USER || process.env.DB_USER,
                    password: process.env.DEV_DB_PASSWORD || process.env.DB_PASSWORD,
                    database: process.env.DEV_DB_NAME || process.env.DB_NAME,
                    port: parseInt(process.env.DEV_DB_PORT || process.env.DB_PORT, 10) || 3306
                };
                break;

            default:
                envConfig = {
                    ...baseConfig,
                    host: process.env.DB_HOST,
                    user: process.env.DB_USER,
                    password: process.env.DB_PASSWORD,
                    database: process.env.DB_NAME,
                    port: parseInt(process.env.DB_PORT, 10) || 3306
                };
        }

        // 초기화가 완료된 후에는 get() 메서드를 사용하여 암호화된 비밀번호를 복호화
        if (this.isInitialized && this.config.database) {
            const storedPassword = this.get('database.password');
            if (storedPassword) {
                envConfig.password = storedPassword;
            }
        }

        return envConfig;
    }

    /**
     * 스토리지 설정 생성
     * @returns {object} 스토리지 설정 객체
     */
    getStorageConfig() {
        const baseConfig = {
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY,
            apiSecret: process.env.CLOUDINARY_API_SECRET
        };

        // 환경별 업로드 디렉토리 매핑
        const uploadDirMap = {
            production: process.env.PROD_UPLOAD_DIR || 'production',
            test: process.env.TEST_UPLOAD_DIR || 'test',
            development: process.env.DEV_UPLOAD_DIR || 'test', // 개발환경은 테스트와 동일
            staging: process.env.STAGING_UPLOAD_DIR || 'staging',
            local: process.env.LOCAL_UPLOAD_DIR || 'local'
        };

        return {
            ...baseConfig,
            environment: this.environment,
            uploadDir: uploadDirMap[this.environment] || uploadDirMap.local,
            // 개발 환경에서 테스트와 동일한 설정 사용
            useTestEnvironment: this.environment === 'development'
        };
    }

    /**
     * 보안 설정 생성
     * @returns {object} 보안 설정 객체
     */
    getSecurityConfig() {
        return {
            // Content Security Policy
            csp: {
                contentSecurityPolicy: {
                    directives: {
                        defaultSrc: ['\'self\''],
                        scriptSrc: [
                            '\'self\'',
                            '\'unsafe-inline\'',
                            'https://developers.kakao.com',
                            'https://t1.kakaocdn.net',
                            'https://k.kakaocdn.net',
                            'https://cdn.jsdelivr.net',
                            'blob:'
                        ],
                        styleSrc: [
                            '\'self\'',
                            'https://cdnjs.cloudflare.com',
                            'https://fonts.googleapis.com',
                            '\'unsafe-inline\''
                        ],
                        fontSrc: [
                            '\'self\'',
                            'https://fonts.googleapis.com',
                            'https://cdnjs.cloudflare.com',
                            'https://fonts.gstatic.com',
                            '\'unsafe-inline\''
                        ],
                        imgSrc: [
                            '\'self\'',
                            'https://res.cloudinary.com/dw57ytzhg/',
                            'https://res.cloudinary.com/dvkr4k6n8/',
                            'data:',
                            'blob:'
                        ],
                        connectSrc: [
                            '\'self\'',
                            'https://developers.kakao.com',
                            'https://t1.kakaocdn.net',
                            'https://k.kakaocdn.net',
                            'https://cdn.jsdelivr.net'
                        ],
                        frameSrc: ['\'self\'', 'https://developers.kakao.com'],
                        objectSrc: ['\'self\'', 'https://developers.kakao.com'],
                        formAction: ['\'self\'', 'https://*.kakao.com'],
                        workerSrc: ['\'self\'', 'blob:'],
                        scriptSrcAttr: ['\'unsafe-inline\'']
                    }
                },
                crossOriginEmbedderPolicy: false
            },

            // 정적 파일 설정
            staticFiles: {
                setHeaders: (res, filePath) => {
                    if (filePath.endsWith('.js')) {
                        res.setHeader('Content-Type', 'text/javascript; charset=UTF-8');
                        res.setHeader('X-Content-Type-Options', 'nosniff');
                    }
                    res.setHeader('Cache-Control', 'public, max-age=86400'); // 24시간
                }
            }
        };
    }

    /**
     * 환경별 특정 설정 로드
     */
    loadEnvironmentSpecificConfig() {
        // 환경별 추가 설정이 필요한 경우 여기에 구현
        if (this.environment === 'production') {
            // 프로덕션 환경 특정 설정
            this.config.logging.level = 'info';
            this.config.app.debug = false;
        } else if (this.environment === 'development') {
            // 개발 환경 특정 설정
            this.config.app.debug = true;
        } else if (this.environment === 'test') {
            // 테스트 환경 특정 설정
            this.config.logging.level = 'error';
            this.config.app.debug = false;
        }
    }

    /**
     * 설정 값 조회
     * @param {string} key - 설정 키 (점 표기법 지원, 예: 'database.host')
     * @param {any} defaultValue - 기본값
     * @returns {any} 설정 값
     */
    get(key, defaultValue = null) {
        if (!this.isInitialized) {
            throw new Error('Config가 아직 초기화되지 않았습니다.');
        }

        const keys = key.split('.');
        let value = this.config;

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return defaultValue;
            }
        }

        // 민감한 키인 경우 복호화
        if (this.isSensitiveKey(key) && typeof value === 'string') {
            return this.decryptValue(value);
        }

        return value;
    }

    /**
     * 설정 값 설정
     * @param {string} key - 설정 키 (점 표기법 지원)
     * @param {any} value - 설정 값
     */
    set(key, value) {
        if (!this.isInitialized) {
            throw new Error('Config가 아직 초기화되지 않았습니다.');
        }

        // 민감한 키인 경우 암호화
        let processedValue = value;
        if (this.isSensitiveKey(key) && typeof value === 'string') {
            processedValue = this.encryptValue(value);
        }

        const keys = key.split('.');
        let current = this.config;

        for (let i = 0; i < keys.length - 1; i++) {
            const k = keys[i];
            if (!(k in current) || typeof current[k] !== 'object') {
                current[k] = {};
            }
            current = current[k];
        }

        current[keys[keys.length - 1]] = processedValue;
    }

    /**
     * 전체 설정 객체 반환
     * @returns {object} 전체 설정 객체
     */
    getAll() {
        return { ...this.config };
    }

    /**
     * 지원되는 환경 목록 반환
     * @returns {string[]} 지원되는 환경 목록
     */
    getSupportedEnvironments() {
        return [...this.supportedEnvironments];
    }

    /**
     * 현재 환경 반환
     * @returns {string} 현재 환경
     */
    getEnvironment() {
        return this.environment;
    }

    /**
     * 현재 환경이 특정 환경인지 확인
     * @param {string} environment - 확인할 환경
     * @returns {boolean} 환경 일치 여부
     */
    isEnvironment(environment) {
        return this.environment === environment;
    }

    /**
     * 환경 변수 로딩 상태 반환
     * @returns {object} 로딩 상태 정보
     */
    getEnvironmentLoadingStatus() {
        return {
            loadedFiles: [...this.loadedEnvFiles],
            errors: [...this.envLoadingErrors],
            totalLoaded: this.loadedEnvFiles.length,
            totalErrors: this.envLoadingErrors.length
        };
    }

    /**
     * 설정이 유효한지 확인
     * @returns {boolean} 유효성 여부
     */
    isValid() {
        try {
            const validationResult = this.validate();
            return validationResult.isValid;
        } catch (error) {
            console.error('설정 검증 중 오류 발생:', error.message);
            return false;
        }
    }

    /**
     * 설정 정보를 로그로 출력 (민감한 정보 제외)
     */
    logConfigInfo() {
        const safeConfig = {
            app: this.config.app,
            environment: this.environment,
            database: {
                host: this.config.database.host,
                database: this.config.database.database,
                port: this.config.database.port
            },
            storage: {
                cloudName: this.config.storage.cloudName,
                uploadDir: this.config.storage.uploadDir
            },
            logging: this.config.logging,
            environmentLoading: this.getEnvironmentLoadingStatus()
        };

        console.log('📋 Config 정보:', JSON.stringify(safeConfig, null, 2));
    }

    /**
     * 마스터 키 로드
     */
    loadMasterKey() {
        this.masterKey = process.env.CONFIG_MASTER_KEY;

        if (!this.masterKey) {
            // 개발 환경에서는 기본 키 사용 (보안 경고 출력)
            if (this.environment === 'development') {
                this.masterKey = 'default-development-master-key-32chars-minimum-length-required';
                console.warn('⚠️ CONFIG_MASTER_KEY가 설정되지 않아 기본 개발용 키를 사용합니다.');
                console.warn('⚠️ 프로덕션 환경에서는 반드시 안전한 마스터 키를 설정하세요.');
            } else {
                console.error('❌ CONFIG_MASTER_KEY 환경 변수가 필요합니다.');
                if (this.environment === 'production') {
                    throw new Error('프로덕션 환경에서 CONFIG_MASTER_KEY는 필수입니다.');
                }
            }
        }

        // 마스터 키 길이 검증
        if (this.masterKey && this.masterKey.length < 32) {
            const error = 'CONFIG_MASTER_KEY는 최소 32자 이상이어야 합니다.';
            console.error('❌', error);
            if (this.environment === 'production') {
                throw new Error(error);
            }
        }
    }

    /**
     * 값 암호화
     * @param {string} value - 암호화할 값
     * @returns {string} 암호화된 값 (base64 인코딩)
     */
    encryptValue(value) {
        if (!value || typeof value !== 'string') {
            return value;
        }

        if (!this.masterKey) {
            console.warn('⚠️ 마스터 키가 없어 암호화를 건너뜁니다.');
            return value;
        }

        try {
            // AES-256-GCM 암호화 사용
            const key = forge.util.createBuffer(this.masterKey.substring(0, 32));
            const iv = forge.random.getBytesSync(12); // GCM 모드용 12바이트 IV

            const cipher = forge.cipher.createCipher('AES-GCM', key);
            cipher.start({ iv: iv });
            cipher.update(forge.util.createBuffer(value, 'utf8'));
            cipher.finish();

            const encrypted = cipher.output;
            const tag = cipher.mode.tag;

            // IV + 암호화된 데이터 + 태그를 결합하여 base64로 인코딩
            const combined = forge.util.createBuffer();
            combined.putBuffer(forge.util.createBuffer(iv));
            combined.putBuffer(encrypted);
            combined.putBuffer(tag);

            return forge.util.encode64(combined.getBytes());
        } catch (error) {
            console.error('❌ 암호화 중 오류 발생:', error.message);
            return value; // 암호화 실패 시 원본 값 반환
        }
    }

    /**
     * 값 복호화
     * @param {string} encryptedValue - 복호화할 암호화된 값
     * @returns {string} 복호화된 값
     */
    decryptValue(encryptedValue) {
        if (!encryptedValue || typeof encryptedValue !== 'string') {
            return encryptedValue;
        }

        if (!this.masterKey) {
            console.warn('⚠️ 마스터 키가 없어 복호화를 건너뜁니다.');
            return encryptedValue;
        }

        try {
            // base64 디코딩
            const combined = forge.util.createBuffer(forge.util.decode64(encryptedValue));

            // 전체 길이 확인
            const totalLength = combined.length();
            if (totalLength < 28) {
                // 최소 12(IV) + 16(tag) = 28바이트
                throw new Error('암호화된 데이터가 너무 짧습니다.');
            }

            // IV (12바이트), 암호화된 데이터, 태그 (16바이트) 분리
            const ivLength = 12;
            const tagLength = 16;
            const encryptedLength = totalLength - ivLength - tagLength;

            if (encryptedLength < 0) {
                throw new Error('잘못된 암호화 데이터 형식입니다.');
            }

            const iv = combined.getBytes(ivLength);
            const encrypted = combined.getBytes(encryptedLength);
            const tag = combined.getBytes(tagLength);

            const key = forge.util.createBuffer(this.masterKey.substring(0, 32));

            const decipher = forge.cipher.createDecipher('AES-GCM', key);
            decipher.start({
                iv: iv,
                tag: forge.util.createBuffer(tag)
            });
            decipher.update(forge.util.createBuffer(encrypted));

            const success = decipher.finish();
            if (!success) {
                throw new Error('복호화 검증 실패');
            }

            return decipher.output.toString('utf8');
        } catch (error) {
            console.error('❌ 복호화 중 오류 발생:', error.message);
            return encryptedValue; // 복호화 실패 시 암호화된 값 반환
        }
    }

    /**
     * 키가 민감한 정보인지 확인
     * @param {string} key - 확인할 키
     * @returns {boolean} 민감한 정보 여부
     */
    isSensitiveKey(key) {
        return this.sensitiveKeys.has(key);
    }

    /**
     * 기존 평문 민감한 값들을 암호화
     * 초기 설정 로드 후 한 번만 실행
     */
    encryptExistingSensitiveValues() {
        if (!this.masterKey) {
            console.warn('⚠️ 마스터 키가 없어 기존 민감한 값 암호화를 건너뜁니다.');
            return;
        }

        const sensitiveKeysToProcess = ['database.password', 'storage.apiSecret', 'session.secret', 'email.pass'];

        for (const key of sensitiveKeysToProcess) {
            const currentValue = this.getRawValue(key);
            if (currentValue && typeof currentValue === 'string') {
                // 이미 암호화된 값인지 확인 (base64 형태이고 복호화 가능한지 체크)
                if (!this.isAlreadyEncrypted(currentValue)) {
                    console.log(`🔒 ${key} 값을 암호화합니다.`);
                    this.setRawValue(key, this.encryptValue(currentValue));
                }
            }
        }
    }

    /**
     * 값이 이미 암호화되었는지 확인
     * @param {string} value - 확인할 값
     * @returns {boolean} 암호화 여부
     */
    isAlreadyEncrypted(value) {
        try {
            // 기본 검증: 문자열이고 적절한 길이인지 확인
            if (!value || typeof value !== 'string' || value.length < 40) {
                return false;
            }

            // base64 형태인지 확인
            if (!/^[A-Za-z0-9+/]+=*$/.test(value)) {
                return false;
            }

            // base64 디코딩 후 최소 길이 확인 (IV 12 + tag 16 = 28바이트 최소)
            try {
                const decoded = forge.util.decode64(value);
                if (decoded.length < 28) {
                    return false;
                }
            } catch {
                return false;
            }

            // 실제 복호화 시도 (오류 발생하면 암호화되지 않은 것으로 간주)
            const originalDecryptValue = this.decryptValue;
            let decryptionSuccessful = false;

            // 임시로 복호화 시도 (에러 로그 없이)
            try {
                const testDecrypted = originalDecryptValue.call(this, value);
                decryptionSuccessful = testDecrypted !== value && testDecrypted !== null;
            } catch {
                decryptionSuccessful = false;
            }

            return decryptionSuccessful;
        } catch {
            return false;
        }
    }

    /**
     * 암호화 없이 원시 값 조회 (내부용)
     * @param {string} key - 설정 키
     * @returns {any} 원시 설정 값
     */
    getRawValue(key) {
        const keys = key.split('.');
        let value = this.config;

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return null;
            }
        }

        return value;
    }

    /**
     * 암호화 없이 원시 값 설정 (내부용)
     * @param {string} key - 설정 키
     * @param {any} value - 설정 값
     */
    setRawValue(key, value) {
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

    /**
     * 환경별 설정을 비동기적으로 로드 (초기화 후 호출)
     */
    async loadEnvironmentOverridesAsync() {
        if (!this.hasEnvironmentConfig) {
            console.log(`⚠️ 환경별 설정 파일이 없습니다: ${this.environment}`);
            return;
        }

        try {
            // 현재 환경에 해당하는 설정 파일 로드
            const envConfigPath = path.join(__dirname, 'environments', `${this.environment}.js`);

            if (fs.existsSync(envConfigPath)) {
                // Windows에서 ESM import를 위해 file:// URL 형식 사용
                const normalizedPath = envConfigPath.replace(/\\/g, '/');
                const fileUrl = new URL(`file:///${normalizedPath}`);

                const envConfig = await import(fileUrl.href);
                this.environmentOverrides = envConfig.default || envConfig;

                console.log('🔍 로드된 환경별 설정:', Object.keys(this.environmentOverrides));

                // 환경별 설정을 기본 설정에 병합
                this.mergeEnvironmentConfig(this.environmentOverrides);

                console.log(`✅ 환경별 설정 파일 로드 성공: ${this.environment}.js`);

                // 병합 후 재검증
                this.validate();
            }
        } catch (error) {
            console.error('❌ 환경별 설정 로드 중 오류 발생:', error.message);
            this.envLoadingErrors.push({
                type: 'environment-config',
                environment: this.environment,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * 환경별 설정을 기본 설정에 병합
     * @param {object} envConfig - 환경별 설정 객체
     */
    mergeEnvironmentConfig(envConfig) {
        this.config = this.deepMerge(this.config, envConfig);
    }

    /**
     * 깊은 객체 병합 유틸리티
     * @param {object} target - 대상 객체
     * @param {object} source - 소스 객체
     * @returns {object} 병합된 객체
     */
    deepMerge(target, source) {
        const result = { ...target };

        for (const key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    result[key] = this.deepMerge(result[key] || {}, source[key]);
                } else {
                    result[key] = source[key];
                }
            }
        }

        return result;
    }

    /**
     * 환경별 설정 로드 (동기 버전)
     */
    loadEnvironmentOverridesSync() {
        try {
            // 현재 환경에 해당하는 설정 파일 경로
            const envConfigPath = path.join(__dirname, 'environments', `${this.environment}.js`);

            if (fs.existsSync(envConfigPath)) {
                console.log(`✅ 환경별 설정 파일 발견: ${this.environment}.js`);

                // 환경별 설정을 나중에 로드하기 위해 플래그 설정
                this.hasEnvironmentConfig = true;

                // 동기적으로 환경별 설정 로드 시도
                try {
                    // require를 사용하여 동기적으로 로드 (ESM 환경에서는 제한적)
                    // 대신 초기화 후 비동기 로드를 위한 준비만 수행
                    console.log(`📋 환경별 설정 파일 준비 완료: ${envConfigPath}`);
                } catch (loadError) {
                    console.warn(`⚠️ 환경별 설정 동기 로드 실패, 비동기 로드로 대체: ${loadError.message}`);
                }
            } else {
                console.warn(`⚠️ 환경별 설정 파일을 찾을 수 없습니다: ${envConfigPath}`);
                this.hasEnvironmentConfig = false;
            }
        } catch (error) {
            console.error('❌ 환경별 설정 확인 중 오류 발생:', error.message);
            this.hasEnvironmentConfig = false;
        }
    }

    /**
     * 환경 설정 (런타임에서 환경 전환)
     * @param {string} newEnvironment - 새로운 환경
     */
    async setEnvironment(newEnvironment) {
        if (!this.supportedEnvironments.includes(newEnvironment)) {
            throw new Error(
                `지원되지 않는 환경입니다: ${newEnvironment}. 지원되는 환경: ${this.supportedEnvironments.join(', ')}`
            );
        }

        const oldEnvironment = this.environment;
        this.environment = newEnvironment;

        try {
            // 새로운 환경의 설정 로드
            await this.loadEnvironmentOverridesAsync();

            // 환경별 특정 설정 다시 로드
            this.loadEnvironmentSpecificConfig();

            // 설정 재검증
            this.validate();

            console.log(`✅ 환경이 ${oldEnvironment}에서 ${newEnvironment}로 변경되었습니다.`);
        } catch (error) {
            // 환경 변경 실패 시 이전 환경으로 롤백
            this.environment = oldEnvironment;
            console.error(`❌ 환경 변경 실패, ${oldEnvironment}로 롤백합니다:`, error.message);
            throw error;
        }
    }

    /**
     * 개발 환경인지 확인
     * @returns {boolean} 개발 환경 여부
     */
    isDevelopment() {
        return this.environment === 'development';
    }

    /**
     * 프로덕션 환경인지 확인
     * @returns {boolean} 프로덕션 환경 여부
     */
    isProduction() {
        return this.environment === 'production';
    }

    /**
     * 테스트 환경인지 확인
     * @returns {boolean} 테스트 환경 여부
     */
    isTest() {
        return this.environment === 'test';
    }

    /**
     * 스테이징 환경인지 확인
     * @returns {boolean} 스테이징 환경 여부
     */
    isStaging() {
        return this.environment === 'staging';
    }

    /**
     * 환경별 설정 오버라이드 반환
     * @returns {object} 환경별 설정 오버라이드
     */
    getEnvironmentOverrides() {
        return { ...this.environmentOverrides };
    }

    /**
     * 이메일 설정 반환
     * @returns {object} 이메일 설정 객체
     */
    getEmailConfig() {
        // 암호화 문제를 피하기 위해 환경변수에서 직접 가져오기
        return {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
            from: process.env.EMAIL_FROM,
            adminEmail: process.env.ADMIN_EMAIL
        };
    }

    /**
     * Redis 설정 생성
     * @returns {object} Redis 설정 객체
     */
    getRedisConfig() {
        // 암호화 문제를 피하기 위해 환경변수에서 직접 가져오기
        const baseConfig = {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT, 10) || 6379,
            username: process.env.REDIS_USERNAME || null,
            password: process.env.REDIS_PASSWORD || null,
            db: parseInt(process.env.REDIS_DB, 10) || 0,
            cacheDb: parseInt(process.env.REDIS_CACHE_DB, 10) || 1, // 캐시용 별도 DB
            ttl: parseInt(process.env.REDIS_TTL, 10) || 86400 // 24시간
        };

        // 환경별 Redis 설정 조정
        switch (this.environment) {
            case 'production':
                return {
                    ...baseConfig,
                    db: parseInt(process.env.REDIS_DB, 10) || 0, // 세션용 DB 0
                    cacheDb: parseInt(process.env.REDIS_CACHE_DB, 10) || 1, // 캐시용 DB 1
                    ttl: parseInt(process.env.REDIS_TTL, 10) || 86400
                };

            case 'test':
                return {
                    ...baseConfig,
                    db: parseInt(process.env.REDIS_DB, 10) || 14, // 테스트 세션용 DB 14
                    cacheDb: parseInt(process.env.REDIS_CACHE_DB, 10) || 15, // 테스트 캐시용 DB 15
                    ttl: parseInt(process.env.REDIS_TTL, 10) || 3600, // 1시간
                    prefix: 'test:'
                };

            case 'development':
                // 개발환경은 별도 DB 사용
                return {
                    ...baseConfig,
                    db: parseInt(process.env.REDIS_DB, 10) || 0, // 개발 세션용 DB 0
                    cacheDb: parseInt(process.env.REDIS_CACHE_DB, 10) || 1, // 개발 캐시용 DB 1
                    ttl: parseInt(process.env.REDIS_TTL, 10) || 3600, // 1시간
                    prefix: 'dev:' // 개발환경 전용 prefix
                };

            case 'staging':
                return {
                    ...baseConfig,
                    db: parseInt(process.env.REDIS_DB, 10) || 2, // 스테이징 세션용 DB 2
                    cacheDb: parseInt(process.env.REDIS_CACHE_DB, 10) || 3, // 스테이징 캐시용 DB 3
                    ttl: parseInt(process.env.REDIS_TTL, 10) || 43200, // 12시간
                    prefix: 'staging:'
                };

            default:
                return baseConfig;
        }
    }

    /**
     * 앱 설정 반환
     * @returns {object} 앱 설정 객체
     */
    getAppConfig() {
        return (
            this.get('app') || {
                name: process.env.APP_NAME || 'SKKU Gallery',
                version: process.env.APP_VERSION || '1.0.0',
                port: parseInt(process.env.PORT, 10) || 3000,
                environment: this.environment,
                baseUrl: process.env.BASE_URL
            }
        );
    }

    /**
     * 세션 설정 반환
     * @returns {object} 세션 설정 객체
     */
    getSessionConfig() {
        return this.get('session', {});
    }

    /**
     * JWT 설정 가져오기
     * @returns {Object} JWT 설정 객체
     */
    getJwtConfig() {
        return this.get('jwt', {
            accessTokenSecret: process.env.JWT_ACCESS_SECRET || 'default-access-secret-change-in-production',
            refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change-in-production',
            accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
            refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
            issuer: process.env.JWT_ISSUER || 'skku-fac-gallery',
            audience: process.env.JWT_AUDIENCE || 'skku-fac-gallery-users'
        });
    }

    /**
     * JWT Access Token 설정 가져오기
     * @returns {Object} Access Token 설정
     */
    getJwtAccessTokenConfig() {
        const jwtConfig = this.getJwtConfig();
        return {
            secret: jwtConfig.accessTokenSecret,
            expiry: jwtConfig.accessTokenExpiry,
            issuer: jwtConfig.issuer,
            audience: jwtConfig.audience
        };
    }

    /**
     * JWT Refresh Token 설정 가져오기
     * @returns {Object} Refresh Token 설정
     */
    getJwtRefreshTokenConfig() {
        const jwtConfig = this.getJwtConfig();
        return {
            secret: jwtConfig.refreshTokenSecret,
            expiry: jwtConfig.refreshTokenExpiry,
            issuer: jwtConfig.issuer,
            audience: jwtConfig.audience
        };
    }
}

// 싱글톤 인스턴스 저장용
Config.instance = null;

export default Config;
