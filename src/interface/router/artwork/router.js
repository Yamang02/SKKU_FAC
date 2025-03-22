import express from 'express';
import ArtworkController from '../../controller/ArtworkController.js';
import ArtworkUseCase from '../../../application/artwork/ArtworkUseCase.js';
import ArtworkService from '../../../domain/artwork/service/ArtworkService.js';
import ExhibitionService from '../../../domain/exhibition/service/ExhibitionService.js';
import ArtworkRepository from '../../../infrastructure/repository/ArtworkRepository.js';
import ExhibitionRepository from '../../../infrastructure/repository/ExhibitionRepository.js';

const router = express.Router();

// 리포지토리 인스턴스 생성
const artworkRepository = new ArtworkRepository();
const exhibitionRepository = new ExhibitionRepository();

// 서비스 인스턴스 생성
const artworkService = new ArtworkService(artworkRepository);
const exhibitionService = new ExhibitionService(exhibitionRepository);

// 유스케이스 인스턴스 생성
const artworkUseCase = new ArtworkUseCase(artworkService, exhibitionService);

// 컨트롤러 인스턴스 생성
const artworkController = new ArtworkController(artworkUseCase);

// 라우트 정의
router.get('/', (req, res) => artworkController.getArtworkList(req, res));
router.get('/:id([0-9]+)', (req, res) => artworkController.getArtworkDetail(req, res));
router.get('/exhibition/:exhibitionId([0-9]+)', (req, res) => artworkController.getArtworksByExhibition(req, res));

export default router;
