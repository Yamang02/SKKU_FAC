import express from 'express';
import { getHome } from '../../../domain/home/controller/HomeController.js';
import viewResolver from '../../../presentation/view/ViewResolver.js';

const router = express.Router();

router.get('/', getHome);

// About 페이지 라우트
router.get('/about', (req, res) => {
    res.render(viewResolver.resolve('about/AboutPage'), {
        title: '소개'
    });
});

export default router;
