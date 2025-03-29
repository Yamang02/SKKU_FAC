import express from 'express';
import { isAdmin } from '../../middleware/auth.js';
import AdminController from '../../controllers/AdminController.js';
import UserController from '../../controllers/UserController.js';
import ExhibitionController from '../../controllers/ExhibitionController.js';
import ArtworkController from '../../controllers/ArtworkController.js';
import NoticeController from '../../controllers/NoticeController.js';

const AdminRouter = express.Router();
const adminController = new AdminController();
const userController = new UserController();
const exhibitionController = new ExhibitionController();
const artworkController = new ArtworkController();
const noticeController = new NoticeController();


// 관리자 대시보드
AdminRouter.get(['/', '/dashboard'], isAdmin, (req, res) => adminController.getDashboard(req, res));

// 사용자 관리
AdminRouter.get('/management/user/list', isAdmin, (req, res) => userController.getManagementUserList(req, res));
AdminRouter.get('/management/user/:id([0-9]+)', isAdmin, (req, res) => userController.getManagementUserDetail(req, res));
AdminRouter.post('/management/user/:id([0-9]+)/delete', isAdmin, (req, res) => userController.deleteUser(req, res));
AdminRouter.post('/management/user/:id([0-9]+)/role', isAdmin, (req, res) => userController.updateUserRole(req, res));

// 전시회 관리
AdminRouter.get('/management/exhibition', isAdmin, (req, res) => exhibitionController.getManagementExhibitionList(req, res));
AdminRouter.get('/management/exhibition/register', isAdmin, (req, res) => exhibitionController.getExhibitionCreatePage(req, res));
AdminRouter.get('/management/exhibition/:id([0-9]+)', isAdmin, (req, res) => exhibitionController.getManagementExhibitionDetail(req, res));
AdminRouter.post('/management/exhibition/register', isAdmin, (req, res) => exhibitionController.createExhibition(req, res));
AdminRouter.put('/management/exhibition/:id([0-9]+)', isAdmin, (req, res) => exhibitionController.updateExhibition(req, res));
AdminRouter.delete('/management/exhibition/:id([0-9]+)', isAdmin, (req, res) => exhibitionController.deleteExhibition(req, res));

// 작품 관리
AdminRouter.get('/management/artwork', isAdmin, (req, res) => artworkController.getManagementArtworkList(req, res));
AdminRouter.get('/management/artwork/:id([0-9]+)', isAdmin, (req, res) => artworkController.getManagementArtworkDetail(req, res));
AdminRouter.get('/management/artwork/:id([0-9]+)/edit', isAdmin, (req, res) => artworkController.getManagementArtworkEditPage(req, res));
AdminRouter.put('/management/artwork/:id([0-9]+)', isAdmin, (req, res) => artworkController.updateManagementArtwork(req, res));
AdminRouter.delete('/management/artwork/:id([0-9]+)', isAdmin, (req, res) => artworkController.deleteManagementArtwork(req, res));

// 공지사항 관리
AdminRouter.get('/management/notice', isAdmin, (req, res) => noticeController.getManagementNoticeList(req, res));
AdminRouter.get('/management/notice/:id([0-9]+)', isAdmin, (req, res) => noticeController.getManagementNoticeDetail(req, res));
AdminRouter.get('/management/notice/register', isAdmin, (req, res) => noticeController.getNoticeRegisterPage(req, res));
AdminRouter.post('/management/notice', isAdmin, (req, res) => noticeController.createNotice(req, res));
AdminRouter.put('/management/notice/:id([0-9]+)/edit', isAdmin, (req, res) => noticeController.updateNotice(req, res));
AdminRouter.delete('/management/notice/:id([0-9]+)', isAdmin, (req, res) => noticeController.deleteNotice(req, res));

export default AdminRouter;
