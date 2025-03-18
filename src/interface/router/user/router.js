import express from 'express';
import UserController from '../../../domain/user/controller/UserController.js';

const router = express.Router();
const userController = new UserController();

// 로그인 페이지
router.get('/login', userController.getLoginPage);

// 로그인 처리
router.post('/login', userController.login);

// 로그아웃
router.get('/logout', userController.logout);

// 회원가입 페이지
router.get('/register', userController.getRegisterPage);

// 회원가입 처리
router.post('/register', userController.register);

export default router;
