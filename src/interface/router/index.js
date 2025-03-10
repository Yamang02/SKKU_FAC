import express from 'express';
import exhibitionRouter from './exhibition/router.js';
import noticeRouter from './notice/router.js';
import userRouter from './user/router.js';
import artworkRouter from './artwork/router.js';

const router = express.Router();

// 각 도메인별 라우터 등록
router.use('/exhibition', exhibitionRouter);
router.use('/notice', noticeRouter);
router.use('/user', userRouter);
router.use('/artwork', artworkRouter);

export default router;
