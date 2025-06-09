import session from 'express-session';
import { RedisStore } from 'connect-redis';
import redisClient from '../redis/RedisClient.js';
import Config from '../../config/Config.js';
import logger from '../../common/utils/Logger.js';

// 모듈 로드 시점 디버깅
console.log('🔄 [SESSION] SessionStore.js 모듈이 로드되었습니다');
logger.info('🔄 [SESSION] SessionStore.js 모듈이 로드되었습니다');

class SessionStore {
    constructor() {
        this.store = null;
        this.sessionConfig = null;
        this.config = Config.getInstance();
        this.isInitialized = false;
    }

    async initialize() {
        try {
            // 로컬 개발 환경이나 테스트 환경에서는 메모리 세션 사용
            const isTestEnvironment = process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'testing';
            const isLocalDevelopment = process.env.NODE_ENV === 'development' && !process.env.RAILWAY_ENVIRONMENT;
            const shouldUseMemorySession = isTestEnvironment || isLocalDevelopment || !process.env.REDIS_HOST;

            if (shouldUseMemorySession) {
                let reason = 'Redis 설정이 없어';
                if (isTestEnvironment) reason = '테스트 환경이므로';
                else if (isLocalDevelopment) reason = '로컬 개발 환경이므로';

                logger.info(`${reason} 메모리 세션 사용`, {
                    nodeEnv: process.env.NODE_ENV,
                    railwayEnv: process.env.RAILWAY_ENVIRONMENT,
                    hasRedisHost: !!process.env.REDIS_HOST
                });

                // 메모리 스토어 사용 (기본 동작)
                this.store = null; // express-session이 메모리 스토어를 기본으로 사용

                // 메모리 세션을 위한 기본 설정 생성
                const sessionConfig = this.config.getSessionConfig();
                const environment = this.config.getEnvironment();

                this.sessionConfig = {
                    secret: sessionConfig.secret,
                    resave: false,
                    saveUninitialized: false,
                    rolling: sessionConfig.rolling !== undefined ? sessionConfig.rolling : true,
                    unset: sessionConfig.unset || 'destroy',
                    name: sessionConfig.name || 'sessionId',
                    proxy: sessionConfig.proxy !== undefined ? sessionConfig.proxy : environment === 'production',
                    cookie: {
                        secure: sessionConfig.cookie.secure !== undefined ? sessionConfig.cookie.secure : environment === 'production',
                        httpOnly: sessionConfig.cookie.httpOnly !== undefined ? sessionConfig.cookie.httpOnly : true,
                        maxAge: sessionConfig.cookie.maxAge || 24 * 60 * 60 * 1000,
                        sameSite: sessionConfig.cookie.sameSite || 'strict',
                        domain: sessionConfig.cookie.domain || undefined,
                        path: sessionConfig.cookie.path || '/'
                    }
                };

                this.isInitialized = true;
                logger.success('메모리 세션 스토어가 초기화되었습니다.', {
                    environment,
                    secure: this.sessionConfig.cookie.secure,
                    sameSite: this.sessionConfig.cookie.sameSite,
                    sessionName: this.sessionConfig.name
                });
                return this.sessionConfig;
            }

            // Redis 클라이언트 연결 시도 (타임아웃 적용)
            if (!redisClient.isClientConnected()) {
                logger.info('Redis 클라이언트 연결 시도 중...');

                // 연결 타임아웃 설정 (30초)
                const connectPromise = redisClient.connect();
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Redis 연결 타임아웃 (30초)')), 30000);
                });

                await Promise.race([connectPromise, timeoutPromise]);
            } else {
                logger.info('Redis 클라이언트가 이미 연결되어 있습니다.');
            }

            // Redis 설정을 환경변수에서 직접 가져오기 (암호화 우회)
            const redisConfig = {
                ttl: parseInt(process.env.REDIS_TTL, 10) || 86400 // 24시간
            };

            // Redis 스토어 생성
            this.store = new RedisStore({
                client: redisClient.getClient(),
                prefix: 'sess:',
                ttl: redisConfig.ttl, // 세션 만료 시간 (초)
                disableTouch: false,
                disableTTL: false
            });

            // 세션 설정 가져오기
            const sessionConfig = this.config.getSessionConfig();
            const environment = this.config.getEnvironment();

            // 기본 세션 설정
            this.sessionConfig = {
                store: this.store,
                secret: sessionConfig.secret,
                resave: false,
                saveUninitialized: false,
                rolling: sessionConfig.rolling !== undefined ? sessionConfig.rolling : true,
                unset: sessionConfig.unset || 'destroy',
                name: sessionConfig.name || 'sessionId',
                proxy: sessionConfig.proxy !== undefined ? sessionConfig.proxy : environment === 'production',
                cookie: {
                    secure:
                        sessionConfig.cookie.secure !== undefined
                            ? sessionConfig.cookie.secure
                            : environment === 'production',
                    httpOnly: sessionConfig.cookie.httpOnly !== undefined ? sessionConfig.cookie.httpOnly : true,
                    maxAge: sessionConfig.cookie.maxAge || 24 * 60 * 60 * 1000,
                    sameSite: sessionConfig.cookie.sameSite || 'strict',
                    domain: sessionConfig.cookie.domain || undefined,
                    path: sessionConfig.cookie.path || '/'
                }
            };

            // 커스텀 세션 ID 생성기가 있는 경우 사용
            if (sessionConfig.genid && typeof sessionConfig.genid === 'function') {
                this.sessionConfig.genid = sessionConfig.genid;
            } else if (environment === 'production') {
                // 프로덕션에서는 더 안전한 세션 ID 생성
                const crypto = await import('crypto');
                this.sessionConfig.genid = () => {
                    return crypto.randomBytes(32).toString('hex');
                };
            }

            this.isInitialized = true;
            logger.success('Redis 세션 스토어가 초기화되었습니다.', {
                environment,
                secure: this.sessionConfig.cookie.secure,
                sameSite: this.sessionConfig.cookie.sameSite,
                sessionName: this.sessionConfig.name
            });
            return this.sessionConfig;
        } catch (error) {
            logger.error('Redis 세션 스토어 초기화 실패', error);

            // Redis 연결 실패 시 메모리 스토어로 폴백
            logger.warn('메모리 기반 세션 스토어로 폴백합니다.');

            const sessionConfig = this.config.getSessionConfig();
            const environment = this.config.getEnvironment();

            this.sessionConfig = {
                secret: sessionConfig.secret,
                resave: false,
                saveUninitialized: false,
                rolling: sessionConfig.rolling !== undefined ? sessionConfig.rolling : true,
                unset: sessionConfig.unset || 'destroy',
                name: sessionConfig.name || 'sessionId',
                proxy: sessionConfig.proxy !== undefined ? sessionConfig.proxy : environment === 'production',
                cookie: {
                    secure:
                        sessionConfig.cookie.secure !== undefined
                            ? sessionConfig.cookie.secure
                            : environment === 'production',
                    httpOnly: sessionConfig.cookie.httpOnly !== undefined ? sessionConfig.cookie.httpOnly : true,
                    maxAge: sessionConfig.cookie.maxAge || 24 * 60 * 60 * 1000,
                    sameSite: sessionConfig.cookie.sameSite || 'strict',
                    domain: sessionConfig.cookie.domain || undefined,
                    path: sessionConfig.cookie.path || '/'
                }
            };

            // 메모리 스토어에서도 안전한 세션 ID 생성
            if (sessionConfig.genid && typeof sessionConfig.genid === 'function') {
                this.sessionConfig.genid = sessionConfig.genid;
            } else if (environment === 'production') {
                const crypto = await import('crypto');
                this.sessionConfig.genid = () => {
                    return crypto.randomBytes(32).toString('hex');
                };
            }

            this.isInitialized = true;
            return this.sessionConfig;
        }
    }

    getSessionMiddleware() {
        if (!this.isInitialized || !this.sessionConfig) {
            throw new Error('세션 스토어가 초기화되지 않았습니다. initialize()를 먼저 호출하세요.');
        }
        return session(this.sessionConfig);
    }

    // Redis 연결 테스트 (다른 infrastructure 컴포넌트와 일관성 유지)
    async testConnection() {
        try {
            if (this.store && redisClient.isClientConnected()) {
                return await redisClient.testConnection();
            }
            logger.error('세션 스토어가 초기화되지 않았거나 Redis 클라이언트가 연결되지 않았습니다.');
            return false;
        } catch (error) {
            logger.error('세션 스토어 연결 테스트 실패', error);
            return false;
        }
    }

    // 기존 healthCheck 메서드는 testConnection의 별칭으로 유지
    async healthCheck() {
        return await this.testConnection();
    }

    async cleanup() {
        try {
            if (redisClient.isClientConnected()) {
                await redisClient.disconnect();
            }
        } catch (error) {
            logger.error('세션 스토어 정리 중 오류', error);
        }
    }
}

// 싱글톤 인스턴스
const sessionStore = new SessionStore();

// 세션 스토어 내보내기
export { sessionStore, SessionStore };
export default sessionStore;
