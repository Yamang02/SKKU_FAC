import express from 'express';
import ArtworkController from './ArtworkController.js';
import ArtworkApiController from './api/ArtworkApiController.js';
import uploadMiddleware from '../../../common/middleware/uploadMiddleware.js';
import { isAuthenticated } from '../../../common/middleware/auth.js';

const ArtworkRouter = express.Router();
const artworkController = new ArtworkController();
const artworkApiController = new ArtworkApiController();

// === API 엔드포인트 ===

// CUD
ArtworkRouter.post('/', isAuthenticated, uploadMiddleware, artworkApiController.createArtwork.bind(artworkController));
ArtworkRouter.put('/:id', uploadMiddleware, artworkApiController.updateArtwork.bind(artworkController));
ArtworkRouter.delete('/:id', artworkApiController.deleteArtwork.bind(artworkController));

// 작품 목록 조회 API
ArtworkRouter.get('/api/list', artworkApiController.getArtworkList.bind(artworkController));

// 추천 작품 목록 조회 API
ArtworkRouter.get('/api/featured', artworkApiController.getFeaturedArtworks.bind(artworkController));

// 작품 개별 조회 API
ArtworkRouter.get('/api/detail/:id', artworkApiController.getArtworkDetail.bind(artworkController));
ArtworkRouter.get('/api/simple/:id', artworkApiController.getArtworkSimple.bind(artworkController));

// 관련 작품 목록 조회 API
ArtworkRouter.get('/api/related/:id', artworkApiController.getRelatedArtworks.bind(artworkController));


// === 페이지 라우트 ===
// 작품 목록 페이지 (기본 경로)
ArtworkRouter.get(['/', '/list'], artworkController.getArtworkListPage.bind(artworkController));

// 작품 생성 페이지
ArtworkRouter.get('/new', isAuthenticated, artworkController.getArtworkRegistrationPage.bind(artworkController));

// 작품 상세 페이지
ArtworkRouter.get('/:id', artworkController.getArtworkDetailPage.bind(artworkController));

// 전시회별 작품 목록
ArtworkRouter.get('/exhibition/:exhibitionId', artworkController.getArtworksByExhibition.bind(artworkController));

// === 관리자용 작품 관리 페이지 라우트 ===
ArtworkRouter.get('/management', artworkController.getManagementArtworkListPage.bind(artworkController));


export default ArtworkRouter;
