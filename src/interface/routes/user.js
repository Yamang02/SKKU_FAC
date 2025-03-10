import express from 'express';
import * as UserController from '../../domain/user/controller/UserController.js';

const router = express.Router();

// 로그인 페이지
router.get('/login', UserController.getLoginPage);

// 로그인 처리
router.post('/login', UserController.login);

// 로그아웃
router.get('/logout', UserController.logout);

// 회원가입 페이지
router.get('/register', UserController.getRegisterPage);

// 회원가입 처리
router.post('/register', UserController.register);

export default router; 
