import express from 'express';
// import { isAuthenticated } from '../../middleware/auth.js';
import NoticeController from '../../controllers/NoticeController.js';

const NoticeRouter = express.Router();
const noticeController = new NoticeController();

// 일반 사용자용 공지사항 라우트
NoticeRouter.get('/', (req, res) => noticeController.getNoticeList(req, res));
NoticeRouter.get('/:id', (req, res) => noticeController.getNoticeDetail(req, res));

// 공지사항 댓글 (댓글기능 추후 추가 예정)
// NoticeRouter.post('/:id/comments', isAuthenticated, (req, res) => noticeController.createComment(req, res));
// NoticeRouter.put('/:id/comments/:commentId', isAuthenticated, (req, res) => noticeController.updateComment(req, res));
// NoticeRouter.delete('/:id/comments/:commentId', isAuthenticated, (req, res) => noticeController.deleteComment(req, res));

export default NoticeRouter;
