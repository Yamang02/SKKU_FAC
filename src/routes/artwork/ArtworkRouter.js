import express from 'express';
import ArtworkController from '../../controllers/ArtworkController.js';
import uploadMiddleware from '../../middleware/uploadMiddleware.js';

const ArtworkRouter = express.Router();
const artworkController = new ArtworkController();

// === API 엔드포인트 ===
// 작품 목록 조회 API
ArtworkRouter.get('/api/list', artworkController.getArtworkList.bind(artworkController));

// 작품 상세 조회 API
ArtworkRouter.get('/api/detail/:id', artworkController.getArtworkDetail.bind(artworkController));

// 작품 데이터 조회 API
ArtworkRouter.get('/api/data/:id', artworkController.getArtworkData.bind(artworkController));

// === 페이지 라우트 ===
// 작품 목록 페이지
ArtworkRouter.get('/', artworkController.getArtworkListPage.bind(artworkController));

// 작품 생성
ArtworkRouter.get('/new', artworkController.getArtworkRegistrationPage.bind(artworkController));
ArtworkRouter.post('/', uploadMiddleware, artworkController.createArtwork.bind(artworkController));

// 작품 상세 페이지
ArtworkRouter.get('/:id', artworkController.getArtworkDetailPage.bind(artworkController));

// 전시회별 작품 목록
ArtworkRouter.get('/exhibition/:exhibitionId', artworkController.getArtworksByExhibition.bind(artworkController));

// === 작품 관리 라우트 ===
// 작품 수정
ArtworkRouter.put('/:id', uploadMiddleware, artworkController.updateArtwork.bind(artworkController));

// 작품 삭제
ArtworkRouter.delete('/:id', artworkController.deleteArtwork.bind(artworkController));

// === 관리자용 작품 관리 페이지 라우트 ===
ArtworkRouter.get('/management', artworkController.getManagementArtworkListPage.bind(artworkController));

export default ArtworkRouter;
