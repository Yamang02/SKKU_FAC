import express from 'express';
import NoticeController from './NoticeController.js';

const NoticeRouter = express.Router();
const noticeController = new NoticeController();

// 일반 사용자용 공지사항 라우트
NoticeRouter.get('/', (req, res) => noticeController.getNoticeList(req, res));
NoticeRouter.get('/:id', (req, res) => noticeController.getNoticeDetail(req, res));

export default NoticeRouter;
