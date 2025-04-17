import { Sequelize } from 'sequelize';
import { infrastructureConfig } from '../../../config/infrastructure.js';

// 데이터베이스 설정 가져오기
const dbConfig = infrastructureConfig.database.config;

// 데이터베이스 연결 설정 로깅
console.log('=== 데이터베이스 연결 설정 ===');
console.log(`환경: ${infrastructureConfig.environment}`);
console.log(`호스트: ${dbConfig.host}`);
console.log(`데이터베이스: ${dbConfig.database}`);
console.log(`포트: ${dbConfig.port}`);
console.log('===========================');

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
        console.log('✅ 데이터베이스 연결 성공!');
        return true;
    } catch (error) {
        console.error('❌ 데이터베이스 연결 실패! 상세 정보:');
        console.error(`- 오류 메시지: ${error.message}`);
        console.error(`- 오류 유형: ${error.name}`);
        console.error(`- 사용 중인 DB 설정:
  - 호스트: ${dbConfig.host}
  - 데이터베이스: ${dbConfig.database}
  - 포트: ${dbConfig.port}`);

        if (error.original) {
            console.error(`- 원본 오류: ${error.original.code}`);
            console.error(`- SQL 상태: ${error.original.sqlState || 'N/A'}`);
        }

        return false;
    }
};

// 초기 연결 테스트 실행
testConnection();

// sequelize 인스턴스 내보내기
export { db, testConnection };
