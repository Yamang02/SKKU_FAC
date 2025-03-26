import express from 'express';
import { isAdmin } from '../../middleware/auth.js';

export const createUserRouter = (container) => {
    const router = express.Router();
    const userController = container.get('userController');
    const adminController = container.get('adminController');

    // 사용자 인증 관련 라우트
    router.get('/login', userController.getLoginPage.bind(userController));
    router.post('/login', userController.login.bind(userController));
    router.get('/logout', userController.logout.bind(userController));
    router.get('/register', userController.getRegisterPage.bind(userController));
    router.post('/register', userController.register.bind(userController));

    // 사용자 프로필 관련 라우트
    router.get('/profile', userController.getProfilePage.bind(userController));
    router.get('/profile/edit', userController.getProfileEditPage.bind(userController));
    router.post('/profile/edit', userController.updateProfile.bind(userController));

    // 비밀번호 관련 라우트
    router.get('/forgot-password', userController.getForgotPasswordPage.bind(userController));
    router.post('/forgot-password', userController.handleForgotPassword.bind(userController));

    // 관리자 사용자 관리 라우트
    router.get(['/management/list', '/management'], isAdmin, adminController.getUserManagement.bind(adminController));
    router.get('/management/:id', isAdmin, adminController.getUserDetail.bind(adminController));

    return router;
};
