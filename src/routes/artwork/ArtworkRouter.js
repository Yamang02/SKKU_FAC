import express from 'express';
import { isAdmin } from '../../middleware/auth.js';
import ArtworkController from '../../controllers/ArtworkController.js';

const ArtworkRouter = express.Router();
const artworkController = new ArtworkController();

// 일반 사용자용 작품 라우트
ArtworkRouter.get('/', (req, res) => artworkController.getArtworkList(req, res));
ArtworkRouter.get('/:id', (req, res) => artworkController.getArtworkDetail(req, res));
ArtworkRouter.get('/exhibition/:exhibitionId', (req, res) => artworkController.getArtworksByExhibition(req, res));

// API 엔드포인트
ArtworkRouter.get('/api/:id', async (req, res) => {
    try {
        const artwork = await artworkController.getArtworkById(req.params.id);
        res.json(artwork);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// 관리자용 작품 라우트
ArtworkRouter.get('/management', isAdmin, (req, res) => artworkController.getAdminArtworkList(req, res));
ArtworkRouter.get('/management/:id', isAdmin, (req, res) => artworkController.getAdminArtworkDetail(req, res));
ArtworkRouter.put('/management/:id', isAdmin, (req, res) => artworkController.updateAdminArtwork(req, res));
ArtworkRouter.delete('/management/:id', isAdmin, (req, res) => artworkController.deleteAdminArtwork(req, res));

export default ArtworkRouter;
