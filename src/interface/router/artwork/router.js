import express from 'express';
import ArtworkController from '../../../application/artwork/controller/ArtworkController.js';
import ArtworkApplicationService from '../../../application/artwork/service/ArtworkApplicationService.js';
import CommentApplicationService from '../../../application/comment/service/CommentApplicationService.js';
import ExhibitionApplicationService from '../../../application/exhibition/service/ExhibitionApplicationService.js';
import ArtworkRepositoryImpl from '../../../infrastructure/repository/ArtworkRepositoryImpl.js';
import CommentRepositoryImpl from '../../../infrastructure/repository/CommentRepositoryImpl.js';
import ExhibitionRepositoryImpl from '../../../infrastructure/repository/ExhibitionRepositoryImpl.js';

const router = express.Router();

// 의존성 주입
const artworkRepository = new ArtworkRepositoryImpl();
const commentRepository = new CommentRepositoryImpl();
const exhibitionRepository = new ExhibitionRepositoryImpl();

const artworkApplicationService = new ArtworkApplicationService(artworkRepository);
const commentApplicationService = new CommentApplicationService(commentRepository);
const exhibitionApplicationService = new ExhibitionApplicationService(exhibitionRepository);

const artworkController = new ArtworkController(
    artworkApplicationService,
    commentApplicationService,
    exhibitionApplicationService
);

// 작품 목록 페이지
router.get('/', (req, res) => artworkController.getArtworkList(req, res));

// 작품 상세 페이지
router.get('/:id', (req, res) => artworkController.getArtworkDetail(req, res));

// 전시회별 작품 목록 API
router.get('/exhibition/:exhibitionId', (req, res) => artworkController.getArtworksByExhibition(req, res));

export default router;
