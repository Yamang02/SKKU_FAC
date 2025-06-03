import express from 'express';
import { UserManagementController, ExhibitionManagementController, ArtworkManagementController } from './AdminControllerIndex.js';
import { imageUploadMiddleware } from '../../../common/middleware/imageUploadMiddleware.js';

/**
 * 관리자 라우터 팩토리 함수
 * 의존성 주입 컨테이너를 받아서 라우터를 생성합니다.
 * @param {Container} container - 의존성 주입 컨테이너
 * @returns {express.Router} 생성된 라우터
 */
export function createAdminRouter(container) {
    const AdminRouter = express.Router();

    // 의존성 주입된 컨트롤러들을 해결
    const adminController = container.resolve('SystemManagementController');

    // 아직 의존성 주입 미적용된 컨트롤러들
    const userManagementController = new UserManagementController();
    const exhibitionManagementController = new ExhibitionManagementController();
    const artworkManagementController = new ArtworkManagementController();

    // 타임아웃 미들웨어 (삭제 작업용)
    const deleteTimeoutMiddleware = (req, res, next) => {
        // 삭제 작업에 대해 30초 타임아웃 설정
        req.setTimeout(30000, () => {
            console.log('요청 타임아웃 발생 - 30초 초과');
            if (!res.headersSent) {
                res.status(408).json({
                    success: false,
                    message: '요청 처리 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.'
                });
            }
        });
        next();
    };

    // 관리자 대시보드
    AdminRouter.get(['/', '/dashboard'], (req, res) => adminController.getDashboard(req, res));

    // 사용자 관리
    AdminRouter.get('/management/user', (req, res) => userManagementController.getManagementUserList(req, res));
    AdminRouter.get('/management/user/:id', (req, res) => userManagementController.getManagementUserDetail(req, res));
    AdminRouter.put('/management/user/:id', (req, res) => userManagementController.updateManagementUser(req, res));
    AdminRouter.delete('/management/user/:id', deleteTimeoutMiddleware, (req, res) => userManagementController.deleteManagementUser(req, res));
    AdminRouter.post('/management/user/:id/reset-password', (req, res) => userManagementController.resetManagementUserPassword(req, res));

    // 전시회 관리
    AdminRouter.get('/management/exhibition', (req, res) => exhibitionManagementController.getManagementExhibitionListPage(req, res));
    AdminRouter.get('/management/exhibition/new', (req, res) => exhibitionManagementController.getManagementExhibitionCreatePage(req, res));
    AdminRouter.post('/management/exhibition/new', imageUploadMiddleware('exhibition'), (req, res) => exhibitionManagementController.createManagementExhibition(req, res));
    AdminRouter.get('/management/exhibition/:id', (req, res) => exhibitionManagementController.getManagementExhibitionDetailPage(req, res));
    AdminRouter.put('/management/exhibition/:id', (req, res) => exhibitionManagementController.updateManagementExhibition(req, res));
    AdminRouter.delete('/management/exhibition/:id', deleteTimeoutMiddleware, (req, res) => exhibitionManagementController.deleteManagementExhibition(req, res));
    AdminRouter.post('/management/exhibition/:id/featured', (req, res) => exhibitionManagementController.toggleFeatured(req, res));

    // 작품 관리
    AdminRouter.get('/management/artwork', (req, res) => artworkManagementController.getManagementArtworkListPage(req, res));
    AdminRouter.get('/management/artwork/:id', (req, res) => artworkManagementController.getManagementArtworkDetailPage(req, res));
    AdminRouter.put('/management/artwork/:id', (req, res) => artworkManagementController.updateManagementArtwork(req, res));
    AdminRouter.delete('/management/artwork/:id', deleteTimeoutMiddleware, (req, res) => artworkManagementController.deleteManagementArtwork(req, res));
    AdminRouter.post('/management/artwork/:id/featured', (req, res) => artworkManagementController.toggleFeatured(req, res));

    return AdminRouter;
}
