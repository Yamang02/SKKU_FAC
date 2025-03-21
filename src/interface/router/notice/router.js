import express from 'express';
import NoticeController from '../../controller/NoticeController.js';
import { isAuthenticated, hasRole } from '../../middleware/auth.js';

const router = express.Router();
const noticeController = new NoticeController();

// 공지사항 목록
router.get('/', noticeController.getNoticeList);
router.get('/:id', noticeController.getNoticeDetail);

// 공지사항 관리 (관리자 전용)
router.post('/', isAuthenticated, hasRole(['ADMIN']), noticeController.createNotice);
router.put('/:id', isAuthenticated, hasRole(['ADMIN']), noticeController.updateNotice);
router.delete('/:id', isAuthenticated, hasRole(['ADMIN']), noticeController.deleteNotice);

export default router;
