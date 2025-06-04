import { createClient } from 'redis';
import { infrastructureConfig } from '../../config/infrastructureConfig.js';
import logger from '../../common/utils/Logger.js';

// Redis 설정을 환경변수에서 직접 가져오기 (암호화 우회)
// Redis Cloud의 경우 호스트명에 포트가 포함될 수 있음
const rawHost = process.env.REDIS_HOST || 'localhost';
const hostParts = rawHost.split('.');
const extractedPort = hostParts[0].includes('-') ? hostParts[0].split('-').pop() : null;

const redisConfig = {
    host: rawHost,
    // Redis Cloud의 경우 호스트명에서 포트 추출 시도, 아니면 환경변수 또는 기본값 사용
    port: parseInt(process.env.REDIS_PORT, 10) || (extractedPort ? parseInt(extractedPort, 10) : 6379),
    username: process.env.REDIS_USERNAME || 'default', // Redis Cloud는 보통 default 사용자 사용
    password: process.env.REDIS_PASSWORD || null,
    db: parseInt(process.env.REDIS_DB, 10) || 0
};

const environment = infrastructureConfig.environment;

// Redis 연결 설정 로깅 (상세 디버깅 정보 포함)
logger.info('=== Redis 연결 설정 (상세 디버깅) ===');
logger.info(`환경: ${environment}`);
logger.info(`원본 REDIS_HOST: "${process.env.REDIS_HOST || 'undefined'}"`);
logger.info(`원본 REDIS_PORT: "${process.env.REDIS_PORT || 'undefined'}"`);
logger.info(`원본 REDIS_USERNAME: "${process.env.REDIS_USERNAME || 'undefined'}"`);
logger.info(`원본 REDIS_PASSWORD: ${process.env.REDIS_PASSWORD ? `설정됨 (${process.env.REDIS_PASSWORD.length}자)` : '설정되지 않음'}`);
logger.info(`원본 REDIS_DB: "${process.env.REDIS_DB || 'undefined'}"`);
logger.info(`원본 REDIS_URL: ${process.env.REDIS_URL ? `설정됨 (${process.env.REDIS_URL.length}자)` : '설정되지 않음'}`);
logger.info('--- 파싱된 설정 ---');
logger.info(`파싱된 호스트: "${redisConfig.host}"`);
logger.info(`파싱된 포트: ${redisConfig.port} (타입: ${typeof redisConfig.port})`);
logger.info(`파싱된 사용자명: "${redisConfig.username}"`);
logger.info(`파싱된 패스워드: ${redisConfig.password ? `설정됨 (${redisConfig.password.length}자)` : '설정되지 않음'}`);
logger.info(`파싱된 데이터베이스: ${redisConfig.db} (타입: ${typeof redisConfig.db})`);
logger.info(`추출된 포트 (호스트명에서): ${extractedPort || 'N/A'}`);
logger.info(`Redis Cloud 감지: ${rawHost.includes('.redis-cloud.com')}`);
logger.info('====================================');

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
            // URL 형태로 연결 설정 (Redis Cloud 최적화)
            let redisUrl = process.env.REDIS_URL;

            if (!redisUrl) {
                // Redis Cloud는 TLS를 사용하므로 rediss:// 프로토콜 사용
                const isRedisCloud = redisConfig.host.includes('.redis-cloud.com');
                const protocol = isRedisCloud ? 'rediss://' : 'redis://';

                redisUrl = protocol;

                // Redis Cloud는 username:password 형식 필요
                if (redisConfig.username && redisConfig.password) {
                    redisUrl += `${redisConfig.username}:${redisConfig.password}@`;
                } else if (redisConfig.password) {
                    redisUrl += `:${redisConfig.password}@`;
                }

                redisUrl += `${redisConfig.host}:${redisConfig.port}`;

                if (redisConfig.db && redisConfig.db !== 0) {
                    redisUrl += `/${redisConfig.db}`;
                }
            }

            logger.info('=== Redis 연결 시도 상세 정보 ===');
            logger.info(`최종 연결 URL: ${redisUrl.replace(/:[^@]*@/, ':***@')}`);
            logger.info(`URL 구성 방식: ${process.env.REDIS_URL ? 'REDIS_URL 환경변수 사용' : '개별 환경변수로 구성'}`);

            // Redis Cloud 최적화 설정
            const isRedisCloud = redisConfig.host.includes('.redis-cloud.com');
            const isTLS = redisUrl.startsWith('rediss://');

            logger.info(`Redis Cloud 감지: ${isRedisCloud}`);
            logger.info(`TLS 사용: ${isTLS} (프로토콜: ${redisUrl.split('://')[0]})`);
            logger.info(`호스트 분석: "${redisConfig.host}"`);
            logger.info(`포트 분석: ${redisConfig.port}`);

            const clientOptions = {
                url: redisUrl,
                socket: {
                    connectTimeout: 20000, // 20초로 증가 (Redis Cloud는 느릴 수 있음)
                    lazyConnect: true,
                    tls: isTLS,
                    rejectUnauthorized: !isRedisCloud, // Redis Cloud는 인증서 검증 문제가 있을 수 있음
                    reconnectStrategy: retries => {
                        if (retries > 3) { // 재시도 횟수 줄임
                            logger.error(`[${environment.toUpperCase()}] Redis 연결 재시도 횟수 초과 (${retries})`);
                            return new Error('Redis 연결 실패');
                        }
                        const delay = Math.min(retries * 2000, 8000); // 지연 시간 증가
                        logger.warn(`[${environment.toUpperCase()}] Redis 재연결 시도 ${retries} (${delay}ms 후)`);
                        return delay;
                    }
                }
            };

            logger.info('--- 클라이언트 옵션 ---');
            logger.info(`TLS 활성화: ${clientOptions.socket.tls}`);
            logger.info(`연결 타임아웃: ${clientOptions.socket.connectTimeout}ms`);
            logger.info(`Lazy Connect: ${clientOptions.socket.lazyConnect}`);
            logger.info(`인증서 검증: ${clientOptions.socket.rejectUnauthorized}`);
            logger.info(`Redis Cloud 최적화: ${isRedisCloud}`);
            logger.info('=========================');

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
