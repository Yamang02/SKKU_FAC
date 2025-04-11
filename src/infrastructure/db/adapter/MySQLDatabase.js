import { Sequelize } from 'sequelize';
import { infrastructureConfig } from '../../../config/infrastructure.js';

// 데이터베이스 설정 가져오기
const dbConfig = infrastructureConfig.database.config;

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
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

// 연결 테스트 함수
const testConnection = async () => {
    try {
        await db.authenticate();
        console.log('데이터베이스 연결 성공!');
    } catch (error) {
        console.error('데이터베이스 연결 실패:', error);
    }
};

// 연결 테스트 실행
testConnection();

// sequelize 인스턴스 내보내기
export { db };
