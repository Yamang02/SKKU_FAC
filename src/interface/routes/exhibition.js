import express from 'express';
import * as ExhibitionController from '../../domain/exhibition/controller/ExhibitionController.js';

const router = express.Router();

// 전시회 목록
router.get('/', ExhibitionController.getExhibitionList);

// 카테고리별 작품 목록
router.get('/category/:category', ExhibitionController.getCategoryExhibition);

// 작품 상세 페이지
router.get('/:id', ExhibitionController.getExhibitionDetail);

export default router; 