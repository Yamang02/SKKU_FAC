import express from 'express';
import session from 'express-session';
import flash from 'connect-flash';
import path from 'path';
import { fileURLToPath } from 'url';
import { pageTracker } from './middleware/PageTracker.js';
import { createUploadDirs } from './utils/createUploadDirs.js';
import basicAuth from 'express-basic-auth';

// 라우터 import
import homeRouter from './routes/home/HomeRouter.js';
import noticeRouter from './routes/notice/NoticeRouter.js';
import exhibitionRouter from './routes/exhibition/ExhibitionRouter.js';
import artworkRouter from './routes/artwork/ArtworkRouter.js';
import userRouter from './routes/user/UserRouter.js';
import adminRouter from './routes/admin/AdminRouter.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 업로드 디렉토리 생성
createUploadDirs();

// 환경 변수에서 인증 정보 가져오기
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'skku2024';

// 개발 환경 또는 명시적으로 활성화된 경우에만 기본 인증 적용
if (process.env.NODE_ENV === 'production' || process.env.ENABLE_AUTH === 'true') {
    app.use(basicAuth({
        users: { [ADMIN_USER]: ADMIN_PASSWORD },
        challenge: true,
        realm: 'SKKU Gallery Development Preview',
    }));
}

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
app.use(express.static(path.join(__dirname, '../public')));
app.use('/css', express.static(path.join(__dirname, '../public/css')));
app.use('/js', express.static(path.join(__dirname, '../public/js')));
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// 세션 설정
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24시간
    },
    name: 'sessionId',
    rolling: true
}));

// Flash 메시지 미들웨어 등록
app.use(flash());

// 페이지 추적 미들웨어 등록
app.use(pageTracker);

// 뷰 엔진 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 전역 미들웨어 - 사용자 정보를 모든 뷰에서 사용 가능하게 설정
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// 요청에 대한 로그 추가
app.use((req, res, next) => {
    console.log(`Request URL: ${req.originalUrl}, Method: ${req.method}`);
    next();
});

// 라우터 설정
app.use('/', homeRouter);
app.use('/notice', noticeRouter);
app.use('/exhibition', exhibitionRouter);
app.use('/artwork', artworkRouter);
app.use('/user', userRouter);
app.use('/admin', adminRouter);

console.log('라우터 설정 완료');

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
