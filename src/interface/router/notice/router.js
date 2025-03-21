import express from 'express';
import NoticeController from '../../controller/NoticeController.js';
import NoticeApplicationService from '../../../application/notice/service/NoticeApplicationService.js';
import NoticeRepositoryImpl from '../../../infrastructure/repository/NoticeRepositoryImpl.js';
import CommentApplicationService from '../../../application/comment/service/CommentApplicationService.js';
import CommentRepositoryImpl from '../../../infrastructure/repository/CommentRepositoryImpl.js';

const router = express.Router();

// 리포지토리 인스턴스 생성
const noticeRepository = new NoticeRepositoryImpl();
const commentRepository = new CommentRepositoryImpl();

// 서비스 인스턴스 생성
const noticeApplicationService = new NoticeApplicationService(noticeRepository);
const commentApplicationService = new CommentApplicationService(commentRepository);

// 컨트롤러 인스턴스 생성
const noticeController = new NoticeController(noticeApplicationService, commentApplicationService);

// 공지사항 목록
router.get('/', noticeController.getNoticeList.bind(noticeController));

// 공지사항 상세
router.get('/:id', noticeController.getNoticeDetail.bind(noticeController));

export default router;
