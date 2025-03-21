import express from 'express';
import UserController from '../../controller/UserController.js';
import UserService from '../../../domain/user/service/UserService.js';
import UserUseCase from '../../../application/user/UserUseCase.js';
import { isAuthenticated, isAdmin } from '../../middleware/auth.js';

const router = express.Router();

// 의존성 주입
const userService = new UserService();
const userUseCase = new UserUseCase(userService);
const userController = new UserController(userUseCase);

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
router.get('/management', isAdmin, userController.getUserList);
router.get('/management/stats/dashboard', isAdmin, userController.getDashboardStats);
router.get('/management/:id', isAdmin, userController.getUserDetail);
router.delete('/management/:id', isAdmin, userController.deleteUser);
router.put('/management/:id/role', isAdmin, userController.updateUserRole);

export default router;
