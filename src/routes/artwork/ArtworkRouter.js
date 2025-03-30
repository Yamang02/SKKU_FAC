import express from 'express';
import multer from 'multer';
import path from 'path';
import ArtworkController from '../../controllers/ArtworkController.js';
import { isAuthenticated } from '../../middlewares/auth.js';
import { FilePath } from '../../constants/Path.js';

const ArtworkRouter = express.Router();
const artworkController = new ArtworkController();

// 파일 업로드 설정
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, FilePath.UPLOAD.ARTWORKS);
    },
    filename: function (req, file, cb) {
        // 파일 확장자 추출
        const ext = path.extname(file.originalname);
        // 임시 파일명 생성 (컨트롤러에서 실제 파일명으로 변경)
        const tempFilename = `temp_${Date.now()}${ext}`;
        cb(null, tempFilename);
    }
});

const uploadMiddleware = multer({
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
ArtworkRouter.get('/registration', (req, res) => artworkController.getArtworkRegisterPage(req, res));
ArtworkRouter.post('/registration', uploadMiddleware.single('image'), (req, res) => artworkController.createArtwork(req, res));

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
