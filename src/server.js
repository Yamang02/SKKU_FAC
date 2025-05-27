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

// Railway 환경 정보 출력
console.log('==== 환경 설정 정보 ====');
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`DB_HOST: ${process.env.DB_HOST}`);
console.log(`DB_NAME: ${process.env.DB_NAME}`);
console.log(`DB_PORT: ${process.env.DB_PORT}`);
console.log(`BASE_URL: ${process.env.BASE_URL}`);
console.log(`PORT 환경변수 있음: ${process.env.PORT ? 'Yes' : 'No'}`);
console.log('=====================');

// 동적으로 app 모듈 import
try {
    const { default: app } = await import('./app.js');
    const { default: sessionStore } = await import('./infrastructure/session/SessionStore.js');

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
        console.error(reason);
        process.exit(1);
    });

    // 서버 종료 시 정리 작업
    const gracefulShutdown = async (signal) => {
        console.log(`\n${signal} 신호를 받았습니다. 서버를 종료합니다...`);
        try {
            await sessionStore.cleanup();
            console.log('✅ Redis 연결이 정리되었습니다.');
        } catch (error) {
            console.error('❌ Redis 연결 정리 중 오류:', error);
        }
        process.exit(0);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    startServer();
} catch (error) {
    console.error('❌ 앱 모듈 임포트 실패:', error);
    process.exit(1);
}
