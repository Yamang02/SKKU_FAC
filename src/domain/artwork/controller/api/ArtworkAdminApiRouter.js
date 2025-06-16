import express from 'express';

/**
 * Artwork Admin API 라우터 생성 함수
 * @param {Object} container - 의존성 주입 컨테이너
 * @returns {express.Router} Artwork Admin API 라우터
 */
export function createArtworkAdminApiRouter(container) {
    const router = express.Router();
    const artworkAdminApiController = container.resolve('ArtworkAdminApiController');

    // 작품 관리 API 라우트
    router.get('/artworks', artworkAdminApiController.getArtworkList.bind(artworkAdminApiController));
    router.get('/artworks/:id', artworkAdminApiController.getArtworkDetail.bind(artworkAdminApiController));
    router.post('/artworks', artworkAdminApiController.createArtwork.bind(artworkAdminApiController));
    router.put('/artworks/:id', artworkAdminApiController.updateArtwork.bind(artworkAdminApiController));
    router.delete('/artworks/:id', artworkAdminApiController.deleteArtwork.bind(artworkAdminApiController));
    router.put('/artworks/:id/approve', artworkAdminApiController.approveArtwork.bind(artworkAdminApiController));
    router.put('/artworks/:id/reject', artworkAdminApiController.rejectArtwork.bind(artworkAdminApiController));
    router.get('/artworks/stats', artworkAdminApiController.getArtworkStats.bind(artworkAdminApiController));
    router.post('/artworks/:id/upload-image', artworkAdminApiController.uploadArtworkImage.bind(artworkAdminApiController));
    router.put('/artworks/:id/status', artworkAdminApiController.updateArtworkStatus.bind(artworkAdminApiController));
    router.post('/artworks/:id/toggle-featured', artworkAdminApiController.toggleFeatured.bind(artworkAdminApiController));
    router.get('/artworks/form-data', artworkAdminApiController.getArtworkFormData.bind(artworkAdminApiController));

    return router;
}
