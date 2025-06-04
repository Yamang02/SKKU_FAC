import { Sequelize } from 'sequelize';
import Config from '../../../config/Config.js';
import logger from '../../../common/utils/Logger.js';

// Config 인스턴스 가져오기
const config = Config.getInstance();

// 데이터베이스 설정 가져오기
const dbConfig = config.getDatabaseConfig();
const environment = config.getEnvironment();

// 데이터베이스 연결 설정 로깅
logger.info('=== 데이터베이스 연결 설정 ===');
logger.info(`환경: ${environment}`);
logger.info(`호스트: ${dbConfig.host}`);
logger.info(`사용자: ${dbConfig.user}`);
logger.info(`데이터베이스: ${dbConfig.database}`);
logger.info(`포트: ${dbConfig.port}`);
logger.info('===========================');

// Sequelize 인스턴스 생성
const db = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
    host: dbConfig.host,
    dialect: 'mysql',
    port: dbConfig.port,
    logging: false,
    pool: dbConfig.pool,
    retry: {
        max: 3, // 최대 3번 재시도
        match: [
            /SequelizeConnectionError/,
            /SequelizeConnectionRefusedError/,
            /SequelizeHostNotFoundError/,
            /SequelizeHostNotReachableError/,
            /SequelizeInvalidConnectionError/,
            /SequelizeConnectionTimedOutError/,
            /TimeoutError/
        ]
    }
});

// 연결 테스트 함수
const testConnection = async () => {
    try {
        await db.authenticate();
        logger.success('데이터베이스 연결 성공!');
        return true;
    } catch (error) {
        logger.error('데이터베이스 연결 실패! 상세 정보', error, {
            host: dbConfig.host,
            database: dbConfig.database,
            port: dbConfig.port,
            originalCode: error.original?.code,
            sqlState: error.original?.sqlState
        });

        return false;
    }
};

/**
 * 연결 풀 상태 모니터링 함수
 * @returns {Object} 연결 풀 통계
 */
const getConnectionPoolStats = () => {
    try {
        const pool = db.connectionManager.pool;

        if (!pool) {
            return {
                available: false,
                message: '연결 풀이 초기화되지 않음'
            };
        }

        return {
            available: true,
            size: pool.size || 0,                    // 현재 연결 수
            availableConnections: pool.available || 0,          // 사용 가능한 연결 수
            using: pool.using || 0,                  // 사용 중인 연결 수
            waiting: pool.waiting || 0,              // 대기 중인 요청 수
            max: dbConfig.pool.max,                  // 최대 연결 수
            min: dbConfig.pool.min,                  // 최소 연결 수
            acquireTimeout: dbConfig.pool.acquire,   // 연결 획득 타임아웃
            idleTimeout: dbConfig.pool.idle,         // 유휴 타임아웃
            environment: environment
        };
    } catch (error) {
        logger.error('연결 풀 상태 조회 실패:', error);
        return {
            available: false,
            error: error.message
        };
    }
};

/**
 * 연결 풀 상태 로깅
 */
const logConnectionPoolStats = () => {
    const stats = getConnectionPoolStats();

    if (stats.available) {
        logger.info('=== 데이터베이스 연결 풀 상태 ===');
        logger.info(`환경: ${stats.environment}`);
        logger.info(`현재 연결 수: ${stats.size}/${stats.max}`);
        logger.info(`사용 가능: ${stats.availableConnections}, 사용 중: ${stats.using}`);
        logger.info(`대기 중인 요청: ${stats.waiting}`);
        logger.info(`설정 - 최소: ${stats.min}, 최대: ${stats.max}`);
        logger.info(`타임아웃 - 획득: ${stats.acquireTimeout}ms, 유휴: ${stats.idleTimeout}ms`);
        logger.info('================================');
    } else {
        logger.warn('연결 풀 상태 조회 불가:', stats.message || stats.error);
    }
};

/**
 * 연결 풀 헬스 체크
 * @returns {boolean} 연결 풀 상태가 정상인지 여부
 */
const checkConnectionPoolHealth = () => {
    const stats = getConnectionPoolStats();

    if (!stats.available) {
        return false;
    }

    // 연결 풀 건강성 체크
    const utilizationRate = stats.using / stats.max;
    const hasWaitingRequests = stats.waiting > 0;

    if (utilizationRate > 0.8) {
        logger.warn(`연결 풀 사용률이 높습니다: ${(utilizationRate * 100).toFixed(1)}%`);
    }

    if (hasWaitingRequests) {
        logger.warn(`대기 중인 연결 요청이 있습니다: ${stats.waiting}개`);
    }

    return utilizationRate < 0.9 && stats.waiting < 5; // 90% 미만, 대기 요청 5개 미만
};

// 초기 연결 테스트 실행
testConnection();

// 개발 환경에서는 주기적으로 연결 풀 상태 로깅 (5분마다)
if (environment === 'development') {
    setInterval(() => {
        logConnectionPoolStats();
    }, 5 * 60 * 1000); // 5분
}

// sequelize 인스턴스 내보내기
export { db, testConnection, getConnectionPoolStats, logConnectionPoolStats, checkConnectionPoolHealth };
