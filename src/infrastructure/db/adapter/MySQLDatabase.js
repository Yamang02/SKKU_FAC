import { Sequelize } from 'sequelize';
import { infrastructureConfig } from '../../../config/infrastructure.js';
import logger from '../../../common/utils/Logger.js';

// 데이터베이스 설정 가져오기
const dbConfig = infrastructureConfig.database.config;

// 데이터베이스 연결 설정 로깅
logger.info('=== 데이터베이스 연결 설정 ===');
logger.info(`환경: ${infrastructureConfig.environment}`);
logger.info(`호스트: ${dbConfig.host}`);
logger.info(`데이터베이스: ${dbConfig.database}`);
logger.info(`포트: ${dbConfig.port}`);
logger.info('===========================');

// connectionLimit이 유효한지 확인하고 기본값 설정
const connectionLimit = (dbConfig.connectionLimit && dbConfig.connectionLimit > 0) ? dbConfig.connectionLimit : 10;

// Sequelize 인스턴스 생성
const db = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
    host: dbConfig.host,
    dialect: 'mysql',
    port: dbConfig.port,
    logging: false,
    pool: {
        max: connectionLimit,
        min: parseInt(process.env.DB_POOL_MIN, 10) || 0,
        acquire: parseInt(process.env.DB_POOL_ACQUIRE, 10) || 30000,
        idle: parseInt(process.env.DB_POOL_IDLE, 10) || 10000
    },
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

// 초기 연결 테스트 실행
testConnection();

// sequelize 인스턴스 내보내기
export { db, testConnection };
