import express from 'express';
import HomeController from '../../controllers/HomeController.js';
import ArtworkController from '../../controllers/ArtworkController.js';

const HomeRouter = express.Router();
const homeController = new HomeController();
const artworkController = new ArtworkController();

// 홈페이지 라우터
HomeRouter.get('/', (req, res) => homeController.getHomePage(req, res));

// About 페이지
HomeRouter.get('/about', (req, res) => homeController.getAboutPage(req, res));

// 모달 API
HomeRouter.get('/api/artworkmodal/:id([0-9]+)', (req, res) => artworkController.getArtworkModalData(req, res));

export default HomeRouter;
