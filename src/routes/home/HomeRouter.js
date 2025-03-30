import express from 'express';
import HomeController from '../../controllers/HomeController.js';
import ArtworkController from '../../controllers/ArtworkController.js';

const HomeRouter = express.Router();
const homeController = new HomeController();
const artworkController = new ArtworkController();

// 홈페이지 라우터
HomeRouter.get('/', homeController.getHomePage);

// About 페이지
HomeRouter.get('/about', homeController.getAboutPage);

// 모달 API
HomeRouter.get('/api/artworkmodal/:id', artworkController.getArtworkModalData);

export default HomeRouter;
