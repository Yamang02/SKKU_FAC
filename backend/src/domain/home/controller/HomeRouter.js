import express from 'express';
import HomeController from './HomeController.js';
import CacheMiddleware from '../../../common/middleware/CacheMiddleware.js';

const HomeRouter = express.Router();
const homeController = new HomeController();
const cacheMiddleware = new CacheMiddleware();

// 홈페이지 라우터 (정적 캐싱 적용 - 30분)
HomeRouter.get('/', cacheMiddleware.static({ ttl: 1800 }), (req, res) => homeController.getHomePage(req, res));

// About 페이지 (정적 캐싱 적용 - 1시간)
HomeRouter.get('/about', cacheMiddleware.static({ ttl: 3600 }), (req, res) => homeController.getAboutPage(req, res));

// 성공 페이지 (짧은 캐싱 - 5분)
HomeRouter.get('/success', cacheMiddleware.dynamic({ ttl: 300 }), (req, res) =>
    homeController.getSuccessPage(req, res)
);

export default HomeRouter;
