import express from 'express';
import { createHomeRouter } from './home/HomeRouter.js';
import { createUserRouter } from './user/UserRouter.js';
import { createExhibitionRouter } from './exhibition/ExhibitionRouter.js';
import { createArtworkRouter } from './artwork/ArtworkRouter.js';
import { createNoticeRouter } from './notice/NoticeRouter.js';
import { createAdminRouter } from './admin/AdminRouter.js';

export const createRouters = (container) => {
    const router = express.Router();

    // 공통 페이지 라우트
    router.get('/about', (req, res) => {
        res.render('common/AboutPage', {
            title: '소개'
        });
    });

    // 홈 라우터
    router.use('/', createHomeRouter(container));

    // 전시회 라우터
    router.use('/exhibition', createExhibitionRouter(container));

    // 작품 라우터
    router.use('/artwork', createArtworkRouter(container));

    // 공지사항 라우터
    router.use('/notice', createNoticeRouter(container));

    // 사용자 라우터
    router.use('/user', createUserRouter(container));

    // 관리자 라우터
    router.use('/admin', createAdminRouter(container));

    return router;
};
