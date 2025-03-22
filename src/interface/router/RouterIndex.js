import express from 'express';
import { isAdmin } from '../middleware/auth.js';

/**
 * 라우터 인덱스
 * 모든 라우터를 중앙에서 관리하고 등록합니다.
 */
export const createRouters = (container) => {
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

    // 전시회 라우터
    const exhibitionController = container.get('exhibitionController');
    router.get('/exhibition', exhibitionController.getExhibitionList.bind(exhibitionController));
    router.get('/exhibition/:id', exhibitionController.getExhibitionDetail.bind(exhibitionController));

    // 작품 라우터
    const artworkController = container.get('artworkController');
    router.get('/artwork', artworkController.getArtworkList.bind(artworkController));
    router.get('/artwork/:id', artworkController.getArtworkDetail.bind(artworkController));
    router.get('/artwork/exhibition/:exhibitionId', artworkController.getArtworksByExhibition.bind(artworkController));

    // 공지사항 라우터
    const noticeController = container.get('noticeController');
    router.get('/notice', noticeController.getNoticeList.bind(noticeController));
    router.get('/notice/:id', noticeController.getNoticeDetail.bind(noticeController));

    // 사용자 라우터
    const userController = container.get('userController');
    router.get('/user/login', userController.getLoginPage.bind(userController));
    router.post('/user/login', userController.login.bind(userController));
    router.get('/user/logout', userController.logout.bind(userController));
    router.get('/user/register', userController.getRegisterPage.bind(userController));
    router.post('/user/register', userController.register.bind(userController));
    router.get('/user/profile', userController.getProfilePage.bind(userController));

    // 관리자 라우터
    const adminController = container.get('adminController');
    router.get('/admin', isAdmin, adminController.getDashboard.bind(adminController));
    router.get('/admin/users', isAdmin, adminController.getUserManagement.bind(adminController));

    return router;
};
