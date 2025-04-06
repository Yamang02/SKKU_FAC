import * as dotenv from 'dotenv';
import app from './src/app.js';

// 환경 변수 로드
const envFile = process.env.NODE_ENV === 'production' ? '.env.remote' : '.env.local';
dotenv.config({ path: envFile });

const PORT = process.env.PORT || 3000;

// 서버 시작
const startServer = () => {
    try {
        app.listen(PORT, () => {
            console.log(`✅ 서버가 포트 ${PORT}에서 실행 중입니다.`);
            console.log(`✅ 환경: ${process.env.NODE_ENV || 'development'}`);
            console.log(`✅ 설정 파일: ${envFile}`);
        });
    } catch (error) {
        console.error('❌ 서버 시작 실패:', error);
        process.exit(1);
    }
};

// 프로세스 에러 처리
process.on('uncaughtException', (error) => {
    console.error('❌ 처리되지 않은 예외:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    console.error('❌ 처리되지 않은 프로미스 거부:', reason);
    process.exit(1);
});

startServer();
