import express from 'express';
import { isAdmin } from '../../middleware/auth.js';
import AdminController from '../../controllers/AdminController.js';

const AdminRouter = express.Router();
const adminController = new AdminController();

// 관리자 대시보드
AdminRouter.get(['/', '/dashboard'], isAdmin, adminController.getDashboard);

export default AdminRouter;
