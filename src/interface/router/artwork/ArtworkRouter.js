import express from 'express';
import { isAdmin } from '../../middleware/auth.js';

export const createArtworkRouter = (container) => {
    const router = express.Router();
    const artworkController = container.get('artworkController');

    // 일반 사용자용 작품 라우트
    router.get('/', artworkController.getArtworkList.bind(artworkController));
    router.get('/:id', artworkController.getArtworkDetail.bind(artworkController));
    router.get('/exhibition/:exhibitionId', artworkController.getArtworksByExhibition.bind(artworkController));

    // 관리자용 작품 라우트
    router.get(['/management/list', '/management'], isAdmin, artworkController.getAdminArtworkList.bind(artworkController));
    router.get('/management/:id', isAdmin, artworkController.getAdminArtworkDetail.bind(artworkController));
    router.put('/management/:id', isAdmin, artworkController.updateAdminArtwork.bind(artworkController));
    router.delete('/management/:id', isAdmin, artworkController.deleteAdminArtwork.bind(artworkController));

    return router;
};
