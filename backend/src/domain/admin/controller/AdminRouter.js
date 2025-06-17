import express from 'express';
import {
    requireAdminAccess,
    requireUserManagement,
    requireContentManagement
} from '../../../common/middleware/auth.js';

/**
 * 관리자 메인 라우터 팩토리 함수
 * 각 도메인별 admin 라우터들을 마운트하여 통합 관리합니다.
 * @param {Container} container - 의존성 주입 컨테이너
 * @returns {express.Router} 생성된 라우터
 */
export function createAdminRouter(container) {
    const AdminRouter = express.Router();

    // 모든 admin 라우트에 기본 admin 패널 접근 권한 체크
    AdminRouter.use(requireAdminAccess());

    // 의존성 주입된 컨트롤러들을 해결
    const systemManagementController = container.resolve('SystemManagementController');

    // ==================== 대시보드 (전 도메인 커버) ==================== //
    AdminRouter.get(['/', '/dashboard'], requireUserManagement(), (req, res) =>
        systemManagementController.getDashboard(req, res)
    );

    // ==================== 시스템 관리 (전 도메인 커버) ==================== //
    AdminRouter.get('/system', requireUserManagement(), (req, res) =>
        systemManagementController.getSystemInfo(req, res)
    );

    AdminRouter.get('/system/health', requireUserManagement(), (req, res) =>
        systemManagementController.getSystemHealth(req, res)
    );

    AdminRouter.get('/system/stats', requireUserManagement(), (req, res) =>
        systemManagementController.getSystemStats(req, res)
    );

    // ==================== 도메인별 Admin 라우터 마운트 ==================== //

    // 사용자 관리 라우터 마운트
    const userAdminApiController = container.resolve('UserAdminApiController');
    const userAdminRouter = express.Router();

    // User Admin Routes
    userAdminRouter.get('/', requireUserManagement(), (req, res) =>
        userAdminApiController.getUsers(req, res)
    );
    userAdminRouter.get('/:id', requireUserManagement(), (req, res) =>
        userAdminApiController.getUser(req, res)
    );
    userAdminRouter.post('/', requireUserManagement(), (req, res) =>
        userAdminApiController.createUser(req, res)
    );
    userAdminRouter.put('/:id', requireUserManagement(), (req, res) =>
        userAdminApiController.updateUser(req, res)
    );
    userAdminRouter.delete('/:id', requireUserManagement(), (req, res) =>
        userAdminApiController.deleteUser(req, res)
    );
    userAdminRouter.put('/:id/role', requireUserManagement(), (req, res) =>
        userAdminApiController.updateUserRole(req, res)
    );
    userAdminRouter.post('/:id/reset-password', requireUserManagement(), (req, res) =>
        userAdminApiController.resetUserPassword(req, res)
    );
    userAdminRouter.get('/stats', requireUserManagement(), (req, res) =>
        userAdminApiController.getUserStats(req, res)
    );

    AdminRouter.use('/users', userAdminRouter);

    // 전시회 관리 라우터 마운트
    const exhibitionAdminApiController = container.resolve('ExhibitionAdminApiController');
    const exhibitionAdminRouter = express.Router();

    // Exhibition Admin Routes
    exhibitionAdminRouter.get('/', requireContentManagement(), (req, res) =>
        exhibitionAdminApiController.getExhibitionList(req, res)
    );
    exhibitionAdminRouter.get('/:id', requireContentManagement(), (req, res) =>
        exhibitionAdminApiController.getExhibitionDetail(req, res)
    );
    exhibitionAdminRouter.post('/', requireContentManagement(), (req, res) =>
        exhibitionAdminApiController.createExhibition(req, res)
    );
    exhibitionAdminRouter.put('/:id', requireContentManagement(), (req, res) =>
        exhibitionAdminApiController.updateExhibition(req, res)
    );
    exhibitionAdminRouter.delete('/:id', requireContentManagement(), (req, res) =>
        exhibitionAdminApiController.deleteExhibition(req, res)
    );
    exhibitionAdminRouter.post('/:id/toggle-featured', requireContentManagement(), (req, res) =>
        exhibitionAdminApiController.toggleFeatured(req, res)
    );
    exhibitionAdminRouter.put('/:id/status', requireContentManagement(), (req, res) =>
        exhibitionAdminApiController.changeExhibitionStatus(req, res)
    );
    exhibitionAdminRouter.put('/:id/submission-status', requireContentManagement(), (req, res) =>
        exhibitionAdminApiController.updateSubmissionStatus(req, res)
    );
    exhibitionAdminRouter.get('/by-status/:status', requireContentManagement(), (req, res) =>
        exhibitionAdminApiController.getExhibitionsByStatus(req, res)
    );
    exhibitionAdminRouter.get('/:id/artworks', requireContentManagement(), (req, res) =>
        exhibitionAdminApiController.getExhibitionArtworks(req, res)
    );
    exhibitionAdminRouter.post('/:id/artworks', requireContentManagement(), (req, res) =>
        exhibitionAdminApiController.addArtworkToExhibition(req, res)
    );
    exhibitionAdminRouter.delete('/:id/artworks/:artworkId', requireContentManagement(), (req, res) =>
        exhibitionAdminApiController.removeArtworkFromExhibition(req, res)
    );

    AdminRouter.use('/exhibitions', exhibitionAdminRouter);

    // 작품 관리 라우터 마운트
    const artworkAdminApiController = container.resolve('ArtworkAdminApiController');
    const artworkAdminRouter = express.Router();

    // Artwork Admin Routes
    artworkAdminRouter.get('/', requireContentManagement(), (req, res) =>
        artworkAdminApiController.getArtworkList(req, res)
    );
    artworkAdminRouter.get('/:id', requireContentManagement(), (req, res) =>
        artworkAdminApiController.getArtworkDetail(req, res)
    );
    artworkAdminRouter.post('/', requireContentManagement(), (req, res) =>
        artworkAdminApiController.createArtwork(req, res)
    );
    artworkAdminRouter.put('/:id', requireContentManagement(), (req, res) =>
        artworkAdminApiController.updateArtwork(req, res)
    );
    artworkAdminRouter.delete('/:id', requireContentManagement(), (req, res) =>
        artworkAdminApiController.deleteArtwork(req, res)
    );
    artworkAdminRouter.put('/:id/approve', requireContentManagement(), (req, res) =>
        artworkAdminApiController.approveArtwork(req, res)
    );
    artworkAdminRouter.put('/:id/reject', requireContentManagement(), (req, res) =>
        artworkAdminApiController.rejectArtwork(req, res)
    );
    artworkAdminRouter.get('/stats', requireContentManagement(), (req, res) =>
        artworkAdminApiController.getArtworkStats(req, res)
    );
    artworkAdminRouter.post('/:id/upload-image', requireContentManagement(), (req, res) =>
        artworkAdminApiController.uploadArtworkImage(req, res)
    );
    artworkAdminRouter.put('/:id/status', requireContentManagement(), (req, res) =>
        artworkAdminApiController.updateArtworkStatus(req, res)
    );
    artworkAdminRouter.post('/:id/toggle-featured', requireContentManagement(), (req, res) =>
        artworkAdminApiController.toggleFeatured(req, res)
    );
    artworkAdminRouter.get('/form-data', requireContentManagement(), (req, res) =>
        artworkAdminApiController.getArtworkFormData(req, res)
    );

    AdminRouter.use('/artworks', artworkAdminRouter);

    // ==================== 기존 EJS 라우트 리다이렉션 (하위 호환성) ==================== //
    // 기존 management 경로를 새로운 RESTful 경로로 리다이렉트
    AdminRouter.get('/management/user', (req, res) => res.redirect(301, '/admin/users'));
    AdminRouter.get('/management/user/:id', (req, res) => res.redirect(301, `/admin/users/${req.params.id}`));
    AdminRouter.get('/management/exhibition', (req, res) => res.redirect(301, '/admin/exhibitions'));
    AdminRouter.get('/management/exhibition/:id', (req, res) => res.redirect(301, `/admin/exhibitions/${req.params.id}`));
    AdminRouter.get('/management/artwork', (req, res) => res.redirect(301, '/admin/artworks'));
    AdminRouter.get('/management/artwork/:id', (req, res) => res.redirect(301, `/admin/artworks/${req.params.id}`));

    return AdminRouter;
}
