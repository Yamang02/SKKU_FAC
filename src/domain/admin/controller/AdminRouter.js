import express from 'express';
import { imageUploadMiddleware } from '../../../common/middleware/imageUploadMiddleware.js';
import {
    requireAdminAccess,
    requireUserManagement,
    requireContentManagement,
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
    AdminRouter.use(requireAdminAccess());

    // 의존성 주입된 컨트롤러들을 해결
    const adminController = container.resolve('SystemManagementController');
    const userAdminController = container.resolve('UserAdminController');
    const exhibitionManagementController = container.resolve('ExhibitionManagementController');
    const artworkAdminController = container.resolve('ArtworkAdminController');
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
    AdminRouter.get(['/', '/dashboard'], requireUserManagement(), (req, res) => adminController.getDashboard(req, res));

    // 사용자 관리 라우트
    AdminRouter.get('/management/user', requireUserManagement(), (req, res) =>
        userAdminController.getManagementUserList(req, res)
    );
    AdminRouter.get(
        '/management/user/:id',
        requireUserManagement(),
        (req, res) => userAdminController.getManagementUserDetail(req, res)
    );
    AdminRouter.put(
        '/management/user/:id',
        requireUserManagement(),
        preventReadOnlyActions,
        (req, res) => userAdminController.updateManagementUser(req, res)
    );
    AdminRouter.delete(
        '/management/user/:id',
        requireUserManagement(),
        preventReadOnlyActions,
        deleteTimeoutMiddleware,
        (req, res) => userAdminController.deleteManagementUser(req, res)
    );
    AdminRouter.post(
        '/management/user/:id/reset-password',
        requireUserManagement(),
        preventReadOnlyActions,
        (req, res) => userAdminController.resetManagementUserPassword(req, res)
    );

    // 전시회 관리 라우트
    AdminRouter.get(
        '/management/exhibition',
        requireContentManagement(),
        (req, res) => exhibitionManagementController.getManagementExhibitionListPage(req, res)
    );
    AdminRouter.get('/management/exhibition/new', requireContentManagement(), (req, res) =>
        exhibitionManagementController.getManagementExhibitionCreatePage(req, res)
    );
    AdminRouter.post(
        '/management/exhibition/new',
        requireContentManagement(),
        preventReadOnlyActions,
        imageUploadMiddleware('exhibition'),
        (req, res) => exhibitionManagementController.createManagementExhibition(req, res)
    );
    AdminRouter.get(
        '/management/exhibition/:id',
        requireContentManagement(),
        (req, res) => exhibitionManagementController.getManagementExhibitionDetailPage(req, res)
    );
    AdminRouter.put(
        '/management/exhibition/:id',
        requireContentManagement(),
        preventReadOnlyActions,
        (req, res) => exhibitionManagementController.updateManagementExhibition(req, res)
    );
    AdminRouter.delete(
        '/management/exhibition/:id',
        requireContentManagement(),
        preventReadOnlyActions,
        deleteTimeoutMiddleware,
        (req, res) => exhibitionManagementController.deleteManagementExhibition(req, res)
    );
    AdminRouter.post(
        '/management/exhibition/:id/featured',
        requireContentManagement(),
        preventReadOnlyActions,
        (req, res) => exhibitionManagementController.toggleFeatured(req, res)
    );

    // 작품 관리 라우트
    AdminRouter.get(
        '/management/artwork',
        requireContentManagement(),
        (req, res) => artworkAdminController.getManagementArtworkListPage(req, res)
    );
    AdminRouter.get(
        '/management/artwork/:id',
        requireContentManagement(),
        (req, res) => artworkAdminController.getManagementArtworkDetailPage(req, res)
    );
    AdminRouter.put(
        '/management/artwork/:id',
        requireContentManagement(),
        preventReadOnlyActions,
        (req, res) => artworkAdminController.updateManagementArtwork(req, res)
    );
    AdminRouter.delete(
        '/management/artwork/:id',
        requireContentManagement(),
        preventReadOnlyActions,
        deleteTimeoutMiddleware,
        (req, res) => artworkAdminController.deleteManagementArtwork(req, res)
    );
    AdminRouter.post(
        '/management/artwork/:id/featured',
        requireContentManagement(),
        preventReadOnlyActions,
        (req, res) => artworkAdminController.toggleFeatured(req, res)
    );

    // 배치 처리 라우트
    AdminRouter.get('/batch', requireContentManagement(), (req, res) => batchController.getBatchJobListPage(req, res));
    AdminRouter.get('/batch/:jobId', requireContentManagement(), (req, res) => batchController.getBatchJobDetailPage(req, res));
    AdminRouter.post('/batch/:jobId/cancel', requireContentManagement(), preventReadOnlyActions, (req, res) =>
        batchController.cancelBatchJob(req, res)
    );

    // 배치 작업 생성 라우트
    AdminRouter.post('/batch/bulk-delete-users', requireUserManagement(), preventReadOnlyActions, (req, res) =>
        batchController.createBulkDeleteUsersJob(req, res)
    );
    AdminRouter.post('/batch/bulk-delete-artworks', requireContentManagement(), preventReadOnlyActions, (req, res) =>
        batchController.createBulkDeleteArtworksJob(req, res)
    );
    AdminRouter.post('/batch/bulk-delete-exhibitions', requireContentManagement(), preventReadOnlyActions, (req, res) =>
        batchController.createBulkDeleteExhibitionsJob(req, res)
    );
    AdminRouter.post('/batch/bulk-feature-toggle', requireContentManagement(), preventReadOnlyActions, (req, res) =>
        batchController.createBulkFeatureToggleJob(req, res)
    );

    // 배치 작업 API 라우트 (AJAX용)
    AdminRouter.get('/api/batch/:jobId/status', requireContentManagement(), (req, res) =>
        batchController.getBatchJobStatusAPI(req, res)
    );
    AdminRouter.get('/api/batch/stats', requireContentManagement(), (req, res) => batchController.getBatchJobStatsAPI(req, res));


    return AdminRouter;
}
