import express from 'express';
import * as ExhibitionController from '../../../domain/exhibition/controller/ExhibitionController.js';

const router = express.Router();

// 전시회 목록 (루트 경로와 /list 모두 동일한 컨트롤러로 연결)
router.get('/', ExhibitionController.getExhibitionList);
router.get('/list', ExhibitionController.getExhibitionList);

// 카테고리별 작품 목록
router.get('/category/:category', ExhibitionController.getCategoryExhibition);

// 작품 상세 페이지 - 숫자 ID만 매칭되도록 정규식 패턴 추가
router.get('/:id([0-9]+)', ExhibitionController.getExhibitionDetail);

export default router;
