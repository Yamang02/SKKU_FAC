import express from 'express';
import ArtworkController from './ArtworkController.js';
import ArtworkApiController from './api/ArtworkApiController.js';
import { imageUploadMiddleware } from '../../../common/middleware/imageUploadMiddleware.js';
import { isAuthenticated } from '../../../common/middleware/auth.js';

const ArtworkRouter = express.Router();
const artworkController = new ArtworkController();
const artworkApiController = new ArtworkApiController();

// === API 엔드포인트 ===

// 작품등록 , 수정, 삭제
ArtworkRouter.post('/api/new', isAuthenticated, imageUploadMiddleware('artwork'), artworkApiController.createArtwork.bind(artworkApiController));
ArtworkRouter.put('/api/:id', isAuthenticated, artworkApiController.updateArtwork.bind(artworkApiController));
ArtworkRouter.delete('/api/:id', artworkApiController.deleteArtwork.bind(artworkApiController));

// 작품 목록 조회 API
ArtworkRouter.get('/api/list', artworkApiController.getArtworkList.bind(artworkApiController));

// 추천 작품 목록 조회 API
ArtworkRouter.get('/api/featured', artworkApiController.getFeaturedArtworks.bind(artworkApiController));

// 작품 개별 조회 API
ArtworkRouter.get('/api/detail/:slug', artworkApiController.getArtworkDetail.bind(artworkApiController));


// === 페이지 라우트 ===
// 작품 목록 페이지 (기본 경로)
ArtworkRouter.get(['/', '/list'], artworkController.getArtworkListPage.bind(artworkController));

// 작품 생성 페이지
ArtworkRouter.get('/new', isAuthenticated, artworkController.getArtworkRegistrationPage.bind(artworkController));

// 작품 상세 페이지
ArtworkRouter.get('/:slug', artworkController.getArtworkDetailPage.bind(artworkController));

// 관리자용 작품 관리 페이지는 AdminRouter에서 처리합니다.

export default ArtworkRouter;
