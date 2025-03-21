import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import router from './interface/router/RouterIndex.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MemoryStore = session.MemoryStore;  // 세션 저장소 추가

// 미들웨어 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 정적 파일 제공
app.use(express.static(path.join(__dirname, 'presentation/public'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        }
    }
}));

// 뷰 엔진 설정
app.set('views', path.join(__dirname, 'presentation/view'));
app.set('view engine', 'ejs');

// 세션 설정
app.use(session({
    secret: 'skku-fac-gallery-secret-key',
    resave: true,  // 세션을 항상 저장
    saveUninitialized: false,
    store: new MemoryStore(),  // 메모리에 세션 저장
    cookie: {
        httpOnly: true,
        secure: false,  // 개발 환경에서는 HTTP 사용
        maxAge: 24 * 60 * 60 * 1000, // 24시간
        path: '/'
    },
    name: 'sessionId'  // 세션 쿠키 이름 설정
}));

// 전역 미들웨어 - 사용자 정보를 모든 뷰에서 사용 가능하게 설정
app.use((req, res, next) => {
    console.log('\n[미들웨어] ---- 새 요청 시작 ----');
    console.log('[미들웨어] 요청 URL:', req.url);
    console.log('[미들웨어] 요청 메서드:', req.method);
    console.log('[미들웨어] 세션 ID:', req.sessionID);
    console.log('[미들웨어] 세션 정보:', req.session);
    console.log('[미들웨어] 세션의 user 정보:', req.session.user);
    res.locals.user = req.session.user || null;
    console.log('[미들웨어] locals에 설정된 정보:', res.locals.user);
    console.log('[미들웨어] ---- 요청 처리 시작 ----\n');
    next();
});

// 라우터 설정
app.use(router);

// 404 에러 핸들러
app.use((req, res) => {
    if (req.xhr || req.headers.accept.includes('application/json')) {
        return res.status(404).json({ error: '페이지를 찾을 수 없습니다.' });
    }
    res.status(404).render('common/error', {
        title: '404 에러',
        message: '페이지를 찾을 수 없습니다.'
    });
});

// 전역 에러 핸들러
app.use((err, req, res, _next) => {
    console.error('에러 발생:', err);

    if (req.xhr || req.headers.accept.includes('application/json')) {
        return res.status(500).json({ error: '서버 에러가 발생했습니다.' });
    }

    res.status(500).render('common/error', {
        title: '500 에러',
        message: '서버 에러가 발생했습니다.'
    });
});

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
