import express from 'express';
import flash from 'connect-flash';
import sessionStore from './infrastructure/session/SessionStore.js';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { pageTracker } from './common/middleware/PageTracker.js';
import { createUploadDirs } from './common/utils/createUploadDirs.js';
import methodOverride from 'method-override';
import { isAdmin } from './common/middleware/auth.js';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';

// swagger.json 파일 읽기
const swaggerFile = fs.readFileSync(path.resolve('./src/swagger.json'), 'utf8');
const swaggerDocument = JSON.parse(swaggerFile);

// 라우터 import
import { HomeRouter, ExhibitionRouter, ArtworkRouter, UserRouter, AdminRouter, AuthRouter } from './routeIndex.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 업로드 디렉토리 생성
createUploadDirs();


// 헬스체크 엔드포인트를 가장 먼저 등록
app.get('/health', async (req, res) => {
    try {
        const health = {
            status: 'OK',
            timestamp: new Date().toISOString(),
            services: {
                app: 'healthy',
                session: 'unknown',
                redis: 'unknown'
            }
        };

        // 세션 스토어 상태 확인
        try {
            const sessionHealthy = await sessionStore.healthCheck();
            health.services.session = sessionHealthy ? 'healthy' : 'degraded';
            health.services.redis = sessionHealthy ? 'healthy' : 'disconnected';
        } catch (error) {
            health.services.session = 'degraded';
            health.services.redis = 'error';
        }

        // 전체 상태 결정
        const allHealthy = Object.values(health.services).every(status => status === 'healthy');
        if (!allHealthy) {
            health.status = 'DEGRADED';
        }

        res.status(200).json(health);
    } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
});


// 보안 미들웨어
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ['\'self\''],
                scriptSrc: [
                    '\'self\'',
                    '\'unsafe-inline\'',
                    'https://developers.kakao.com',
                    'https://t1.kakaocdn.net',
                    'https://k.kakaocdn.net',
                    'https://cdn.jsdelivr.net',
                    'blob:'
                ],
                styleSrc: [
                    '\'self\'',
                    'https://cdnjs.cloudflare.com',
                    'https://fonts.googleapis.com',
                    '\'unsafe-inline\''
                ],
                fontSrc: [
                    '\'self\'',
                    'https://fonts.googleapis.com',
                    'https://cdnjs.cloudflare.com',
                    'https://fonts.gstatic.com',
                    '\'unsafe-inline\''
                ],
                imgSrc: [
                    '\'self\'',
                    'https://res.cloudinary.com/dw57ytzhg/',
                    'https://res.cloudinary.com/dvkr4k6n8/',
                    'data:',
                    'blob:'
                ],
                connectSrc: [
                    '\'self\'',
                    'https://developers.kakao.com',
                    'https://t1.kakaocdn.net',
                    'https://k.kakaocdn.net',
                    'https://cdn.jsdelivr.net'
                ],
                frameSrc: [
                    '\'self\'',
                    'https://developers.kakao.com'
                ],
                objectSrc: [
                    '\'self\'',
                    'https://developers.kakao.com'
                ],
                formAction: [
                    '\'self\'',
                    'https://*.kakao.com'
                ],
                workerSrc: [
                    '\'self\'',
                    'blob:'
                ],
                scriptSrcAttr: ['\'unsafe-inline\'']
            }
        },
        crossOriginEmbedderPolicy: false
    })
);

// HTTP → HTTPS 리디렉션 (프록시 환경 고려)
app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
        return res.redirect('https://' + req.headers.host + req.url);
    }
    next();
});


// Rate Limiter 설정
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15분
    max: 300, // IP당 최대 요청 수
    skip: (req) => req.path === '/health' // 헬스체크 엔드포인트 제외
});
app.use(limiter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


// Swagger UI 설정
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 미들웨어 설정
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP 메서드 재정의 미들웨어 등록
app.use(methodOverride('_method'));

// 정적 파일 제공 설정
const staticOptions = {
    setHeaders: (res, path) => {
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'text/javascript; charset=UTF-8');
            res.setHeader('X-Content-Type-Options', 'nosniff');
        }
        // 캐시 설정
        res.setHeader('Cache-Control', 'public, max-age=86400'); // 24시간
    }
};

app.use(express.static(path.join(__dirname, './public'), staticOptions));
app.use('/assets', express.static(path.join(__dirname, './public/assets'), staticOptions));
app.use('/css', express.static(path.join(__dirname, './public/css'), staticOptions));
app.use('/js', express.static(path.join(__dirname, './public/js'), staticOptions));
app.use('/images', express.static(path.join(__dirname, './public/images'), staticOptions));
app.use('/uploads', express.static(path.join(__dirname, './public/uploads'), staticOptions));


// Redis 세션 설정 초기화 및 적용 (비동기 처리)
const initializeSession = async () => {
    try {
        await sessionStore.initialize();
        app.use(sessionStore.getSessionMiddleware());
        console.log('✅ Redis 세션 스토어 설정 완료');
    } catch (error) {
        console.error('❌ Redis 세션 스토어 설정 실패:', error);
        // 폴백 처리는 SessionStore 내부에서 처리됨
        app.use(sessionStore.getSessionMiddleware());
    }
};

// 세션 초기화 실행
initializeSession();

// 프로덕션 환경에서 프록시 신뢰 설정
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

// Flash 메시지 미들웨어 등록
app.use(flash());

// 플래시 메시지를 res.locals에 추가
app.use((req, res, next) => {
    res.locals.messages = {
        success: req.flash('success'),
        error: req.flash('error'),
        info: req.flash('info'),
        warning: req.flash('warning')
    };
    next();
});

// 페이지 추적 미들웨어 등록
app.use(pageTracker);

// 뷰 엔진 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 전역 미들웨어 - 사용자 정보를 모든 뷰에서 사용 가능하게 설정
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    // XSS 방지를 위한 헤더 설정
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// 요청 로깅 미들웨어
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    });
    next();
});
/**
 * 이전 페이지 URL 결정
 */
const getReturnUrl = (req) => {
    const prevPage = req.session?.previousPage;

    if (req.originalUrl.startsWith('/admin')) {
        return '/admin';
    }

    if (prevPage && !prevPage.includes('/error')) {
        return prevPage;
    }

    return '/';
};

// 라우터 설정
app.use('/', HomeRouter);
app.use('/exhibition', ExhibitionRouter);
app.use('/artwork', ArtworkRouter);
app.use('/user', UserRouter);
app.use('/admin', isAdmin, AdminRouter);
app.use('/auth', AuthRouter);
console.log('✅ 라우터 설정 완료');

// 404 에러 처리
app.use((req, res) => {
    console.log(`404 Error - URL: ${req.originalUrl}`);
    const returnUrl = getReturnUrl(req);
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
app.use((err, req, res, _next) => {
    console.error(`500 Error - URL: ${req.originalUrl}, Error: ${err.message}`);
    const returnUrl = getReturnUrl(req);
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

export default app;

