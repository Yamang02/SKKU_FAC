const express = require('express');
const router = express.Router();
const ArtworkController = require('../../domain/artwork/controller/ArtworkController');

// 작품 목록 페이지 라우트
router.get('/list', ArtworkController.getArtworkList);

// 작품 상세 페이지 라우트
router.get('/:id', ArtworkController.getArtworkDetail);

module.exports = router; 