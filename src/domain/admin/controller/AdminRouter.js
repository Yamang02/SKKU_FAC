import express from 'express';
import { SystemManagementController, UserManagementController, ExhibitionManagementController, ArtworkManagementController, NoticeManagementController } from './AdminControllerIndex.js';

const AdminRouter = express.Router();
const adminController = new SystemManagementController();
const userManagementController = new UserManagementController();
const exhibitionManagementController = new ExhibitionManagementController();
const artworkManagementController = new ArtworkManagementController();
const noticeManagementController = new NoticeManagementController();


// 관리자 대시보드
AdminRouter.get(['/', '/dashboard'], (req, res) => adminController.getDashboard(req, res));

// 사용자 관리
AdminRouter.get('/management/user', (req, res) => userManagementController.getManagementUserList(req, res));
AdminRouter.get('/management/user/:id', (req, res) => userManagementController.getManagementUserDetail(req, res));
AdminRouter.put('/management/user/:id', (req, res) => userManagementController.updateManagementUser(req, res));
AdminRouter.delete('/management/user/:id', (req, res) => userManagementController.deleteManagementUser(req, res));
AdminRouter.post('/management/user/:id/reset-password', (req, res) => userManagementController.resetManagementUserPassword(req, res));

// 전시회 관리
AdminRouter.get('/management/exhibition', (req, res) => exhibitionManagementController.getManagementExhibitionListPage(req, res));
AdminRouter.get('/management/exhibition/registration', (req, res) => exhibitionManagementController.getManagementExhibitionCreatePage(req, res));
AdminRouter.post('/management/exhibition/registration', (req, res) => exhibitionManagementController.createManagementExhibition(req, res));
AdminRouter.get('/management/exhibition/:id([0-9]+)', (req, res) => exhibitionManagementController.getManagementExhibitionDetailPage(req, res));
AdminRouter.put('/management/exhibition/:id([0-9]+)', (req, res) => exhibitionManagementController.updateManagementExhibition(req, res));
AdminRouter.delete('/management/exhibition/:id([0-9]+)', (req, res) => exhibitionManagementController.deleteManagementExhibition(req, res));

// 작품 관리
AdminRouter.get('/management/artwork', (req, res) => artworkManagementController.getManagementArtworkListPage(req, res));
AdminRouter.delete('/management/artwork/:id([0-9]+)', (req, res) => artworkManagementController.deleteManagementArtwork(req, res));

// 공지사항 관리
AdminRouter.get('/management/notice', (req, res) => noticeManagementController.getManagementNoticeList(req, res));
AdminRouter.get('/management/notice/registration', (req, res) => noticeManagementController.getManagementNoticeRegistrationPage(req, res));
AdminRouter.post('/management/notice/registration', (req, res) => noticeManagementController.createManagementNotice(req, res));
AdminRouter.get('/management/notice/:id([0-9]+)', (req, res) => noticeManagementController.getManagementNoticeDetail(req, res));
AdminRouter.put('/management/notice/:id([0-9]+)', (req, res) => noticeManagementController.updateManagementNotice(req, res));
AdminRouter.delete('/management/notice/:id([0-9]+)', (req, res) => noticeManagementController.deleteManagementNotice(req, res));

export default AdminRouter;
