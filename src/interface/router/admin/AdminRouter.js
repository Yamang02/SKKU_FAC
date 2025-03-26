import express from 'express';
import { isAdmin } from '../../middleware/auth.js';

export const createAdminRouter = (container) => {
    const router = express.Router();
    const adminController = container.get('adminController');

    // 관리자 대시보드
    router.get(['/', '/dashboard'], isAdmin, adminController.getDashboard.bind(adminController));

    return router;
};
