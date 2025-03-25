import express from 'express';
import { isAdmin } from '../middleware/auth.js';

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
    router.get('/user/profile/edit', userController.getProfileEditPage.bind(userController));
    router.post('/user/profile/edit', userController.updateProfile.bind(userController));
    router.get('/user/forgot-password', userController.getForgotPasswordPage.bind(userController));
    router.post('/user/forgot-password', userController.handleForgotPassword.bind(userController));

    // 관리자 라우터
    const adminController = container.get('adminController');
    router.get(['/admin', '/admin/dashboard'], isAdmin, adminController.getDashboard.bind(adminController));

    // 관리자 사용자 관리
    router.get(['/admin/management/user', '/admin/management/user/list'], isAdmin, adminController.getUserManagement.bind(adminController));
    router.get('/admin/management/user/:id', isAdmin, adminController.getUserDetail.bind(adminController));

    // 관리자 전시회 관리
    router.get(['/admin/management/exhibition', '/admin/management/exhibition/list'], isAdmin, exhibitionController.getAdminExhibitionList.bind(exhibitionController));
    router.get('/admin/management/exhibition/:id', isAdmin, exhibitionController.getAdminExhibitionDetail.bind(exhibitionController));
    router.put('/admin/management/exhibition/:id', isAdmin, exhibitionController.updateAdminExhibition.bind(exhibitionController));
    router.delete('/admin/management/exhibition/:id', isAdmin, exhibitionController.deleteAdminExhibition.bind(exhibitionController));

    router.get('/admin/management/artwork', isAdmin, adminController.getArtworkManagement.bind(adminController));
    router.get('/admin/management/notice', isAdmin, adminController.getNoticeManagement.bind(adminController));

    return router;
};
