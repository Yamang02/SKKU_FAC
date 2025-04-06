import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(process.env.DB_URL, {
    dialect: 'mysql',
    logging: console.log, // SQL 쿼리 로깅
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

// 연결 테스트 함수
export async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('데이터베이스 연결이 성공적으로 설정되었습니다.');
    } catch (error) {
        console.error('데이터베이스 연결에 실패했습니다:', error);
    }
}

export { sequelize };
