import express from 'express';
import * as ArtworkController from '../../domain/artwork/controller/ArtworkController.js';

const router = express.Router();

// 작품 목록 페이지 라우트
router.get('/list', ArtworkController.getArtworkList);

// 작품 상세 페이지 라우트
router.get('/:id', ArtworkController.getArtworkDetail);

export default router; 
