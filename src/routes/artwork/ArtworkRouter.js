import express from 'express';
import { isAdmin } from '../../middleware/auth.js';
import ArtworkController from '../../controllers/ArtworkController.js';

const ArtworkRouter = express.Router();
const artworkController = new ArtworkController();

// 관리자용 작품 라우트 (가장 구체적인 경로)
ArtworkRouter.get('/management', isAdmin, (req, res) => artworkController.getAdminArtworkList(req, res));
ArtworkRouter.get('/management/:id', isAdmin, (req, res) => artworkController.getAdminArtworkDetail(req, res));
ArtworkRouter.put('/management/:id', isAdmin, (req, res) => artworkController.updateAdminArtwork(req, res));
ArtworkRouter.delete('/management/:id', isAdmin, (req, res) => artworkController.deleteAdminArtwork(req, res));

// API 엔드포인트
ArtworkRouter.get('/api/:id', async (req, res) => {
    console.log('[API] 작품 상세 정보 요청:', req.params.id);
    console.log('[API] 요청 URL:', req.originalUrl);
    console.log('[API] 요청 경로:', req.path);

    try {
        const artwork = await artworkController.getArtworkById(req.params.id);
        console.log('[API] 작품 정보 조회 성공:', artwork);
        res.json(artwork);
    } catch (error) {
        console.error('[API] 작품 정보 조회 실패:', error.message);
        res.status(404).json({ error: error.message });
    }
});

// 전시회 작품 라우트
ArtworkRouter.get('/exhibition/:exhibitionId', (req, res) => artworkController.getArtworksByExhibition(req, res));

// 일반 작품 라우트 (가장 일반적인 경로)
ArtworkRouter.get('/', (req, res) => artworkController.getArtworkList(req, res));
ArtworkRouter.get('/:id', (req, res) => {
    console.log('[일반] 작품 상세 페이지 요청:', req.params.id);
    console.log('[일반] 요청 URL:', req.originalUrl);
    console.log('[일반] 요청 경로:', req.path);
    artworkController.getArtworkDetail(req, res);
});

export default ArtworkRouter;
