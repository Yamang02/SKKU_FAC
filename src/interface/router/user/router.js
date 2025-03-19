import express from 'express';
import UserController from '../../../application/user/controller/UserController.js';
import { UserRole } from '../../../infrastructure/data/user.js';

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
router.get('/profile', userController.isAuthenticated, userController.getProfilePage);
router.get('/profile/edit', userController.isAuthenticated, userController.getProfileEditPage);
router.post('/profile/edit', userController.isAuthenticated, userController.updateProfile);

// 사용자 관리 (관리자 전용)
router.get('/management', userController.isAuthenticated, userController.hasRole(UserRole.ADMIN), userController.getUserList);
router.get('/management/stats', userController.isAuthenticated, userController.hasRole(UserRole.ADMIN), userController.getDashboardStats);
router.get('/management/:id', userController.isAuthenticated, userController.hasRole(UserRole.ADMIN), userController.getUserDetail);
router.delete('/management/:id', userController.isAuthenticated, userController.hasRole(UserRole.ADMIN), userController.deleteUser);
router.put('/management/:id/role', userController.isAuthenticated, userController.hasRole(UserRole.ADMIN), userController.updateUserRole);

export default router;
