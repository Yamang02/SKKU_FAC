import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import { setupContainer } from './infrastructure/di/setup.js';
import { createRouters } from './interface/router/RouterIndex.js';
import { pageTracker } from './interface/middleware/PageTracker.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// 미들웨어 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/css', express.static(path.join(__dirname, 'presentation/public/css')));

// 세션 설정
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

// 페이지 추적 미들웨어 등록
app.use(pageTracker);

// 뷰 엔진 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'presentation/view'));

// 전역 미들웨어 - 사용자 정보를 모든 뷰에서 사용 가능하게 설정
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// 의존성 주입 설정
const container = setupContainer();

// 라우터 설정
app.use('/', createRouters(container));
console.log('라우터 설정 완료');

// 404 에러 처리
app.use((req, res) => {
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
    console.error(err.stack);
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
            ...err,
            stack: process.env.NODE_ENV === 'development' ? err.stack : null
        }
    });
});

export default app;
