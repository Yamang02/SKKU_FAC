import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Railway에서 모니터링 제공

// 유틸리티 및 설정
import logger from './common/utils/Logger.js';
import AppInitializer from './common/utils/AppInitializer.js';
import { setupBasicMiddleware } from './common/middleware/setupMiddleware.js';
import Config from './config/Config.js';

// 캐시 매니저
import getCacheManager from './common/cache/getCacheManager.js';

// 라우터
import { createRouters } from './routeIndex.js';
import { isAdmin } from './common/middleware/auth.js';
import flash from 'connect-flash';

// Railway에서 모니터링 제공하므로 Sentry 제거

// CacheManager 초기화 (import 시점에 싱글톤 생성됨)
getCacheManager();

// Swagger 문서 로드
import fs from 'fs';
import swaggerUi from 'swagger-ui-express';
const swaggerDocument = JSON.parse(fs.readFileSync(path.resolve('./src/swagger.json'), 'utf8'));

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Config 인스턴스를 앱에 저장
const config = Config.getInstance();
app.set('config', config);

// Railway에서 모니터링 제공하므로 제거됨

// 헬스체크 엔드포인트
import CommonRouter from './domain/common/controller/CommonRouter.js';
app.use('/', CommonRouter);

// 기본 미들웨어 설정 (극도로 최소화)
setupBasicMiddleware(app);

// 애플리케이션 초기화
const appInitializer = new AppInitializer(app);

// 미들웨어 설정 함수들을 AppInitializer에 주입
appInitializer.getMiddlewareSetupFunctions = () => ({
    setupFlashMiddleware: app => {
        app.use(flash());
        app.use((req, res, next) => {
            res.locals.messages = {
                success: req.flash('success'),
                error: req.flash('error'),
                info: req.flash('info'),
                warning: req.flash('warning')
            };
            next();
        });
    },
    setupViewEngine: app => {
        app.set('view engine', 'ejs');
        app.set('views', path.join(__dirname, 'views'));
    },
    setupGlobalMiddleware: app => {
        app.use((req, res, next) => {
            res.locals.user = req.session?.user || null;
            next();
        });
    },
    setupLoggingMiddleware: app => {
        app.use((req, res, next) => {
            const start = Date.now();
            res.on('finish', () => {
                const duration = Date.now() - start;
                logger.http(req, res, duration);
            });
            next();
        });
    }
});

// 라우터들을 AppInitializer에 주입
appInitializer.getRouterFactory = () => ({
    createRouters
});

// 미들웨어들을 AppInitializer에 주입
appInitializer.getMiddleware = () => ({
    isAdmin
});

// 애플리케이션 초기화 실행
appInitializer.initialize();

// Swagger UI 설정
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Railway에서 에러 처리 제공

export default app;
