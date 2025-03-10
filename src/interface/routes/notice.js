import express from 'express';
import * as NoticeController from '../../domain/notice/controller/NoticeController.js';

const router = express.Router();

// 공지사항 목록
router.get('/', NoticeController.getNoticeList);

export default router; 
