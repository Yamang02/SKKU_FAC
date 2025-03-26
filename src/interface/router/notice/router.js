import express from 'express';
import { isAuthenticated, isAdmin } from '../../middleware/auth.js';
import NoticeController from '../../controller/NoticeController.js';
import NoticeUseCase from '../../../application/notice/NoticeUseCase.js';
import NoticeService from '../../../domain/notice/service/NoticeService.js';
import CommentService from '../../../domain/comment/service/CommentService.js';
import NoticeRepositoryImpl from '../../../infrastructure/repository/NoticeRepositoryImpl.js';
import CommentRepositoryImpl from '../../../infrastructure/repository/CommentRepositoryImpl.js';

const router = express.Router();

// 리포지토리 계층
const noticeRepository = new NoticeRepositoryImpl();
const commentRepository = new CommentRepositoryImpl();

// 서비스 계층
const noticeService = new NoticeService(noticeRepository);
const commentService = new CommentService(commentRepository);

// 유스케이스 계층
const noticeUseCase = new NoticeUseCase(noticeService, commentService);

// 컨트롤러 계층
const noticeController = new NoticeController(noticeUseCase);

// 공지사항 목록 (일반)
router.get('/', noticeController.getNoticeList);
router.get('/:id', noticeController.getNoticeDetail);

// 관리자 공지사항 관리
router.get('/admin/management/notice/list', isAuthenticated, isAdmin, noticeController.renderNoticeList);
router.get('/admin/management/notice/create', isAuthenticated, isAdmin, noticeController.renderCreateNotice);
router.get('/admin/management/notice/:id', isAuthenticated, isAdmin, noticeController.renderNoticeDetail);
router.get('/admin/management/notice/:id/edit', isAuthenticated, isAdmin, noticeController.renderEditNotice);
router.post('/admin/management/notice', isAuthenticated, isAdmin, noticeController.createNotice);
router.post('/admin/management/notice/:id', isAuthenticated, isAdmin, noticeController.updateNotice);
router.delete('/admin/management/notice/:id', isAuthenticated, isAdmin, noticeController.deleteNotice);

export default router;
