import express from 'express';
import { imageUploadMiddleware } from '../../../common/middleware/imageUploadMiddleware.js';
import {
    canAccessAdminPanel,
    canViewAdminDashboard,
    canReadUsers,
    canWriteUsers,
    canManageUserDetails,
    canResetUserPassword,
    canDeleteUsers,
    canReadContent,
    canWriteContent,
    canDeleteContent,
    canViewArtworkDetails,
    canFeatureArtworks,
    canViewExhibitionDetails,
    canFeatureExhibitions,
    isReadOnlyAdmin
} from '../../../common/middleware/auth.js';


/**
 * 관리자 라우터 팩토리 함수
 * 의존성 주입 컨테이너를 받아서 라우터를 생성합니다.
 * @param {Container} container - 의존성 주입 컨테이너
 * @returns {express.Router} 생성된 라우터
 */
export function createAdminRouter(container) {
    const AdminRouter = express.Router();

    // 모든 admin 라우트에 기본 admin 패널 접근 권한 체크
    AdminRouter.use(canAccessAdminPanel());

    // 의존성 주입된 컨트롤러들을 해결
    const adminController = container.resolve('SystemManagementController');
    const userManagementController = container.resolve('UserManagementController');
    const exhibitionManagementController = container.resolve('ExhibitionManagementController');
    const artworkManagementController = container.resolve('ArtworkManagementController');
    const batchController = container.resolve('BatchController');

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

    // 읽기 전용 관리자 체크 미들웨어
    const preventReadOnlyActions = (req, res, next) => {
        // GET 요청은 허용
        if (req.method === 'GET') {
            return next();
        }

        // 읽기 전용 관리자인 경우 쓰기 작업 차단
        isReadOnlyAdmin()(req, res, err => {
            if (err) return next(err);

            // 읽기 전용 관리자라면 403 반환
            return res.status(403).json({
                success: false,
                error: '읽기 전용 관리자는 수정 작업을 수행할 수 없습니다.'
            });
        });
    };

    // 관리자 대시보드
    AdminRouter.get(['/', '/dashboard'], canViewAdminDashboard(), (req, res) => adminController.getDashboard(req, res));

    // 사용자 관리 라우트
    AdminRouter.get('/management/user', canReadUsers(), (req, res) =>
        userManagementController.getManagementUserList(req, res)
    );
    AdminRouter.get(
        '/management/user/:id',
        canManageUserDetails(),
        (req, res) => userManagementController.getManagementUserDetail(req, res)
    );
    AdminRouter.put(
        '/management/user/:id',
        canWriteUsers(),
        preventReadOnlyActions,
        (req, res) => userManagementController.updateManagementUser(req, res)
    );
    AdminRouter.delete(
        '/management/user/:id',
        canDeleteUsers(),
        preventReadOnlyActions,
        deleteTimeoutMiddleware,
        (req, res) => userManagementController.deleteManagementUser(req, res)
    );
    AdminRouter.post(
        '/management/user/:id/reset-password',
        canResetUserPassword(),
        preventReadOnlyActions,
        (req, res) => userManagementController.resetManagementUserPassword(req, res)
    );

    // 전시회 관리 라우트
    AdminRouter.get(
        '/management/exhibition',
        canReadContent(),
        (req, res) => exhibitionManagementController.getManagementExhibitionListPage(req, res)
    );
    AdminRouter.get('/management/exhibition/new', canWriteContent(), (req, res) =>
        exhibitionManagementController.getManagementExhibitionCreatePage(req, res)
    );
    AdminRouter.post(
        '/management/exhibition/new',
        canWriteContent(),
        preventReadOnlyActions,
        imageUploadMiddleware('exhibition'),
        (req, res) => exhibitionManagementController.createManagementExhibition(req, res)
    );
    AdminRouter.get(
        '/management/exhibition/:id',
        canViewExhibitionDetails(),
        (req, res) => exhibitionManagementController.getManagementExhibitionDetailPage(req, res)
    );
    AdminRouter.put(
        '/management/exhibition/:id',
        canWriteContent(),
        preventReadOnlyActions,
        (req, res) => exhibitionManagementController.updateManagementExhibition(req, res)
    );
    AdminRouter.delete(
        '/management/exhibition/:id',
        canDeleteContent(),
        preventReadOnlyActions,
        deleteTimeoutMiddleware,
        (req, res) => exhibitionManagementController.deleteManagementExhibition(req, res)
    );
    AdminRouter.post(
        '/management/exhibition/:id/featured',
        canFeatureExhibitions(),
        preventReadOnlyActions,
        (req, res) => exhibitionManagementController.toggleFeatured(req, res)
    );

    // 작품 관리 라우트
    AdminRouter.get(
        '/management/artwork',
        canReadContent(),
        (req, res) => artworkManagementController.getManagementArtworkListPage(req, res)
    );
    AdminRouter.get(
        '/management/artwork/:id',
        canViewArtworkDetails(),
        (req, res) => artworkManagementController.getManagementArtworkDetailPage(req, res)
    );
    AdminRouter.put(
        '/management/artwork/:id',
        canWriteContent(),
        preventReadOnlyActions,
        (req, res) => artworkManagementController.updateManagementArtwork(req, res)
    );
    AdminRouter.delete(
        '/management/artwork/:id',
        canDeleteContent(),
        preventReadOnlyActions,
        deleteTimeoutMiddleware,
        (req, res) => artworkManagementController.deleteManagementArtwork(req, res)
    );
    AdminRouter.post(
        '/management/artwork/:id/featured',
        canFeatureArtworks(),
        preventReadOnlyActions,
        (req, res) => artworkManagementController.toggleFeatured(req, res)
    );

    // 배치 처리 라우트
    AdminRouter.get('/batch', canWriteContent(), (req, res) => batchController.getBatchJobListPage(req, res));
    AdminRouter.get('/batch/:jobId', canWriteContent(), (req, res) => batchController.getBatchJobDetailPage(req, res));
    AdminRouter.post('/batch/:jobId/cancel', canWriteContent(), preventReadOnlyActions, (req, res) =>
        batchController.cancelBatchJob(req, res)
    );

    // 배치 작업 생성 라우트
    AdminRouter.post('/batch/bulk-delete-users', canDeleteUsers(), preventReadOnlyActions, (req, res) =>
        batchController.createBulkDeleteUsersJob(req, res)
    );
    AdminRouter.post('/batch/bulk-delete-artworks', canDeleteContent(), preventReadOnlyActions, (req, res) =>
        batchController.createBulkDeleteArtworksJob(req, res)
    );
    AdminRouter.post('/batch/bulk-delete-exhibitions', canDeleteContent(), preventReadOnlyActions, (req, res) =>
        batchController.createBulkDeleteExhibitionsJob(req, res)
    );
    AdminRouter.post('/batch/bulk-feature-toggle', canWriteContent(), preventReadOnlyActions, (req, res) =>
        batchController.createBulkFeatureToggleJob(req, res)
    );

    // 배치 작업 API 라우트 (AJAX용)
    AdminRouter.get('/api/batch/:jobId/status', canReadContent(), (req, res) =>
        batchController.getBatchJobStatusAPI(req, res)
    );
    AdminRouter.get('/api/batch/stats', canReadContent(), (req, res) => batchController.getBatchJobStatsAPI(req, res));


    return AdminRouter;
}
