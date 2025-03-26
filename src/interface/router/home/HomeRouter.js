import express from 'express';

export const createHomeRouter = (container) => {
    const router = express.Router();

    // 홈페이지 라우터
    router.get('/', async (req, res) => {
        try {
            const homeUseCase = container.get('homeUseCase');
            const data = await homeUseCase.getHomePageData();
            res.render('home/HomePage', {
                title: '홈',
                ...data
            });
        } catch (error) {
            res.render('common/error', {
                title: '오류',
                error
            });
        }
    });

    // About 페이지
    router.get('/about', (req, res) => {
        res.render('common/AboutPage', {
            title: '소개'
        });
    });

    return router;
};
