import express from 'express';
import UserController from '../../controllers/UserController.js';
import { isAuthenticated, isNotAuthenticated } from '../../middleware/auth.js';

const UserRouter = express.Router();
const userController = new UserController();

// 로그인/로그아웃
UserRouter.get('/login', isNotAuthenticated, (req, res) => userController.getUserLoginPage(req, res));
UserRouter.post('/login', isNotAuthenticated, (req, res) => userController.loginUser(req, res));
UserRouter.get('/logout', isAuthenticated, (req, res) => userController.logoutUser(req, res));

// 회원가입
UserRouter.get('/registration', isNotAuthenticated, (req, res) => userController.getUserRegistrationPage(req, res));
UserRouter.post('/registration', isNotAuthenticated, (req, res) => userController.registerUser(req, res));

// 프로필
UserRouter.get('/profile', isAuthenticated, (req, res) => userController.getUserProfilePage(req, res));
UserRouter.put('/profile', isAuthenticated, (req, res) => userController.updateUserProfile(req, res));
UserRouter.delete('/profile', isAuthenticated, (req, res) => userController.deleteUserAccount(req, res));

// 비밀번호 찾기
UserRouter.get('/password/reset', isNotAuthenticated, (req, res) => userController.getUserPasswordResetPage(req, res));
UserRouter.post('/password/reset', isNotAuthenticated, (req, res) => userController.handleUserPasswordReset(req, res));

export default UserRouter;
