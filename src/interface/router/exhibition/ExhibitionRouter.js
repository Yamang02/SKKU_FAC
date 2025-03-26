import express from 'express';
import { isAdmin } from '../../middleware/auth.js';

export const createExhibitionRouter = (container) => {
    const router = express.Router();
    const exhibitionController = container.get('exhibitionController');

    // 일반 사용자용 전시회 라우트
    router.get('/', exhibitionController.getExhibitionList.bind(exhibitionController));
    router.get('/:id', exhibitionController.getExhibitionDetail.bind(exhibitionController));

    // 관리자용 전시회 라우트
    router.get(['/management/list', '/management'], isAdmin, exhibitionController.getAdminExhibitionList.bind(exhibitionController));
    router.get('/management/:id', isAdmin, exhibitionController.getAdminExhibitionDetail.bind(exhibitionController));
    router.put('/management/:id', isAdmin, exhibitionController.updateAdminExhibition.bind(exhibitionController));
    router.delete('/management/:id', isAdmin, exhibitionController.deleteAdminExhibition.bind(exhibitionController));

    return router;
};
