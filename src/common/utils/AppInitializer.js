import logger from './Logger.js';
import sessionStore from '../../infrastructure/session/SessionStore.js';

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
        // 404 에러 처리
        this.app.use((req, res) => {
            logger.debug(`404 Error - URL: ${req.originalUrl}`);
            const returnUrl = this.getReturnUrl(req);
            const isAdminPath = req.originalUrl.startsWith('/admin');

            if (req.xhr || req.headers.accept?.includes('application/json')) {
                return res.status(404).json({ error: '페이지를 찾을 수 없습니다.' });
            }
            res.status(404).render('common/error', {
                title: '404 에러',
                message: '페이지를 찾을 수 없습니다.',
                returnUrl,
                isAdminPath,
                error: {
                    code: 404,
                    stack: null
                }
            });
        });

        // 500 에러 처리
        this.app.use((err, req, res, _next) => {
            logger.error(`500 Error - URL: ${req.originalUrl}`, err);
            const returnUrl = this.getReturnUrl(req);
            const isAdminPath = req.originalUrl.startsWith('/admin');

            if (req.xhr || req.headers.accept?.includes('application/json')) {
                return res.status(500).json({
                    error: process.env.NODE_ENV === 'development'
                        ? err.message
                        : '서버 에러가 발생했습니다.'
                });
            }
            res.status(500).render('common/error', {
                title: '500 에러',
                message: process.env.NODE_ENV === 'development'
                    ? err.message
                    : '서버 에러가 발생했습니다.',
                returnUrl,
                isAdminPath,
                error: {
                    code: 500,
                    stack: process.env.NODE_ENV === 'development' ? err.stack : null
                }
            });
        });

        logger.success('에러 핸들러 설정 완료');
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
