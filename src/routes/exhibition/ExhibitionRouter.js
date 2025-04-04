import express from 'express';
import ExhibitionController from '../../controllers/ExhibitionController.js';

const ExhibitionRouter = express.Router();
const exhibitionController = new ExhibitionController();

// API 라우트
ExhibitionRouter.get('/api/submittable', (req, res) => exhibitionController.getSubmittableExhibitions(req, res));

// 일반 사용자용 전시회 라우트
ExhibitionRouter.get('/', (req, res) => exhibitionController.getExhibitionList(req, res));
ExhibitionRouter.get('/:id', (req, res) => exhibitionController.getExhibitionDetail(req, res));

export default ExhibitionRouter;
