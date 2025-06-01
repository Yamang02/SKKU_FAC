import logger from './Logger.js';
import sessionStore from '../../infrastructure/session/SessionStore.js';
import Config from '../../config/Config.js';

class ServerManager {
    constructor(app) {
        this.app = app;
        this.server = null;
        this.isShuttingDown = false;
        this.handlersSetup = false;
        this.config = Config.getInstance();
    }

    /**
     * 서버 시작
     */
    start(port = this.config.getAppConfig().port, retryCount = 0) {
        const maxRetries = 3;

        try {
            this.server = this.app.listen(port, () => {
                logger.logServerStart(port);
            });

            // 포트 사용 중 에러 처리
            this.server.on('error', (error) => {
                if (error.code === 'EADDRINUSE') {
                    if (retryCount < maxRetries) {
                        logger.warn(`포트 ${port}가 이미 사용 중입니다. ${retryCount + 1}/${maxRetries} 재시도 중...`);
                        setTimeout(() => {
                            this.server.close();
                            this.start(port, retryCount + 1);
                        }, 2000 * (retryCount + 1)); // 점진적으로 대기 시간 증가
                    } else {
                        logger.error(`포트 ${port}를 ${maxRetries}번 시도했지만 여전히 사용 중입니다. 서버를 종료합니다.`);
                        process.exit(1);
                    }
                } else {
                    logger.error('서버 에러', error);
                    process.exit(1);
                }
            });

            // 프로세스 핸들러는 한 번만 설정
            if (retryCount === 0) {
                this.setupProcessHandlers();
            }

            return this.server;

        } catch (error) {
            logger.error('서버 시작 실패', error);
            process.exit(1);
        }
    }

    /**
     * 프로세스 에러 핸들러 설정
     */
    setupProcessHandlers() {
        // 이미 핸들러가 설정되어 있는지 확인
        if (this.handlersSetup) {
            return;
        }

        // 처리되지 않은 예외
        this.uncaughtExceptionHandler = (error) => {
            // EADDRINUSE 에러는 이미 처리했으므로 무시
            if (error.code === 'EADDRINUSE') {
                return;
            }
            console.error('🚨 UNCAUGHT EXCEPTION 상세 정보:');
            console.error('에러 메시지:', error.message);
            console.error('에러 스택:', error.stack);
            console.error('에러 타입:', error.constructor.name);
            logger.error('처리되지 않은 예외', error);
            this.gracefulShutdown('UNCAUGHT_EXCEPTION');
        };

        // 처리되지 않은 프로미스 거부
        this.unhandledRejectionHandler = (reason, promise) => {
            console.error('🚨 UNHANDLED REJECTION 상세 정보:');
            console.error('거부 이유:', reason);
            console.error('프로미스:', promise);
            logger.error('처리되지 않은 프로미스 거부', reason, {
                promise: promise.toString()
            });
            this.gracefulShutdown('UNHANDLED_REJECTION');
        };

        // 종료 신호 처리
        this.sigtermHandler = () => this.gracefulShutdown('SIGTERM');
        this.sigintHandler = () => this.gracefulShutdown('SIGINT');

        // 핸들러 등록
        process.on('uncaughtException', this.uncaughtExceptionHandler);
        process.on('unhandledRejection', this.unhandledRejectionHandler);
        process.on('SIGTERM', this.sigtermHandler);
        process.on('SIGINT', this.sigintHandler);

        this.handlersSetup = true;
        logger.info('프로세스 에러 핸들러 설정 완료');
    }

    /**
     * 우아한 종료
     */
    async gracefulShutdown(signal) {
        if (this.isShuttingDown) {
            logger.warn('이미 종료 과정이 진행 중입니다.');
            return;
        }

        this.isShuttingDown = true;
        logger.info(`${signal} 신호를 받았습니다. 서버를 종료합니다...`);

        try {
            // 1. 새로운 연결 차단
            if (this.server) {
                this.server.close(() => {
                    logger.info('HTTP 서버가 종료되었습니다.');
                });
            }

            // 2. 세션 스토어 정리
            await this.cleanupSessionStore();

            // 3. 기타 리소스 정리
            await this.cleanupResources();

            logger.success('서버가 정상적으로 종료되었습니다.');
            process.exit(0);

        } catch (error) {
            logger.error('서버 종료 중 오류 발생', error);
            process.exit(1);
        }
    }

    /**
     * 세션 스토어 정리
     */
    async cleanupSessionStore() {
        try {
            await sessionStore.cleanup();
            logger.success('Redis 연결이 정리되었습니다.');
        } catch (error) {
            logger.error('Redis 연결 정리 중 오류', error);
        }
    }

    /**
     * 기타 리소스 정리
     */
    async cleanupResources() {
        // 필요시 다른 리소스 정리 로직 추가
        logger.info('리소스 정리 완료');
    }

    /**
     * 서버 상태 확인
     */
    isRunning() {
        return this.server && this.server.listening;
    }

    /**
     * 서버 인스턴스 반환
     */
    getServer() {
        return this.server;
    }
}

export default ServerManager;
