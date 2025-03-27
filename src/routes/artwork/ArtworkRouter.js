import express from 'express';
import multer from 'multer';
import path from 'path';
import { isAdmin } from '../../middleware/auth.js';
import ArtworkController from '../../controllers/ArtworkController.js';

const ArtworkRouter = express.Router();
const artworkController = new ArtworkController();

// 파일 업로드 설정
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/artworks');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB 제한
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('지원하지 않는 파일 형식입니다. JPEG, PNG, GIF 파일만 업로드 가능합니다.'));
        }
    }
});

// 작품 등록 라우트
ArtworkRouter.get('/register', (req, res) => artworkController.getArtworkCreatePage(req, res));
ArtworkRouter.post('/register', upload.single('image'), (req, res) => artworkController.createArtwork(req, res));

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
