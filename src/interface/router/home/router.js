import express from 'express';
import HomeUseCase from '../../../application/home/HomeUseCase.js';
import HomeService from '../../../domain/home/service/HomeService.js';
import NoticeService from '../../../domain/notice/service/NoticeService.js';
import ArtworkRepository from '../../../infrastructure/repository/ArtworkRepository.js';
import NoticeRepositoryImpl from '../../../infrastructure/repository/NoticeRepositoryImpl.js';
import viewResolver from '../../../presentation/view/ViewResolver.js';

const router = express.Router();

// 리포지토리 계층
const artworkRepository = new ArtworkRepository();
const noticeRepository = new NoticeRepositoryImpl();

// 서비스 계층
const homeService = new HomeService(artworkRepository);
const noticeService = new NoticeService(noticeRepository);

// 유스케이스 계층
const homeUseCase = new HomeUseCase(homeService, noticeService);

router.get('/', async (req, res) => {
    try {
        const data = await homeUseCase.getHomePageData();
        viewResolver.render(res, 'home/HomePage', {
            title: '홈',
            ...data
        });
    } catch (error) {
        viewResolver.render(res, 'common/error', { error });
    }
});

// About 페이지 라우트
router.get('/about', (req, res) => {
    viewResolver.render(res, 'common/AboutPage', {
        title: '소개'
    });
});

export default router;
