import express from 'express';
import exhibitionRouter from './exhibition/router.js';
import noticeRouter from './notice/router.js';
import userRouter from './user/router.js';
import artworkRouter from './artwork/router.js';
import homeRouter from './home/router.js';
import adminRouter from './admin/router.js';

const router = express.Router();

// 홈페이지 라우터 등록 (최상위 경로이므로 가장 먼저 등록)
router.use('/', homeRouter);

// 각 도메인별 라우터 등록
router.use('/exhibition', exhibitionRouter);
router.use('/user', userRouter);
router.use('/artwork', artworkRouter);
router.use('/notice', noticeRouter);
router.use('/admin', adminRouter);

export default router;
