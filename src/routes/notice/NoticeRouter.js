import express from 'express';
import { isAuthenticated, isAdmin } from '../../middleware/auth.js';
import NoticeController from '../../controllers/NoticeController.js';

const NoticeRouter = express.Router();
const noticeController = new NoticeController();

// 일반 사용자용 공지사항 라우트
NoticeRouter.get('/', (req, res) => noticeController.getNoticeList(req, res));
NoticeRouter.get('/create', isAuthenticated, isAdmin, noticeController.getNoticeCreatePage);
NoticeRouter.get('/:id', (req, res) => noticeController.getNoticeDetail(req, res));
NoticeRouter.get('/:id/edit', isAuthenticated, isAdmin, noticeController.getNoticeEditPage);

// 관리자용 공지사항 라우트
NoticeRouter.get('/management', isAdmin, (req, res) => noticeController.getAdminNoticeList(req, res));
NoticeRouter.get('/management/:id', isAdmin, (req, res) => noticeController.getAdminNoticeDetail(req, res));
NoticeRouter.post('/management', isAdmin, (req, res) => noticeController.createNotice(req, res));
NoticeRouter.put('/management/:id', isAdmin, (req, res) => noticeController.updateNotice(req, res));
NoticeRouter.delete('/management/:id', isAdmin, (req, res) => noticeController.deleteNotice(req, res));

// 공지사항 작성 (관리자만)
NoticeRouter.get('/write', isAdmin, (req, res) => noticeController.getNoticeWritePage(req, res));
NoticeRouter.post('/', isAdmin, (req, res) => noticeController.createNotice(req, res));

// 공지사항 수정 (관리자만)
NoticeRouter.get('/:id/edit', isAdmin, (req, res) => noticeController.getNoticeEditPage(req, res));
NoticeRouter.put('/:id', isAdmin, (req, res) => noticeController.updateNotice(req, res));

// 공지사항 삭제 (관리자만)
NoticeRouter.delete('/:id', isAdmin, (req, res) => noticeController.deleteNotice(req, res));

// 공지사항 댓글
NoticeRouter.post('/:id/comments', isAuthenticated, (req, res) => noticeController.createComment(req, res));
NoticeRouter.put('/:id/comments/:commentId', isAuthenticated, (req, res) => noticeController.updateComment(req, res));
NoticeRouter.delete('/:id/comments/:commentId', isAuthenticated, (req, res) => noticeController.deleteComment(req, res));

export default NoticeRouter;
