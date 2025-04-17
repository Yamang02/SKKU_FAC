import express from 'express';
import UserController from './UserController.js';
import UserApiController from './api/UserApiController.js';
import { isAuthenticated, isNotAuthenticated } from '../../../common/middleware/auth.js';

const UserRouter = express.Router();
const userController = new UserController();
const userApiController = new UserApiController();
// === API 엔드포인트 ===

// 현재 사용자 프로필 정보 조회 API
UserRouter.get('/api/me', isAuthenticated, (req, res) => userApiController.getUserProfile(req, res));

// 현재 사용자 세션 정보 조회 API
UserRouter.get('/api/session', isAuthenticated, (req, res) => userApiController.getSessionUser(req, res));

// 사용자 데이터 조회 API
UserRouter.get('/api/data/:id', isAuthenticated, (req, res) => userApiController.getUserData(req, res));

// 사용자 목록 조회 API
UserRouter.get('/api/list', isAuthenticated, (req, res) => userApiController.getUserListData(req, res));

// 회원가입 API
UserRouter.post('/', isNotAuthenticated, (req, res) => userApiController.registerUser(req, res));

// 비밀번호 재설정 요청 API
UserRouter.post('/password/reset', isNotAuthenticated, (req, res) => userApiController.resetPassword(req, res));

// 플래시 메시지 API
UserRouter.get('/api/flash-message', (req, res) => userApiController.getFlashMessage(req, res));


UserRouter.post('/login', isNotAuthenticated, (req, res) => userApiController.loginUser(req, res));
UserRouter.get('/logout', (req, res) => userApiController.logoutUser(req, res));
UserRouter.put('/me', isAuthenticated, (req, res) => userApiController.updateUserProfile(req, res));
UserRouter.delete('/me', isAuthenticated, (req, res) => userApiController.deleteUserAccount(req, res));

// === 페이지 라우트 ===
// 로그인/로그아웃
UserRouter.get('/login', isNotAuthenticated, (req, res) => userController.getUserLoginPage(req, res));

// 회원가입
UserRouter.get('/new', isNotAuthenticated, (req, res) => userController.getUserRegistrationPage(req, res));

// 프로필
UserRouter.get('/me', isAuthenticated, (req, res) => userController.getUserProfilePage(req, res));

// 비밀번호 재설정
UserRouter.get('/password/forgot', isNotAuthenticated, (req, res) => userController.getUserPasswordForgotPage(req, res));
UserRouter.get('/password/reset', isNotAuthenticated, (req, res) => userController.getUserPasswordResetPage(req, res));

// 이메일 인증
UserRouter.get('/verify-email', (req, res) => userController.verifyEmail(req, res));


export default UserRouter;
