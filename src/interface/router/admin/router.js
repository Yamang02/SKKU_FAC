import express from 'express';
import AdminController from '../../controller/AdminController.js';
import { isAdmin } from '../../middleware/AuthorizationMiddleware.js';

const router = express.Router();
const adminController = new AdminController();

// 관리자 대시보드
router.get('/', isAdmin, adminController.getDashboard);

// 사용자 관리
router.get('/users', isAdmin, adminController.getUserManagement);

// 전시 관리
router.get('/exhibitions', isAdmin, adminController.getExhibitionManagement);

// 작품 관리
router.get('/artworks', isAdmin, adminController.getArtworkManagement);

// 공지사항 관리
router.get('/notices', isAdmin, adminController.getNoticeManagement);

export default router;
