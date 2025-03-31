import express from 'express';
import ArtworkController from '../../controllers/ArtworkController.js';
import uploadMiddleware from '../../middleware/uploadMiddleware.js';

const ArtworkRouter = express.Router();
const artworkController = new ArtworkController();


// 작품 등록 라우트
ArtworkRouter.get('/registration', (req, res) => artworkController.getArtworkRegisterPage(req, res));
ArtworkRouter.post('/registration', uploadMiddleware, (req, res) => artworkController.createArtwork(req, res));

// API 엔드포인트
ArtworkRouter.get('/api/:id([0-9]+)', async (req, res) => {
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

// 작품 상세 페이지 라우트
ArtworkRouter.get('/:id([0-9]+)', (req, res) => {
    console.log('[일반] 작품 상세 페이지 요청:', req.params.id);
    console.log('[일반] 요청 URL:', req.originalUrl);
    console.log('[일반] 요청 경로:', req.path);
    artworkController.getArtworkDetail(req, res);
});

// 작품 목록 라우트 (마지막에 처리)
ArtworkRouter.get('/', (req, res) => artworkController.getArtworkList(req, res));

export default ArtworkRouter;
