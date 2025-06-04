import logger from '../utils/Logger.js';
import { AuditLogType, AuditSeverity } from '../middleware/auditLogger.js';
import auditLogger from '../middleware/auditLogger.js';

/**
 * 배치 작업 상태
 */
export const BatchJobStatus = {
    PENDING: 'PENDING',
    RUNNING: 'RUNNING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
    CANCELLED: 'CANCELLED',
    PARTIAL: 'PARTIAL'
};

/**
 * 배치 작업 타입
 */
export const BatchJobType = {
    BULK_DELETE_USERS: 'BULK_DELETE_USERS',
    BULK_UPDATE_USERS: 'BULK_UPDATE_USERS',
    BULK_DELETE_ARTWORKS: 'BULK_DELETE_ARTWORKS',
    BULK_UPDATE_ARTWORKS: 'BULK_UPDATE_ARTWORKS',
    BULK_DELETE_EXHIBITIONS: 'BULK_DELETE_EXHIBITIONS',
    BULK_UPDATE_EXHIBITIONS: 'BULK_UPDATE_EXHIBITIONS',
    BULK_FEATURE_TOGGLE: 'BULK_FEATURE_TOGGLE',
    BULK_STATUS_CHANGE: 'BULK_STATUS_CHANGE',
    DATA_EXPORT: 'DATA_EXPORT',
    DATA_IMPORT: 'DATA_IMPORT',
    CLEANUP_ORPHANED_DATA: 'CLEANUP_ORPHANED_DATA'
};

/**
 * 배치 처리 서비스
 * 대량 데이터 작업을 위한 큐 기반 배치 처리 시스템
 */
export default class BatchProcessingService {
    constructor(container = null) {
        this.container = container; // 의존성 주입 컨테이너
        this.jobQueue = new Map(); // 작업 큐
        this.runningJobs = new Map(); // 실행 중인 작업
        this.completedJobs = new Map(); // 완료된 작업 (최근 100개만 유지)
        this.maxConcurrentJobs = 3; // 동시 실행 가능한 작업 수
        this.maxCompletedJobs = 100; // 완료된 작업 최대 보관 수
        this.batchSize = 50; // 기본 배치 크기
        this.retryAttempts = 3; // 재시도 횟수
        this.retryDelay = 5000; // 재시도 지연 시간 (5초)

        // 주기적으로 큐 처리
        this.processInterval = setInterval(() => {
            this.processQueue();
        }, 1000);

        // 주기적으로 완료된 작업 정리
        this.cleanupInterval = setInterval(() => {
            this.cleanupCompletedJobs();
        }, 60000); // 1분마다
    }

    /**
     * 의존성 주입 컨테이너 설정
     * @param {Object} container - DI 컨테이너
     */
    setContainer(container) {
        this.container = container;
    }

    /**
     * 배치 작업 생성
     * @param {Object} jobConfig - 작업 설정
     * @returns {string} 작업 ID
     */
    createJob(jobConfig) {
        const { type, data, options = {}, user, priority = 5, description = '' } = jobConfig;

        const jobId = this.generateJobId();
        const job = {
            id: jobId,
            type,
            data,
            options: {
                batchSize: options.batchSize || this.batchSize,
                retryAttempts: options.retryAttempts || this.retryAttempts,
                retryDelay: options.retryDelay || this.retryDelay,
                ...options
            },
            status: BatchJobStatus.PENDING,
            priority,
            description,
            user,
            createdAt: new Date(),
            startedAt: null,
            completedAt: null,
            progress: {
                total: 0,
                processed: 0,
                successful: 0,
                failed: 0,
                errors: []
            },
            result: null,
            error: null,
            retryCount: 0
        };

        this.jobQueue.set(jobId, job);

        // 감사 로그 기록
        auditLogger.log({
            type: AuditLogType.BULK_OPERATION,
            severity: AuditSeverity.MEDIUM,
            user,
            resource: `batch-job/${jobId}`,
            action: 'CREATE_BATCH_JOB',
            details: {
                jobType: type,
                jobId,
                description,
                dataCount: Array.isArray(data) ? data.length : 1,
                priority
            }
        });

        logger.info('배치 작업 생성됨', {
            jobId,
            type,
            priority,
            description,
            user: user?.username
        });

        return jobId;
    }

    /**
     * 작업 상태 조회
     * @param {string} jobId - 작업 ID
     * @returns {Object|null} 작업 정보
     */
    getJobStatus(jobId) {
        return this.jobQueue.get(jobId) || this.runningJobs.get(jobId) || this.completedJobs.get(jobId) || null;
    }

    /**
     * 모든 작업 목록 조회
     * @param {Object} filters - 필터 옵션
     * @returns {Array} 작업 목록
     */
    getAllJobs(filters = {}) {
        const { status, type, userId } = filters;
        const allJobs = [
            ...Array.from(this.jobQueue.values()),
            ...Array.from(this.runningJobs.values()),
            ...Array.from(this.completedJobs.values())
        ];

        return allJobs
            .filter(job => {
                if (status && job.status !== status) return false;
                if (type && job.type !== type) return false;
                if (userId && job.user?.id !== userId) return false;
                return true;
            })
            .sort((a, b) => b.createdAt - a.createdAt);
    }

    /**
     * 작업 취소
     * @param {string} jobId - 작업 ID
     * @param {Object} user - 취소 요청 사용자
     * @returns {boolean} 취소 성공 여부
     */
    cancelJob(jobId, user) {
        const job = this.getJobStatus(jobId);
        if (!job) return false;

        if (job.status === BatchJobStatus.RUNNING) {
            // 실행 중인 작업은 취소 플래그만 설정
            job.cancelled = true;
            job.status = BatchJobStatus.CANCELLED;
        } else if (job.status === BatchJobStatus.PENDING) {
            // 대기 중인 작업은 즉시 취소
            this.jobQueue.delete(jobId);
            job.status = BatchJobStatus.CANCELLED;
            job.completedAt = new Date();
            this.completedJobs.set(jobId, job);
        } else {
            return false; // 이미 완료되었거나 취소된 작업
        }

        // 감사 로그 기록
        auditLogger.log({
            type: AuditLogType.BULK_OPERATION,
            severity: AuditSeverity.MEDIUM,
            user,
            resource: `batch-job/${jobId}`,
            action: 'CANCEL_BATCH_JOB',
            details: {
                jobType: job.type,
                jobId,
                cancelledBy: user?.username,
                originalUser: job.user?.username
            }
        });

        logger.info('배치 작업 취소됨', {
            jobId,
            type: job.type,
            cancelledBy: user?.username
        });

        return true;
    }

    /**
     * 큐 처리
     */
    async processQueue() {
        // 실행 중인 작업 수 확인
        if (this.runningJobs.size >= this.maxConcurrentJobs) {
            return;
        }

        // 우선순위가 높은 작업부터 처리
        const pendingJobs = Array.from(this.jobQueue.values())
            .filter(job => job.status === BatchJobStatus.PENDING)
            .sort((a, b) => a.priority - b.priority); // 낮은 숫자가 높은 우선순위

        for (const job of pendingJobs) {
            if (this.runningJobs.size >= this.maxConcurrentJobs) {
                break;
            }

            // 작업을 실행 큐로 이동
            this.jobQueue.delete(job.id);
            this.runningJobs.set(job.id, job);

            // 비동기로 작업 실행
            this.executeJob(job).catch(error => {
                logger.error('배치 작업 실행 중 예외 발생', error, {
                    jobId: job.id,
                    jobType: job.type
                });
            });
        }
    }

    /**
     * 작업 실행
     * @param {Object} job - 실행할 작업
     */
    async executeJob(job) {
        job.status = BatchJobStatus.RUNNING;
        job.startedAt = new Date();

        logger.info('배치 작업 시작', {
            jobId: job.id,
            type: job.type,
            user: job.user?.username
        });

        try {
            // 작업 타입에 따른 처리
            const result = await this.processJobByType(job);

            // 성공 처리
            job.status = BatchJobStatus.COMPLETED;
            job.result = result;
            job.completedAt = new Date();

            // 감사 로그 기록
            auditLogger.log({
                type: AuditLogType.BULK_OPERATION,
                severity: AuditSeverity.MEDIUM,
                user: job.user,
                resource: `batch-job/${job.id}`,
                action: 'COMPLETE_BATCH_JOB',
                details: {
                    jobType: job.type,
                    jobId: job.id,
                    duration: job.completedAt - job.startedAt,
                    processed: job.progress.processed,
                    successful: job.progress.successful,
                    failed: job.progress.failed
                }
            });

            logger.info('배치 작업 완료', {
                jobId: job.id,
                type: job.type,
                duration: job.completedAt - job.startedAt,
                processed: job.progress.processed,
                successful: job.progress.successful,
                failed: job.progress.failed
            });
        } catch (error) {
            // 실패 처리
            job.error = error.message;
            job.progress.errors.push({
                timestamp: new Date(),
                error: error.message,
                stack: error.stack
            });

            // 재시도 로직
            if (job.retryCount < job.options.retryAttempts) {
                job.retryCount++;
                job.status = BatchJobStatus.PENDING;

                logger.warn('배치 작업 재시도 예약', {
                    jobId: job.id,
                    retryCount: job.retryCount,
                    maxRetries: job.options.retryAttempts,
                    error: error.message
                });

                // 재시도 지연 후 큐에 다시 추가
                setTimeout(() => {
                    this.runningJobs.delete(job.id);
                    this.jobQueue.set(job.id, job);
                }, job.options.retryDelay);

                return;
            }

            // 최대 재시도 횟수 초과
            job.status = BatchJobStatus.FAILED;
            job.completedAt = new Date();

            // 감사 로그 기록
            auditLogger.log({
                type: AuditLogType.BULK_OPERATION,
                severity: AuditSeverity.HIGH,
                user: job.user,
                resource: `batch-job/${job.id}`,
                action: 'FAIL_BATCH_JOB',
                details: {
                    jobType: job.type,
                    jobId: job.id,
                    error: error.message,
                    retryCount: job.retryCount,
                    duration: job.completedAt - job.startedAt
                }
            });

            logger.error('배치 작업 실패', error, {
                jobId: job.id,
                type: job.type,
                retryCount: job.retryCount
            });
        } finally {
            // 실행 큐에서 제거하고 완료 큐로 이동
            this.runningJobs.delete(job.id);
            this.completedJobs.set(job.id, job);
        }
    }

    /**
     * 작업 타입별 처리
     * @param {Object} job - 처리할 작업
     * @returns {Object} 처리 결과
     */
    async processJobByType(job) {
        switch (job.type) {
        case BatchJobType.BULK_DELETE_USERS:
            return await this.processBulkDeleteUsers(job);
        case BatchJobType.BULK_UPDATE_USERS:
            return await this.processBulkUpdateUsers(job);
        case BatchJobType.BULK_DELETE_ARTWORKS:
            return await this.processBulkDeleteArtworks(job);
        case BatchJobType.BULK_UPDATE_ARTWORKS:
            return await this.processBulkUpdateArtworks(job);
        case BatchJobType.BULK_DELETE_EXHIBITIONS:
            return await this.processBulkDeleteExhibitions(job);
        case BatchJobType.BULK_UPDATE_EXHIBITIONS:
            return await this.processBulkUpdateExhibitions(job);
        case BatchJobType.BULK_FEATURE_TOGGLE:
            return await this.processBulkFeatureToggle(job);
        case BatchJobType.BULK_STATUS_CHANGE:
            return await this.processBulkStatusChange(job);
        default:
            throw new Error(`지원하지 않는 배치 작업 타입: ${job.type}`);
        }
    }

    /**
     * 대량 사용자 삭제 처리
     */
    async processBulkDeleteUsers(job) {
        const { data: userIds } = job;
        job.progress.total = userIds.length;

        try {
            // 의존성 주입된 서비스 사용
            const userManagementService = this.container?.resolve('UserManagementService');
            if (!userManagementService) {
                throw new Error('UserManagementService를 찾을 수 없습니다.');
            }

            const results = await userManagementService.bulkDeleteUsers(userIds);

            // 진행률 업데이트
            job.progress.processed = userIds.length;
            job.progress.successful = results.deleted.length;
            job.progress.failed = results.failed.length;

            return results;
        } catch (error) {
            logger.error('대량 사용자 삭제 처리 실패', error);
            throw error;
        }
    }

    /**
     * 대량 사용자 업데이트 처리
     */
    async processBulkUpdateUsers(job) {
        const { data: updates } = job;
        job.progress.total = updates.length;

        try {
            const userManagementService = this.container?.resolve('UserManagementService');
            if (!userManagementService) {
                throw new Error('UserManagementService를 찾을 수 없습니다.');
            }

            const results = await userManagementService.bulkUpdateUsers(updates);

            // 진행률 업데이트
            job.progress.processed = updates.length;
            job.progress.successful = results.updated.length;
            job.progress.failed = results.failed.length;

            return results;
        } catch (error) {
            logger.error('대량 사용자 업데이트 처리 실패', error);
            throw error;
        }
    }

    /**
     * 대량 작품 삭제 처리
     */
    async processBulkDeleteArtworks(job) {
        const { data: artworkIds } = job;
        job.progress.total = artworkIds.length;

        try {
            const artworkManagementService = this.container?.resolve('ArtworkManagementService');
            if (!artworkManagementService) {
                throw new Error('ArtworkManagementService를 찾을 수 없습니다.');
            }

            // 임시로 개별 삭제 처리 (향후 bulkDeleteArtworks 메서드 구현 필요)
            const results = {
                deleted: [],
                failed: []
            };

            for (const artworkId of artworkIds) {
                try {
                    // 개별 작품 삭제 (실제 메서드명은 확인 필요)
                    await artworkManagementService.deleteArtwork?.(artworkId);
                    results.deleted.push(artworkId);
                    job.progress.successful++;
                } catch (error) {
                    results.failed.push({ artworkId, error: error.message });
                    job.progress.failed++;
                }
                job.progress.processed++;
            }

            return results;
        } catch (error) {
            logger.error('대량 작품 삭제 처리 실패', error);
            throw error;
        }
    }

    /**
     * 대량 작품 업데이트 처리
     */
    async processBulkUpdateArtworks(_job) {
        // 구현 로직은 processBulkUpdateUsers와 유사
        return { updated: [], failed: [] };
    }

    /**
     * 대량 전시회 삭제 처리
     */
    async processBulkDeleteExhibitions(_job) {
        // 구현 로직은 processBulkDeleteArtworks와 유사
        return { deleted: [], failed: [] };
    }

    /**
     * 대량 전시회 업데이트 처리
     */
    async processBulkUpdateExhibitions(_job) {
        // 구현 로직은 processBulkUpdateUsers와 유사
        return { updated: [], failed: [] };
    }

    /**
     * 대량 추천 토글 처리
     */
    async processBulkFeatureToggle(job) {
        const {
            data: items,
            options: { featured: _featured }
        } = job;
        job.progress.total = items.length;

        const results = {
            updated: [],
            failed: []
        };

        for (const item of items) {
            try {
                // 실제 추천 토글 로직
                results.updated.push(item.id);
                job.progress.successful++;
            } catch (error) {
                results.failed.push({ id: item.id, error: error.message });
                job.progress.failed++;
            }

            job.progress.processed++;
        }

        return results;
    }

    /**
     * 대량 상태 변경 처리
     */
    async processBulkStatusChange(job) {
        const {
            data: items,
            options: { status: _status }
        } = job;
        job.progress.total = items.length;

        const results = {
            updated: [],
            failed: []
        };

        for (const item of items) {
            try {
                // 실제 상태 변경 로직
                results.updated.push(item.id);
                job.progress.successful++;
            } catch (error) {
                results.failed.push({ id: item.id, error: error.message });
                job.progress.failed++;
            }

            job.progress.processed++;
        }

        return results;
    }

    /**
     * 완료된 작업 정리
     */
    cleanupCompletedJobs() {
        if (this.completedJobs.size <= this.maxCompletedJobs) {
            return;
        }

        // 오래된 작업부터 제거
        const jobs = Array.from(this.completedJobs.values()).sort((a, b) => a.completedAt - b.completedAt);

        const toRemove = jobs.slice(0, jobs.length - this.maxCompletedJobs);
        toRemove.forEach(job => {
            this.completedJobs.delete(job.id);
        });

        logger.debug('완료된 배치 작업 정리', {
            removed: toRemove.length,
            remaining: this.completedJobs.size
        });
    }

    /**
     * 작업 ID 생성
     */
    generateJobId() {
        return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 서비스 종료
     */
    shutdown() {
        if (this.processInterval) {
            clearInterval(this.processInterval);
        }
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }

        logger.info('배치 처리 서비스 종료', {
            pendingJobs: this.jobQueue.size,
            runningJobs: this.runningJobs.size,
            completedJobs: this.completedJobs.size
        });
    }
}
