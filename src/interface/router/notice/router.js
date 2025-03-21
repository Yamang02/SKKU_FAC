import express from 'express';
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

// 공지사항 목록
router.get('/', noticeController.getNoticeList);
router.get('/:id', noticeController.getNoticeDetail);

// 공지사항 관리 (관리자 전용)
router.post('/', noticeController.createNotice);
router.put('/:id', noticeController.updateNotice);
router.delete('/:id', noticeController.deleteNotice);

export default router;
