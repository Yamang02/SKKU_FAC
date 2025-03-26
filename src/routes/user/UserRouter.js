import express from 'express';
import { isAdmin } from '../../middleware/auth.js';
import UserController from '../../controllers/UserController.js';

const UserRouter = express.Router();
const userController = new UserController();


// 사용자 인증 관련 라우트
UserRouter.get('/login', (req, res) => userController.getLoginPage(req, res));
UserRouter.post('/login', (req, res) => userController.login(req, res));
UserRouter.get('/logout', (req, res) => userController.logout(req, res));
UserRouter.get('/register', (req, res) => userController.getRegisterPage(req, res));
UserRouter.post('/register', (req, res) => userController.register(req, res));

// 사용자 프로필 관련 라우트
UserRouter.get('/profile', (req, res) => userController.getProfilePage(req, res));
UserRouter.get('/profile/edit', (req, res) => userController.getProfileEditPage(req, res));
UserRouter.post('/profile/edit', (req, res) => userController.updateProfile(req, res));

// 비밀번호 관련 라우트
UserRouter.get('/forgot-password', (req, res) => userController.getForgotPasswordPage(req, res));
UserRouter.post('/forgot-password', (req, res) => userController.handleForgotPassword(req, res));

// 관리자 사용자 관리 라우트
UserRouter.get('/admin/management/user/list', isAdmin, (req, res) => userController.getUserList(req, res));
UserRouter.get('/admin/management/user/:id', isAdmin, (req, res) => userController.getUserDetail(req, res));
UserRouter.delete('/admin/management/user/:id', isAdmin, (req, res) => userController.deleteUser(req, res));
UserRouter.put('/admin/management/user/:id/role', isAdmin, (req, res) => userController.updateUserRole(req, res));

export default UserRouter;
