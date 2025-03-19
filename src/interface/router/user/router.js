import express from 'express';
import UserController from '../../../domain/user/controller/UserController.js';

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

export default router;
