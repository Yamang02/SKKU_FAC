import express from 'express';
import ArtworkController from '../../controllers/ArtworkController.js';
import uploadMiddleware from '../../middleware/uploadMiddleware.js';

const ArtworkRouter = express.Router();
const artworkController = new ArtworkController();

// === API 엔드포인트 ===
// 작품 데이터 조회 API
ArtworkRouter.get('/api/data/:id', artworkController.getArtworkData.bind(artworkController));

// 작품 목록 조회 API
ArtworkRouter.get('/api/list', artworkController.getArtworkListData.bind(artworkController));

// 추천 작품 목록 조회 API
ArtworkRouter.get('/api/featured', artworkController.getFeaturedArtworks.bind(artworkController));

// === 페이지 라우트 ===
// 작품 목록
ArtworkRouter.get('/', artworkController.getArtworkList.bind(artworkController));

// 작품 생성
ArtworkRouter.get('/new', artworkController.getArtworkRegistrationPage.bind(artworkController));
ArtworkRouter.post('/', uploadMiddleware, artworkController.createArtwork.bind(artworkController));

// 전시회별 작품 목록
ArtworkRouter.get('/exhibition/:exhibitionId', artworkController.getArtworksByExhibition.bind(artworkController));

// 작품 상세
ArtworkRouter.get('/:id', artworkController.getArtworkDetail.bind(artworkController));

// === 작품 관리 라우트 ===
// 작품 수정
ArtworkRouter.get('/:id/edit', artworkController.getArtworkEditPage.bind(artworkController));
ArtworkRouter.put('/:id', artworkController.updateArtwork.bind(artworkController));

// 작품 삭제
ArtworkRouter.delete('/:id', artworkController.deleteArtwork.bind(artworkController));

export default ArtworkRouter;
