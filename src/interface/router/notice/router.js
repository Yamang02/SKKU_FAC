import express from 'express';
import * as NoticeController from '../../../domain/notice/controller/NoticeController.js';

const router = express.Router();

// 공지사항 목록
router.get('/', NoticeController.getNoticeList);

// 공지사항 상세
router.get('/:id', NoticeController.getNoticeDetail);

export default router;
