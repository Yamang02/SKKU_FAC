import express from 'express';
import HomeController from '../../controllers/HomeController.js';

const HomeRouter = express.Router();
const homeController = new HomeController();

// 홈페이지 라우터
HomeRouter.get('/', homeController.getHomePage);

// About 페이지
HomeRouter.get('/about', homeController.getAboutPage);

export default HomeRouter;
