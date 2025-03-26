import express from 'express';
import { isAdmin } from '../../middleware/auth.js';
import ExhibitionController from '../../controllers/ExhibitionController.js';

const ExhibitionRouter = express.Router();
const exhibitionController = new ExhibitionController();

// 일반 사용자용 전시회 라우트
ExhibitionRouter.get('/', (req, res) => exhibitionController.getExhibitionList(req, res));
ExhibitionRouter.get('/:id', (req, res) => exhibitionController.getExhibitionDetail(req, res));

// 관리자용 전시회 라우트
ExhibitionRouter.get('/management', isAdmin, (req, res) => exhibitionController.getAdminExhibitionList(req, res));
ExhibitionRouter.get('/management/:id', isAdmin, (req, res) => exhibitionController.getAdminExhibitionDetail(req, res));
ExhibitionRouter.post('/management', isAdmin, (req, res) => exhibitionController.createExhibition(req, res));
ExhibitionRouter.put('/management/:id', isAdmin, (req, res) => exhibitionController.updateExhibition(req, res));
ExhibitionRouter.delete('/management/:id', isAdmin, (req, res) => exhibitionController.deleteExhibition(req, res));

export default ExhibitionRouter;
