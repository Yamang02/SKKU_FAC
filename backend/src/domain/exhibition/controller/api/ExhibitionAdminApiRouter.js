import express from 'express';

/**
 * Exhibition Admin API 라우터 생성 함수
 * @param {Object} container - 의존성 주입 컨테이너
 * @returns {express.Router} Exhibition Admin API 라우터
 */
export function createExhibitionAdminApiRouter(container) {
    const router = express.Router();
    const exhibitionAdminApiController = container.resolve('ExhibitionAdminApiController');

    // 전시회 관리 API 라우트
    router.get('/exhibitions', exhibitionAdminApiController.getExhibitionList.bind(exhibitionAdminApiController));
    router.get('/exhibitions/:id', exhibitionAdminApiController.getExhibitionDetail.bind(exhibitionAdminApiController));
    router.post('/exhibitions', exhibitionAdminApiController.createExhibition.bind(exhibitionAdminApiController));
    router.put('/exhibitions/:id', exhibitionAdminApiController.updateExhibition.bind(exhibitionAdminApiController));
    router.delete('/exhibitions/:id', exhibitionAdminApiController.deleteExhibition.bind(exhibitionAdminApiController));
    router.post('/exhibitions/:id/toggle-featured', exhibitionAdminApiController.toggleFeatured.bind(exhibitionAdminApiController));
    router.put('/exhibitions/:id/status', exhibitionAdminApiController.changeExhibitionStatus.bind(exhibitionAdminApiController));
    router.put('/exhibitions/:id/submission-status', exhibitionAdminApiController.updateSubmissionStatus.bind(exhibitionAdminApiController));
    router.get('/exhibitions/by-status/:status', exhibitionAdminApiController.getExhibitionsByStatus.bind(exhibitionAdminApiController));

    return router;
}
