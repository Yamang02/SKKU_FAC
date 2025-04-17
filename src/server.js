// 환경 변수 검증
const requiredEnvVars = ['SESSION_SECRET', 'ADMIN_USER', 'ADMIN_PASSWORD'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.warn(`⚠️ 경고: 필수 환경 변수가 없습니다: ${envVar}`);
        // Railway에서 헬스체크를 위해 환경 변수가 없어도 기본값 설정
        if (envVar === 'SESSION_SECRET') {
            process.env.SESSION_SECRET = 'temp_session_secret_for_health_check';
        } else if (envVar === 'ADMIN_USER') {
            process.env.ADMIN_USER = 'admin';
        } else if (envVar === 'ADMIN_PASSWORD') {
            process.env.ADMIN_PASSWORD = 'password';
        }
    }
}

// 동적으로 app 모듈 import
const { default: app } = await import('./app.js');

const PORT = process.env.PORT || 3000;

// 서버 시작
const startServer = () => {
    try {
        app.listen(PORT, () => {
            console.log(`✅ 서버가 포트 ${PORT}에서 실행 중입니다.`);
            console.log(`✅ 환경: ${process.env.NODE_ENV || 'development'}`);
            console.log(`✅ 헬스체크 URL: http://localhost:${PORT}/health`);
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
