import express from 'express';
import exhibitionRouter from './exhibition/router.js';
import noticeRouter from './notice/router.js';
import userRouter from './user/router.js';
import artworkRouter from './artwork/router.js';
import homeRouter from './home/router.js';
import adminRouter from './admin/router.js';

/**
 * 라우터 인덱스
 * 모든 라우터를 중앙에서 관리하고 등록합니다.
 */
class RouterIndex {
    constructor() {
        this.router = express.Router();
        this.initializeRoutes();
    }

    /**
     * 모든 라우터를 초기화하고 등록합니다.
     */
    initializeRoutes() {
        // 홈페이지 라우터 등록 (최상위 경로이므로 가장 먼저 등록)
        this.router.use('/', homeRouter);

        // 각 도메인별 라우터 등록
        this.router.use('/exhibition', exhibitionRouter);
        this.router.use('/user', userRouter);
        this.router.use('/artwork', artworkRouter);
        this.router.use('/notice', noticeRouter);
        this.router.use('/admin', adminRouter);

        // 404 에러 처리
        this.router.use((req, res) => {
            if (req.xhr || req.headers.accept.includes('application/json')) {
                return res.status(404).json({ error: '페이지를 찾을 수 없습니다.' });
            }
            res.status(404).render('common/error', {
                title: '404 에러',
                message: '페이지를 찾을 수 없습니다.'
            });
        });

        // 500 에러 처리
        this.router.use((err, req, res, _next) => {
            console.error(err.stack);

            if (req.xhr || req.headers.accept.includes('application/json')) {
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
    }

    /**
     * Express 라우터를 반환합니다.
     */
    getRouter() {
        return this.router;
    }
}

export default new RouterIndex().getRouter();
