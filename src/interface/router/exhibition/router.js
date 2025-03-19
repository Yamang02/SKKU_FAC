import express from 'express';
import ExhibitionController from '../../../application/exhibition/controller/ExhibitionController.js';
import ExhibitionApplicationService from '../../../application/exhibition/service/ExhibitionApplicationService.js';
import ExhibitionRepositoryImpl from '../../../infrastructure/repository/ExhibitionRepositoryImpl.js';
import ArtworkApplicationService from '../../../application/artwork/service/ArtworkApplicationService.js';

const router = express.Router();

// 서비스 및 컨트롤러 인스턴스 생성
const exhibitionRepository = new ExhibitionRepositoryImpl();
const exhibitionService = new ExhibitionApplicationService(exhibitionRepository);
const artworkService = new ArtworkApplicationService(); // TODO: 필요한 의존성 주입
const exhibitionController = new ExhibitionController(exhibitionService, artworkService);

// 전시회 목록
router.get('/', (req, res) => exhibitionController.getExhibitionList(req, res));
router.get('/list', (req, res) => exhibitionController.getExhibitionList(req, res));

// 전시회 생성
router.get('/create', (req, res) => exhibitionController.getExhibitionCreateForm(req, res));
router.post('/create', (req, res) => exhibitionController.createExhibition(req, res));

// 전시회 수정
router.get('/:id/edit', (req, res) => exhibitionController.getExhibitionEditForm(req, res));
router.post('/:id/edit', (req, res) => exhibitionController.updateExhibition(req, res));

// 전시회 삭제
router.delete('/:id', (req, res) => exhibitionController.deleteExhibition(req, res));

// 전시회 상세 페이지 - 숫자 ID만 매칭되도록 정규식 패턴 추가
router.get('/:id([0-9]+)', (req, res) => exhibitionController.getExhibitionDetail(req, res));

export default router;
