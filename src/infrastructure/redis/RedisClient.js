import { createClient } from 'redis';
import { infrastructureConfig } from '../../config/infrastructureConfig.js';
import logger from '../../common/utils/Logger.js';

// Redis 설정을 환경변수에서 직접 가져오기 (암호화 우회)
const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    username: process.env.REDIS_USERNAME || null,
    password: process.env.REDIS_PASSWORD || null,
    db: parseInt(process.env.REDIS_DB, 10) || 0
};

const environment = infrastructureConfig.environment;

// Redis 연결 설정 로깅
logger.info('=== Redis 연결 설정 ===');
logger.info(`환경: ${environment}`);
logger.info(`호스트: ${redisConfig.host}`);
logger.info(`포트: ${redisConfig.port}`);
logger.info(`사용자명: ${redisConfig.username || 'N/A'}`);
logger.info(`패스워드 길이: ${redisConfig.password ? redisConfig.password.length : 0}자`);
logger.info(`데이터베이스: ${redisConfig.db}`);
if (process.env.REDIS_URL) {
    logger.info(`Redis URL: ${process.env.REDIS_URL.replace(/:[^@]*@/, ':***@')}`); // 패스워드 마스킹
}
logger.info('====================');

class RedisClient {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.connectionAttempted = false;
        this.connectionPromise = null; // 연결 프로미스를 저장하여 중복 연결 방지
    }

    async connect() {
        // 이미 연결되어 있으면 기존 클라이언트 반환
        if (this.isConnected && this.client && this.client.isReady) {
            logger.info(`[${environment.toUpperCase()}] Redis 클라이언트가 이미 연결되어 있습니다.`);
            return this.client;
        }

        // 연결 시도 중이면 기존 프로미스를 반환 (중복 연결 방지)
        if (this.connectionPromise) {
            logger.info(`[${environment.toUpperCase()}] Redis 연결 시도 중... 기존 프로미스를 대기합니다.`);
            return await this.connectionPromise;
        }

        // 새로운 연결 시도
        this.connectionPromise = this._performConnection();

        try {
            const result = await this.connectionPromise;
            this.connectionPromise = null; // 성공 시 프로미스 정리
            return result;
        } catch (error) {
            this.connectionPromise = null; // 실패 시 프로미스 정리
            throw error;
        }
    }

    async _performConnection() {
        this.connectionAttempted = true;

        try {
            // URL 형태로 연결 설정 (Redis 4.x 스타일)
            let redisUrl = process.env.REDIS_URL;

            if (!redisUrl) {
                redisUrl = 'redis://';
                if (redisConfig.username && redisConfig.password) {
                    redisUrl += `${redisConfig.username}:${redisConfig.password}@`;
                } else if (redisConfig.password) {
                    redisUrl += `:${redisConfig.password}@`;
                }
                redisUrl += `${redisConfig.host}:${redisConfig.port}`;
                if (redisConfig.db) {
                    redisUrl += `/${redisConfig.db}`;
                }
            }

            logger.info(`Redis 연결 시도: ${redisUrl.replace(/:[^@]*@/, ':***@')}`);

            // Redis Cloud는 TLS가 필요할 수 있음
            const clientOptions = {
                url: redisUrl,
                socket: {
                    connectTimeout: 15000, // 15초로 증가
                    lazyConnect: true,
                    tls: redisConfig.host.includes('.redis-cloud.com'), // Redis Cloud 감지시 TLS 활성화
                    reconnectStrategy: retries => {
                        if (retries > 5) {
                            logger.error(`[${environment.toUpperCase()}] Redis 연결 재시도 횟수 초과 (${retries})`);
                            return new Error('Redis 연결 실패');
                        }
                        const delay = Math.min(retries * 1000, 5000);
                        logger.warn(`[${environment.toUpperCase()}] Redis 재연결 시도 ${retries} (${delay}ms 후)`);
                        return delay;
                    }
                }
            };

            logger.info(`Redis 클라이언트 옵션: TLS=${clientOptions.socket.tls}, Timeout=${clientOptions.socket.connectTimeout}ms`);

            this.client = createClient(clientOptions);

            // 에러 핸들링
            this.client.on('error', err => {
                logger.error(`[${environment.toUpperCase()}] Redis 클라이언트 오류`, {
                    error: err.message || 'Unknown error',
                    code: err.code,
                    errno: err.errno,
                    name: err.name,
                    stack: err.stack ? err.stack.split('\n')[0] : 'No stack trace',
                    host: redisConfig.host,
                    port: redisConfig.port,
                    hasTLS: clientOptions.socket.tls
                });
                this.isConnected = false;
            });

            this.client.on('connect', () => {
                logger.success(`[${environment.toUpperCase()}] Redis 서버에 연결되었습니다.`);
                this.isConnected = true;
            });

            this.client.on('ready', () => {
                logger.success(`[${environment.toUpperCase()}] Redis 클라이언트가 준비되었습니다.`);
                this.isConnected = true;
            });

            this.client.on('end', () => {
                logger.info(`[${environment.toUpperCase()}] Redis 연결이 종료되었습니다.`);
                this.isConnected = false;
            });

            this.client.on('reconnecting', () => {
                logger.info(`[${environment.toUpperCase()}] Redis 재연결 중...`);
            });

            // 연결 시도
            await this.client.connect();

            logger.success(`[${environment.toUpperCase()}] Redis 연결 성공!`);
            return this.client;
        } catch (error) {
            logger.error(`[${environment.toUpperCase()}] Redis 연결 실패! 상세 정보`, {
                error: error.message,
                code: error.code,
                errno: error.errno,
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
                logger.info(`[${environment.toUpperCase()}] Redis 연결이 정상적으로 종료되었습니다.`);
            } catch (error) {
                logger.error(`[${environment.toUpperCase()}] Redis 연결 종료 중 오류`, error);
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
                logger.error(`[${environment.toUpperCase()}] Redis 클라이언트가 연결되지 않았습니다.`);
                return false;
            }
            await this.client.ping();
            logger.success(`[${environment.toUpperCase()}] Redis 연결 테스트 성공!`);
            return true;
        } catch (error) {
            logger.error(`[${environment.toUpperCase()}] Redis 연결 테스트 실패`, error);
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
