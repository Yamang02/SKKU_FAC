import { createClient } from 'redis';
import { infrastructureConfig } from '../../config/infrastructureConfig.js';
import logger from '../../common/utils/Logger.js';

// Redis 설정 가져오기
const redisConfig = infrastructureConfig.redis.config;

// Redis 연결 설정 로깅
logger.info('=== Redis 연결 설정 ===');
logger.info(`환경: ${infrastructureConfig.environment}`);
logger.info(`호스트: ${redisConfig.host}`);
logger.info(`포트: ${redisConfig.port}`);
logger.info(`데이터베이스: ${redisConfig.db}`);
logger.info('====================');

class RedisClient {
    constructor() {
        this.client = null;
        this.isConnected = false;
    }

    async connect() {
        try {
            // URL 형태로 연결 설정 (Redis 4.x 스타일)
            let redisUrl = 'redis://';
            if (redisConfig.username && redisConfig.password) {
                redisUrl += `${redisConfig.username}:${redisConfig.password}@`;
            } else if (redisConfig.password) {
                redisUrl += `:${redisConfig.password}@`;
            }
            redisUrl += `${redisConfig.host}:${redisConfig.port}`;
            if (redisConfig.db) {
                redisUrl += `/${redisConfig.db}`;
            }

            this.client = createClient({
                url: redisUrl,
                socket: {
                    connectTimeout: 60000,
                    lazyConnect: true,
                    reconnectStrategy: retries => {
                        if (retries > 10) {
                            logger.error('Redis 연결 재시도 횟수 초과');
                            return new Error('Redis 연결 실패');
                        }
                        return Math.min(retries * 50, 500);
                    }
                }
            });

            // 에러 핸들링
            this.client.on('error', err => {
                logger.error('Redis 클라이언트 오류', err);
                this.isConnected = false;
            });

            this.client.on('connect', () => {
                logger.success('Redis 서버에 연결되었습니다.');
                this.isConnected = true;
            });

            this.client.on('ready', () => {
                logger.success('Redis 클라이언트가 준비되었습니다.');
                this.isConnected = true;
            });

            this.client.on('end', () => {
                logger.info('Redis 연결이 종료되었습니다.');
                this.isConnected = false;
            });

            // 연결 시도
            await this.client.connect();

            logger.success('Redis 연결 성공!');
            return this.client;
        } catch (error) {
            logger.error('Redis 연결 실패! 상세 정보', error, {
                host: redisConfig.host,
                port: redisConfig.port,
                database: redisConfig.db
            });

            this.isConnected = false;
            throw error;
        }
    }

    async disconnect() {
        if (this.client && this.isConnected) {
            try {
                await this.client.quit();
                logger.info('Redis 연결이 정상적으로 종료되었습니다.');
            } catch (error) {
                logger.error('Redis 연결 종료 중 오류', error);
                await this.client.disconnect();
            }
        }
    }

    getClient() {
        return this.client;
    }

    isClientConnected() {
        return this.isConnected && this.client && this.client.isReady;
    }

    // 헬스 체크 (MySQL의 testConnection과 유사한 패턴)
    async testConnection() {
        try {
            if (!this.isClientConnected()) {
                logger.error('Redis 클라이언트가 연결되지 않았습니다.');
                return false;
            }
            await this.client.ping();
            logger.success('Redis 연결 테스트 성공!');
            return true;
        } catch (error) {
            logger.error('Redis 연결 테스트 실패', error);
            return false;
        }
    }

    // 기존 healthCheck 메서드는 testConnection의 별칭으로 유지
    async healthCheck() {
        return await this.testConnection();
    }
}

// 싱글톤 인스턴스 생성 및 초기 연결 테스트
const redisClient = new RedisClient();

// Redis 클라이언트 내보내기
export { redisClient, RedisClient };
export default redisClient;
