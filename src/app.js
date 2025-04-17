import express from 'express';
import session from 'express-session';
import flash from 'connect-flash';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { pageTracker } from './common/middleware/PageTracker.js';
import { createUploadDirs } from './common/utils/createUploadDirs.js';
import methodOverride from 'method-override';
import { isAdmin } from './common/middleware/auth.js';

// 라우터 import
import { HomeRouter, ExhibitionRouter, ArtworkRouter, UserRouter, AdminRouter, AuthRouter } from './routeIndex.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 업로드 디렉토리 생성
createUploadDirs();

// 헬스체크 엔드포인트를 가장 먼저 등록
// 헬스체크 엔드포인트를 가장 먼저 등록
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// 보안 미들웨어
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ['\'self\''],
            scriptSrc: ['\'self\'', '\'unsafe-inline\''],
            styleSrc: ['\'self\'', 'https://cdnjs.cloudflare.com', 'https://fonts.googleapis.com', '\'unsafe-inline\''],
            fontSrc: ['\'self\'', 'https://fonts.googleapis.com', 'https://cdnjs.cloudflare.com', 'https://fonts.gstatic.com', '\'unsafe-inline\''],
            imgSrc: ['\'self\'', 'https://res.cloudinary.com/dw57ytzhg/', 'data:', 'blob:']
        }
    },
    crossOriginEmbedderPolicy: false
}));

// Rate Limiter 설정 (헬스체크 엔드포인트는 제외)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15분
    max: 300, // IP당 최대 요청 수
    skip: (req) => req.path === '/health' // 헬스체크 엔드포인트 제외
});
app.use(limiter);

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


// 세션 설정
const sessionConfig = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24시간
        sameSite: 'strict'
    },
    name: 'sessionId',
    rolling: true
};

if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1); // nginx 등의 프록시 사용 시 필요
    sessionConfig.cookie.secure = true;
}

app.use(session(sessionConfig));

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
