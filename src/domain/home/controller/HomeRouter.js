import express from 'express';
import HomeController from './HomeController.js';

const HomeRouter = express.Router();
const homeController = new HomeController();

// 홈페이지 라우터
HomeRouter.get('/', (req, res) => homeController.getHomePage(req, res));

// About 페이지
HomeRouter.get('/about', (req, res) => homeController.getAboutPage(req, res));

// 성공 페이지
HomeRouter.get('/success', (req, res) => homeController.getSuccessPage(req, res));

export default HomeRouter;
