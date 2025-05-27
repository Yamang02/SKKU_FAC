import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 유틸리티 및 설정
import logger from './common/utils/Logger.js';
import AppInitializer from './common/utils/AppInitializer.js';
import { setupBasicMiddleware } from './common/middleware/setupMiddleware.js';

// 라우터
import { HomeRouter, ExhibitionRouter, ArtworkRouter, UserRouter, AdminRouter, AuthRouter, CommonRouter } from './routeIndex.js';
import { pageTracker } from './common/middleware/PageTracker.js';
import { isAdmin } from './common/middleware/auth.js';
import flash from 'connect-flash';

// Swagger 문서 로드
const swaggerDocument = JSON.parse(
    fs.readFileSync(path.resolve('./src/swagger.json'), 'utf8')
);

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 헬스체크 엔드포인트 (가장 먼저 등록)
app.use('/', CommonRouter);

// 기본 미들웨어 설정
setupBasicMiddleware(app, swaggerDocument);


// 애플리케이션 초기화
const appInitializer = new AppInitializer(app);

// 미들웨어 설정 함수들을 AppInitializer에 주입
appInitializer.getMiddlewareSetupFunctions = () => ({
    setupFlashMiddleware: (app) => {
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
    setupViewEngine: (app) => {
        app.set('view engine', 'ejs');
        app.set('views', path.join(__dirname, 'views'));
    },
    setupGlobalMiddleware: (app) => {
        app.use(pageTracker);
        app.use((req, res, next) => {
            res.locals.user = req.session?.user || null;
            res.setHeader('X-XSS-Protection', '1; mode=block');
            next();
        });
    },
    setupLoggingMiddleware: (app) => {
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
appInitializer.getRouters = () => ({
    HomeRouter, ExhibitionRouter, ArtworkRouter, UserRouter, AdminRouter, AuthRouter
});

// 미들웨어들을 AppInitializer에 주입
appInitializer.getMiddleware = () => ({
    isAdmin
});

// 애플리케이션 초기화 실행
appInitializer.initialize();


export default app;

