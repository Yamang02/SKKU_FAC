const express = require('express');
const router = express.Router();
const UserController = require('../../domain/user/controller/UserController');

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

module.exports = router; 