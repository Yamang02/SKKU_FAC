import express from 'express';
import HomeController from '../../../domain/home/controller/HomeController.js';
import viewResolver from '../../../presentation/view/ViewResolver.js';

const router = express.Router();
const homeController = new HomeController();

router.get('/', homeController.getHome);

// About 페이지 라우트
router.get('/about', (req, res) => {
    viewResolver.render(res, 'about/AboutPage', {
        title: '소개'
    });
});

export default router;
