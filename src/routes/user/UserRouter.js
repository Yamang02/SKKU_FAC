import express from 'express';
import UserController from '../../controllers/UserController.js';
import { isAuthenticated, isNotAuthenticated } from '../../middleware/auth.js';

const UserRouter = express.Router();
const userController = new UserController();

// === API 엔드포인트 ===
// 사용자 데이터 조회 API
UserRouter.get('/api/data/:id', isAuthenticated, (req, res) => userController.getUserData(req, res));

// 사용자 목록 조회 API
UserRouter.get('/api/list', isAuthenticated, (req, res) => userController.getUserListData(req, res));

// === 페이지 라우트 ===
// 로그인/로그아웃
UserRouter.get('/login', isNotAuthenticated, (req, res) => userController.getUserLoginPage(req, res));
UserRouter.post('/login', isNotAuthenticated, (req, res) => userController.loginUser(req, res));
UserRouter.post('/logout', isAuthenticated, (req, res) => userController.logoutUser(req, res));

// 회원가입
UserRouter.get('/new', isNotAuthenticated, (req, res) => userController.getUserRegistrationPage(req, res));
UserRouter.post('/', isNotAuthenticated, (req, res) => userController.registerUser(req, res));

// 프로필
UserRouter.get('/me', isAuthenticated, (req, res) => userController.getUserProfilePage(req, res));
UserRouter.put('/me', isAuthenticated, (req, res) => userController.updateUserProfile(req, res));
UserRouter.delete('/me', isAuthenticated, (req, res) => userController.deleteUserAccount(req, res));

// 비밀번호 재설정
UserRouter.get('/password/reset', isNotAuthenticated, (req, res) => userController.getUserPasswordResetPage(req, res));
UserRouter.post('/password/reset', isNotAuthenticated, (req, res) => userController.handleUserPasswordReset(req, res));

// === 관리자 라우트 ===
// 사용자 관리
UserRouter.get('/admin/list', isAuthenticated, (req, res) => userController.getManagementUserList(req, res));
UserRouter.get('/admin/:id', isAuthenticated, (req, res) => userController.getManagementUserDetail(req, res));
UserRouter.put('/admin/:id', isAuthenticated, (req, res) => userController.updateManagementUser(req, res));
UserRouter.delete('/admin/:id', isAuthenticated, (req, res) => userController.deleteManagementUser(req, res));

export default UserRouter;
