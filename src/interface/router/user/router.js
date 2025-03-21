import express from 'express';
import UserController from '../../controller/UserController.js';
import { isAuthenticated, isAdmin } from '../../middleware/AuthorizationMiddleware.js';

const router = express.Router();
const userController = new UserController();

// 로그인
router.get('/login', userController.getLoginPage);
router.post('/login', userController.login);

// 로그아웃
router.get('/logout', userController.logout);

// 회원가입
router.get('/register', userController.getRegisterPage);
router.post('/register', userController.register);

// 프로필 (인증 필요)
router.get('/profile', isAuthenticated, userController.getProfilePage);
router.get('/profile/edit', isAuthenticated, userController.getProfileEditPage);
router.post('/profile/edit', isAuthenticated, userController.updateProfile);

// 사용자 관리 (관리자 전용)
router.get('/management', isAuthenticated, isAdmin, userController.getUserList);
router.get('/management/stats', isAuthenticated, isAdmin, userController.getDashboardStats);
router.get('/management/:id', isAuthenticated, isAdmin, userController.getUserDetail);
router.delete('/management/:id', isAuthenticated, isAdmin, userController.deleteUser);
router.put('/management/:id/role', isAuthenticated, isAdmin, userController.updateUserRole);

export default router;
