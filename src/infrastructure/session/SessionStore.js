import session from 'express-session';
import { RedisStore } from 'connect-redis';
import redisClient from '../redis/RedisClient.js';
import { infrastructureConfig } from '../../config/infrastructure.js';
import logger from '../../common/utils/Logger.js';

// Redis 설정 가져오기
const redisConfig = infrastructureConfig.redis.config;

class SessionStore {
    constructor() {
        this.store = null;
        this.sessionConfig = null;
    }

    async initialize() {
        try {
            // Redis 클라이언트 연결
            await redisClient.connect();

            // Redis 스토어 생성
            this.store = new RedisStore({
                client: redisClient.getClient(),
                prefix: 'sess:',
                ttl: redisConfig.ttl, // 세션 만료 시간 (초)
                disableTouch: false,
                disableTTL: false
            });

            // 세션 설정
            this.sessionConfig = {
                store: this.store,
                secret: process.env.SESSION_SECRET || 'your-secret-key-here',
                resave: false,
                saveUninitialized: false,
                rolling: true,
                cookie: {
                    secure: infrastructureConfig.environment === 'production',
                    httpOnly: true,
                    maxAge: redisConfig.ttl * 1000, // 밀리초로 변환
                    sameSite: 'strict'
                },
                name: 'sessionId'
            };

            // 프로덕션 환경에서 추가 설정
            if (infrastructureConfig.environment === 'production') {
                this.sessionConfig.cookie.secure = true;
                this.sessionConfig.proxy = true; // nginx 등의 프록시 사용 시
            }

            logger.success('Redis 세션 스토어가 초기화되었습니다.');
            return this.sessionConfig;

        } catch (error) {
            logger.error('Redis 세션 스토어 초기화 실패', error);

            // Redis 연결 실패 시 메모리 스토어로 폴백
            logger.warn('메모리 기반 세션 스토어로 폴백합니다.');
            this.sessionConfig = {
                secret: process.env.SESSION_SECRET || 'your-secret-key-here',
                resave: false,
                saveUninitialized: false,
                rolling: true,
                cookie: {
                    secure: infrastructureConfig.environment === 'production',
                    httpOnly: true,
                    maxAge: 24 * 60 * 60 * 1000, // 24시간
                    sameSite: 'strict'
                },
                name: 'sessionId'
            };

            return this.sessionConfig;
        }
    }

    getSessionMiddleware() {
        if (!this.sessionConfig) {
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
