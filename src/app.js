import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import viewResolver from './presentation/view/ViewResolver.js';
import { setupContainer } from './infrastructure/di/setup.js';
import { createRouters } from './interface/router/RouterIndex.js';

// 리포지토리 imports
import ExhibitionRepository from './infrastructure/repository/ExhibitionRepository.js';
import ArtworkRepository from './infrastructure/repository/ArtworkRepository.js';
import NoticeRepositoryImpl from './infrastructure/repository/NoticeRepositoryImpl.js';
import CommentRepositoryImpl from './infrastructure/repository/CommentRepositoryImpl.js';
import UserRepositoryImpl from './infrastructure/repository/UserRepositoryImpl.js';

// 서비스 imports
import ExhibitionService from './domain/exhibition/service/ExhibitionService.js';
import ArtworkService from './domain/artwork/service/ArtworkService.js';
import NoticeService from './domain/notice/service/NoticeService.js';
import CommentService from './domain/comment/service/CommentService.js';
import UserService from './domain/user/service/UserService.js';
import HomeService from './domain/home/service/HomeService.js';

// 유스케이스 imports
import ExhibitionUseCase from './application/exhibition/ExhibitionUseCase.js';
import ArtworkUseCase from './application/artwork/ArtworkUseCase.js';
import NoticeUseCase from './application/notice/NoticeUseCase.js';
import UserUseCase from './application/user/UserUseCase.js';
import HomeUseCase from './application/home/HomeUseCase.js';

// 컨트롤러 imports
import ExhibitionController from './interface/controller/ExhibitionController.js';
import ArtworkController from './interface/controller/ArtworkController.js';
import NoticeController from './interface/controller/NoticeController.js';
import UserController from './interface/controller/UserController.js';
import AdminController from './interface/controller/AdminController.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MemoryStore = session.MemoryStore;

// 미들웨어 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'presentation/public')));

// 세션 설정
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: new MemoryStore(),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24시간
    }
}));

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

// 404 에러 처리
app.use((req, res) => {
    if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(404).json({ error: '페이지를 찾을 수 없습니다.' });
    }
    res.status(404).render('common/error', {
        title: '404 에러',
        message: '페이지를 찾을 수 없습니다.'
    });
});

// 500 에러 처리
app.use((err, req, res, _next) => {
    console.error(err.stack);
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
            : '서버 에러가 발생했습니다.'
    });
});

export default app;
