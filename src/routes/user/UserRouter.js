import express from 'express';
import { isAuthenticated, isNotAuthenticated } from '../../middleware/auth.js';
import UserController from '../../controllers/UserController.js';

const UserRouter = express.Router();
const userController = new UserController();


// 사용자 인증 관련 라우트
UserRouter.get('/login', isNotAuthenticated, (req, res) => userController.getLoginPage(req, res));
UserRouter.post('/login', isNotAuthenticated, (req, res) => userController.login(req, res));
UserRouter.post('/logout', isAuthenticated, (req, res) => userController.logout(req, res));
UserRouter.get('/register', isNotAuthenticated, (req, res) => userController.getRegisterPage(req, res));
UserRouter.post('/register', isNotAuthenticated, (req, res) => userController.register(req, res));

// 사용자 프로필 관련 라우트
UserRouter.get('/profile', isAuthenticated, (req, res) => userController.getProfilePage(req, res));
UserRouter.get('/profile/edit', isAuthenticated, (req, res) => userController.getProfileEditPage(req, res));
UserRouter.post('/profile/edit', isAuthenticated, (req, res) => userController.updateProfile(req, res));
UserRouter.post('/profile/delete', isAuthenticated, (req, res) => userController.deleteUser(req, res));

// 비밀번호 관련 라우트
UserRouter.get('/forgot-password', isNotAuthenticated, (req, res) => userController.getForgotPasswordPage(req, res));
UserRouter.post('/forgot-password', isNotAuthenticated, (req, res) => userController.handleForgotPassword(req, res));


export default UserRouter;
