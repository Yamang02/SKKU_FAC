import express from 'express';
import ExhibitionController from './ExhibitionController.js';
import ExhibitionApiController from './api/ExhibitionApiController.js';
const ExhibitionRouter = express.Router();
const exhibitionController = new ExhibitionController();

// API 라우트
ExhibitionRouter.get('/api/submittable', (req, res) => ExhibitionApiController.findSubmittableExhibitions(req, res));
ExhibitionRouter.get('/api/list', (req, res) => ExhibitionApiController.getExhibitionList(req, res));

// 일반 사용자용 전시회 라우트
ExhibitionRouter.get('/', (req, res) => exhibitionController.getExhibitionListPage(req, res));
ExhibitionRouter.get('/:id', (req, res) => exhibitionController.getExhibitionDetail(req, res));

export default ExhibitionRouter;
