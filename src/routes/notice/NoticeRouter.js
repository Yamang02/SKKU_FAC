import express from 'express';
import { authenticate, isAdmin } from '../../middleware/auth.js';
import NoticeController from '../../controllers/NoticeController.js';

const NoticeRouter = express.Router();
const noticeController = new NoticeController();

// 일반 사용자용 공지사항 라우트
NoticeRouter.get('/', (req, res) => noticeController.getNoticeList(req, res));
NoticeRouter.get('/create', authenticate, isAdmin, noticeController.getNoticeCreatePage);
NoticeRouter.get('/:id', (req, res) => noticeController.getNoticeDetail(req, res));
NoticeRouter.get('/:id/edit', authenticate, isAdmin, noticeController.getNoticeEditPage);

// 관리자용 공지사항 라우트
NoticeRouter.get('/management', isAdmin, (req, res) => noticeController.getAdminNoticeList(req, res));
NoticeRouter.get('/management/:id', isAdmin, (req, res) => noticeController.getAdminNoticeDetail(req, res));
NoticeRouter.post('/management', isAdmin, (req, res) => noticeController.createNotice(req, res));
NoticeRouter.put('/management/:id', isAdmin, (req, res) => noticeController.updateNotice(req, res));
NoticeRouter.delete('/management/:id', isAdmin, (req, res) => noticeController.deleteNotice(req, res));

export default NoticeRouter;
