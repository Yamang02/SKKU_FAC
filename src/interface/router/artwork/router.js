import express from 'express';
import * as ArtworkController from '../../../domain/artwork/controller/ArtworkController.js';

const router = express.Router();

// 작품 목록 페이지 라우트 (루트 경로와 /list 모두 동일한 컨트롤러로 연결)
router.get('/', ArtworkController.getArtworkList);
router.get('/list', ArtworkController.getArtworkList);

// 작품 상세 페이지 라우트 - 숫자 ID만 매칭되도록 정규식 패턴 추가
router.get('/:id([0-9]+)', ArtworkController.getArtworkDetail);

export default router;
