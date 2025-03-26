import express from 'express';
import { isAdmin } from '../../middleware/auth.js';

export const createNoticeRouter = (container) => {
    const router = express.Router();
    const noticeController = container.get('noticeController');

    // 일반 사용자용 공지사항 라우트
    router.get('/', noticeController.getNoticeList.bind(noticeController));
    router.get('/:id', noticeController.getNoticeDetail.bind(noticeController));

    // 관리자용 공지사항 라우트
    router.get(['/management/list', '/management'], isAdmin, noticeController.getAdminNoticeList.bind(noticeController));
    router.get('/management/:id', isAdmin, noticeController.getAdminNoticeDetail.bind(noticeController));
    router.put('/management/:id', isAdmin, noticeController.updateAdminNotice.bind(noticeController));
    router.delete('/management/:id', isAdmin, noticeController.deleteAdminNotice.bind(noticeController));

    return router;
};
