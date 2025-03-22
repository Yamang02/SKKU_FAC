import * as dotenv from 'dotenv';
import app from './src/app.js';

// 환경 변수 로드
dotenv.config({ path: './config/.env' });

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});
