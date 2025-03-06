const express = require('express');
const router = express.Router();
const ExhibitionController = require('../../domain/exhibition/controller/ExhibitionController');

// 전시회 목록
router.get('/', ExhibitionController.getExhibitionList);

// 카테고리별 작품 목록
router.get('/category/:category', ExhibitionController.getCategoryExhibition);

// 작품 상세 페이지
router.get('/:id', ExhibitionController.getExhibitionDetail);

module.exports = router; 