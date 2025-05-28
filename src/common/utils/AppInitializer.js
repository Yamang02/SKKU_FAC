import logger from './Logger.js';
import sessionStore from '../../infrastructure/session/SessionStore.js';
import ErrorHandler from '../middleware/ErrorHandler.js';
import { railwayErrorHandlerConfig } from '../../config/railwayMonitoringConfig.js';

class AppInitializer {
    constructor(app) {
        this.app = app;
        this.initialized = false;
    }

    /**
     * 애플리케이션 초기화
     */
    async initialize() {
        try {
            logger.info('애플리케이션 초기화 시작');

            // 1. 세션 초기화
            await this.initializeSession();

            // 2. 세션 의존 미들웨어 설정
            this.setupSessionDependentMiddleware();

            // 3. 라우터 설정
            this.setupRoutes();

            // 4. 에러 핸들러 설정
            this.setupErrorHandlers();

            this.initialized = true;
            logger.success('애플리케이션 초기화 완료');

        } catch (error) {
            logger.error('애플리케이션 초기화 실패', error);
            throw error;
        }
    }

    /**
     * 세션 초기화
     */
    async initializeSession() {
        try {
            await sessionStore.initialize();
            this.app.use(sessionStore.getSessionMiddleware());
            logger.success('Redis 세션 스토어 설정 완료');
        } catch (error) {
            logger.error('Redis 세션 스토어 설정 실패', error);
            // 폴백 처리는 SessionStore 내부에서 처리됨
            this.app.use(sessionStore.getSessionMiddleware());
            logger.info('폴백 세션 설정 완료');
        }
    }

    /**
     * 세션 의존 미들웨어 설정
     */
    setupSessionDependentMiddleware() {
        const { setupFlashMiddleware, setupViewEngine, setupGlobalMiddleware, setupLoggingMiddleware } = this.getMiddlewareSetupFunctions();

        setupFlashMiddleware(this.app);
        setupViewEngine(this.app);
        setupGlobalMiddleware(this.app);
        setupLoggingMiddleware(this.app);

        logger.success('세션 의존 미들웨어 설정 완료');
    }

    /**
     * 라우터 설정
     */
    setupRoutes() {
        const { HomeRouter, ExhibitionRouter, ArtworkRouter, UserRouter, AdminRouter, AuthRouter } = this.getRouters();
        const { isAdmin } = this.getMiddleware();

        this.app.use('/', HomeRouter);
        this.app.use('/exhibition', ExhibitionRouter);
        this.app.use('/artwork', ArtworkRouter);
        this.app.use('/user', UserRouter);
        this.app.use('/admin', isAdmin, AdminRouter);
        this.app.use('/auth', AuthRouter);

        logger.success('라우터 설정 완료');
    }

    /**
     * 에러 핸들러 설정
     */
    setupErrorHandlers() {
        // Railway 최적화 설정을 적용한 ErrorHandler 생성
        const { errorHandler, notFoundHandler, handler } = ErrorHandler.create(railwayErrorHandlerConfig);

        // 핸들러 인스턴스를 앱에 저장 (동적 설정 변경을 위해)
        this.app.set('errorHandler', handler);

        // 404 에러 처리
        this.app.use(notFoundHandler);

        // 전체 에러 처리
        this.app.use(errorHandler);

        logger.success('Railway 최적화 에러 핸들러 설정 완료');
        logger.debug('에러 핸들러 설정', {
            environment: process.env.NODE_ENV,
            customHandlers: Object.keys(railwayErrorHandlerConfig.customHandlers || {}).length,
            filterRules: Object.keys(railwayErrorHandlerConfig.filterRules || {}).length,
            transformRules: Object.keys(railwayErrorHandlerConfig.transformRules || {}).length,
            errorReporter: !!railwayErrorHandlerConfig.errorReporter
        });
    }

    /**
     * 이전 페이지 URL 결정
     */
    getReturnUrl(req) {
        const prevPage = req.session?.previousPage;

        if (req.originalUrl.startsWith('/admin')) {
            return '/admin';
        }

        if (prevPage && !prevPage.includes('/error')) {
            return prevPage;
        }

        return '/';
    }

    /**
     * 미들웨어 설정 함수들 반환 (외부에서 주입)
     */
    getMiddlewareSetupFunctions() {
        // 이 함수들은 app.js에서 주입받을 예정
        throw new Error('미들웨어 설정 함수들이 주입되지 않았습니다.');
    }

    /**
     * 라우터들 반환 (외부에서 주입)
     */
    getRouters() {
        // 이 함수는 app.js에서 주입받을 예정
        throw new Error('라우터들이 주입되지 않았습니다.');
    }

    /**
     * 미들웨어들 반환 (외부에서 주입)
     */
    getMiddleware() {
        // 이 함수는 app.js에서 주입받을 예정
        throw new Error('미들웨어들이 주입되지 않았습니다.');
    }

    /**
     * 초기화 상태 확인
     */
    isInitialized() {
        return this.initialized;
    }
}

export default AppInitializer;
