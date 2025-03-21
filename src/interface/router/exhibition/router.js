import express from 'express';
import ExhibitionController from '../../controller/ExhibitionController.js';
import ExhibitionUseCase from '../../../application/exhibition/ExhibitionUseCase.js';
import ExhibitionService from '../../../domain/exhibition/service/ExhibitionService.js';
import ExhibitionRepository from '../../../infrastructure/repository/ExhibitionRepository.js';

const router = express.Router();

// 리포지토리 인스턴스 생성
const exhibitionRepository = new ExhibitionRepository();

// 서비스 인스턴스 생성
const exhibitionService = new ExhibitionService(exhibitionRepository);

// 유스케이스 인스턴스 생성
const exhibitionUseCase = new ExhibitionUseCase(exhibitionService);

// 컨트롤러 인스턴스 생성
const exhibitionController = new ExhibitionController(exhibitionUseCase);

// 전시회 목록
router.get('/', (req, res) => exhibitionController.getExhibitionList(req, res));
router.get('/list', (req, res) => exhibitionController.getExhibitionList(req, res));

// 전시회 생성
router.get('/create', (req, res) => exhibitionController.getCreateExhibitionForm(req, res));
router.post('/create', (req, res) => exhibitionController.createExhibition(req, res));

// 전시회 수정
router.get('/:id([0-9]+)/edit', (req, res) => exhibitionController.getEditExhibitionForm(req, res));
router.post('/:id([0-9]+)/edit', (req, res) => exhibitionController.updateExhibition(req, res));

// 전시회 삭제
router.post('/:id([0-9]+)/delete', (req, res) => exhibitionController.deleteExhibition(req, res));

// 전시회 상세 페이지 - 숫자 ID만 매칭되도록 정규식 패턴 추가
router.get('/:id([0-9]+)', (req, res) => exhibitionController.getExhibitionDetail(req, res));

export default router;
