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
    const adminRouter = express.Router();

    // 관리자 대시보드
    const adminController = container.get('adminController');
    adminRouter.get(['/', '/dashboard'], isAdmin, adminController.getDashboard.bind(adminController));

    // 관리자 사용자 관리
    adminRouter.get(['/management/user', '/management/user/list'], isAdmin, adminController.getUserManagement.bind(adminController));
    adminRouter.get('/management/user/:id', isAdmin, adminController.getUserDetail.bind(adminController));

    // 관리자 전시회 관리
    adminRouter.get(['/management/exhibition', '/management/exhibition/list'], isAdmin, exhibitionController.getAdminExhibitionList.bind(exhibitionController));
    adminRouter.get('/management/exhibition/:id', isAdmin, exhibitionController.getAdminExhibitionDetail.bind(exhibitionController));
    adminRouter.put('/management/exhibition/:id', isAdmin, exhibitionController.updateAdminExhibition.bind(exhibitionController));
    adminRouter.delete('/management/exhibition/:id', isAdmin, exhibitionController.deleteAdminExhibition.bind(exhibitionController));

    // 관리자 작품 관리
    adminRouter.get(['/management/artwork', '/management/artwork/list'], isAdmin, artworkController.getAdminArtworkList.bind(artworkController));
    adminRouter.get('/management/artwork/:id', isAdmin, artworkController.getAdminArtworkDetail.bind(artworkController));
    adminRouter.put('/management/artwork/:id', isAdmin, artworkController.updateAdminArtwork.bind(artworkController));
    adminRouter.delete('/management/artwork/:id', isAdmin, artworkController.deleteAdminArtwork.bind(artworkController));

    // 관리자 공지사항 관리
    adminRouter.get(['/management/notice', '/management/notice/list'], isAdmin, noticeController.getAdminNoticeList.bind(noticeController));
    adminRouter.get('/management/notice/:id', isAdmin, noticeController.getAdminNoticeDetail.bind(noticeController));
    adminRouter.put('/management/notice/:id', isAdmin, noticeController.updateAdminNotice.bind(noticeController));
    adminRouter.delete('/management/notice/:id', isAdmin, noticeController.deleteAdminNotice.bind(noticeController));

    router.use('/admin', adminRouter);

    return router;
};
