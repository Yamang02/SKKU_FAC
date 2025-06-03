import { BatchJobType, BatchJobStatus } from '../../../common/service/BatchProcessingService.js';
import ViewResolver from '../../../common/utils/ViewResolver.js';
import { ViewPath } from '../../../common/constants/ViewPath.js';
import BaseAdminController from './BaseAdminController.js';

/**
 * 배치 처리 컨트롤러
 * 관리자용 배치 작업 관리 기능을 제공합니다.
 */
export default class BatchController extends BaseAdminController {
    static dependencies = ['BatchProcessingService'];

    constructor(batchProcessingService) {
        super('BatchController');
        this.batchProcessingService = batchProcessingService;
    }

    /**
     * 배치 작업 목록 페이지
     */
    async getBatchJobListPage(req, res) {
        return this.safeExecuteSSR(async () => {
            const { status, type, page = 1, limit = 20 } = req.query;

            // 필터 적용
            const filters = {};
            if (status) filters.status = status;
            if (type) filters.type = type;

            // 모든 작업 조회
            const allJobs = this.batchProcessingService.getAllJobs(filters);

            // 페이지네이션
            const offset = (page - 1) * limit;
            const jobs = allJobs.slice(offset, offset + parseInt(limit));
            const totalJobs = allJobs.length;

            // 통계 정보
            const stats = this.calculateJobStats(allJobs);
            const pagination = this.createPaginationInfo(page, limit, totalJobs);

            return ViewResolver.render(res, ViewPath.ADMIN_BATCH_LIST, {
                title: '배치 작업 관리',
                jobs,
                stats,
                pagination,
                filters: { status, type },
                jobTypes: Object.values(BatchJobType),
                jobStatuses: Object.values(BatchJobStatus)
            });
        }, req, res, {
            operationName: '배치 작업 목록 조회',
            errorRedirectPath: '/admin',
            errorMessage: '배치 작업 목록을 불러오는 중 오류가 발생했습니다.'
        });
    }

    /**
     * 배치 작업 상세 페이지
     */
    async getBatchJobDetailPage(req, res) {
        return this.safeExecuteSSR(async () => {
            const { jobId } = req.params;
            const job = this.batchProcessingService.getJobStatus(jobId);

            if (!job) {
                throw new Error('요청한 배치 작업을 찾을 수 없습니다.');
            }

            return ViewResolver.render(res, ViewPath.ADMIN_BATCH_DETAIL, {
                title: `배치 작업 상세 - ${job.id}`,
                job,
                canCancel: job.status === BatchJobStatus.PENDING || job.status === BatchJobStatus.RUNNING
            });
        }, req, res, {
            operationName: '배치 작업 상세 조회',
            errorRedirectPath: '/admin/batch',
            errorMessage: '배치 작업 상세 정보를 불러오는 중 오류가 발생했습니다.'
        });
    }

    /**
     * 대량 사용자 삭제 작업 생성
     */
    async createBulkDeleteUsersJob(req, res) {
        return this.safeExecuteSSR(async () => {
            const { userIds, description = '대량 사용자 삭제' } = req.body;

            if (!Array.isArray(userIds) || userIds.length === 0) {
                throw new Error('삭제할 사용자 ID 목록이 필요합니다.');
            }

            const jobId = this.batchProcessingService.createJob({
                type: BatchJobType.BULK_DELETE_USERS,
                data: userIds,
                user: req.user,
                description,
                priority: 3 // 높은 우선순위
            });

            req.flash('success', `대량 사용자 삭제 작업이 생성되었습니다. (작업 ID: ${jobId})`);
            return res.redirect('/admin/batch');
        }, req, res, {
            operationName: '대량 사용자 삭제 작업 생성',
            errorRedirectPath: '/admin/batch',
            errorMessage: '대량 사용자 삭제 작업 생성에 실패했습니다.'
        });
    }

    /**
     * 대량 작품 삭제 작업 생성
     */
    async createBulkDeleteArtworksJob(req, res) {
        return this.safeExecuteSSR(async () => {
            const { artworkIds, description = '대량 작품 삭제' } = req.body;

            if (!Array.isArray(artworkIds) || artworkIds.length === 0) {
                throw new Error('삭제할 작품 ID 목록이 필요합니다.');
            }

            const jobId = this.batchProcessingService.createJob({
                type: BatchJobType.BULK_DELETE_ARTWORKS,
                data: artworkIds,
                user: req.user,
                description,
                priority: 4
            });

            req.flash('success', `대량 작품 삭제 작업이 생성되었습니다. (작업 ID: ${jobId})`);
            return res.redirect('/admin/batch');
        }, req, res, {
            operationName: '대량 작품 삭제 작업 생성',
            errorRedirectPath: '/admin/batch',
            errorMessage: '대량 작품 삭제 작업 생성에 실패했습니다.'
        });
    }

    /**
     * 대량 전시회 삭제 작업 생성
     */
    async createBulkDeleteExhibitionsJob(req, res) {
        return this.safeExecuteSSR(async () => {
            const { exhibitionIds, description = '대량 전시회 삭제' } = req.body;

            if (!Array.isArray(exhibitionIds) || exhibitionIds.length === 0) {
                throw new Error('삭제할 전시회 ID 목록이 필요합니다.');
            }

            const jobId = this.batchProcessingService.createJob({
                type: BatchJobType.BULK_DELETE_EXHIBITIONS,
                data: exhibitionIds,
                user: req.user,
                description,
                priority: 4
            });

            req.flash('success', `대량 전시회 삭제 작업이 생성되었습니다. (작업 ID: ${jobId})`);
            return res.redirect('/admin/batch');
        }, req, res, {
            operationName: '대량 전시회 삭제 작업 생성',
            errorRedirectPath: '/admin/batch',
            errorMessage: '대량 전시회 삭제 작업 생성에 실패했습니다.'
        });
    }

    /**
     * 대량 추천 토글 작업 생성
     */
    async createBulkFeatureToggleJob(req, res) {
        return this.safeExecuteSSR(async () => {
            const { items, featured, resourceType, description } = req.body;

            if (!Array.isArray(items) || items.length === 0) {
                throw new Error('처리할 항목 목록이 필요합니다.');
            }

            const jobId = this.batchProcessingService.createJob({
                type: BatchJobType.BULK_FEATURE_TOGGLE,
                data: items,
                options: { featured, resourceType },
                user: req.user,
                description: description || `대량 추천 ${featured ? '설정' : '해제'} (${resourceType})`,
                priority: 5
            });

            req.flash('success', `대량 추천 토글 작업이 생성되었습니다. (작업 ID: ${jobId})`);
            return res.redirect('/admin/batch');
        }, req, res, {
            operationName: '대량 추천 토글 작업 생성',
            errorRedirectPath: '/admin/batch',
            errorMessage: '대량 추천 토글 작업 생성에 실패했습니다.'
        });
    }

    /**
     * 배치 작업 취소
     */
    async cancelBatchJob(req, res) {
        return this.safeExecuteSSR(async () => {
            const { jobId } = req.params;
            const success = this.batchProcessingService.cancelJob(jobId, req.user);

            if (!success) {
                throw new Error('배치 작업 취소에 실패했습니다. 작업이 존재하지 않거나 이미 완료되었을 수 있습니다.');
            }

            req.flash('success', '배치 작업이 취소되었습니다.');
            return res.redirect(`/admin/batch/${jobId}`);
        }, req, res, {
            operationName: '배치 작업 취소',
            errorRedirectPath: '/admin/batch',
            errorMessage: '배치 작업 취소 중 오류가 발생했습니다.'
        });
    }

    /**
     * 배치 작업 상태 API (AJAX용)
     */
    async getBatchJobStatusAPI(req, res) {
        return this.safeExecuteAPI(async () => {
            const { jobId } = req.params;
            const job = this.batchProcessingService.getJobStatus(jobId);

            if (!job) {
                throw new Error('작업을 찾을 수 없습니다.');
            }

            return {
                id: job.id,
                status: job.status,
                progress: job.progress,
                startedAt: job.startedAt,
                completedAt: job.completedAt,
                error: job.error
            };
        }, req, res, {
            operationName: '배치 작업 상태 API 조회',
            errorStatus: 404
        });
    }

    /**
     * 배치 작업 통계 API
     */
    async getBatchJobStatsAPI(req, res) {
        return this.safeExecuteAPI(async () => {
            const allJobs = this.batchProcessingService.getAllJobs();
            const stats = this.calculateJobStats(allJobs);

            return stats;
        }, req, res, {
            operationName: '배치 작업 통계 API 조회'
        });
    }

    /**
     * 작업 통계 계산
     */
    calculateJobStats(jobs) {
        const stats = {
            total: jobs.length,
            pending: 0,
            running: 0,
            completed: 0,
            failed: 0,
            cancelled: 0,
            byType: {}
        };

        jobs.forEach(job => {
            // 상태별 통계
            switch (job.status) {
                case BatchJobStatus.PENDING:
                    stats.pending++;
                    break;
                case BatchJobStatus.RUNNING:
                    stats.running++;
                    break;
                case BatchJobStatus.COMPLETED:
                    stats.completed++;
                    break;
                case BatchJobStatus.FAILED:
                    stats.failed++;
                    break;
                case BatchJobStatus.CANCELLED:
                    stats.cancelled++;
                    break;
            }

            // 타입별 통계
            if (!stats.byType[job.type]) {
                stats.byType[job.type] = 0;
            }
            stats.byType[job.type]++;
        });

        return stats;
    }
}
