/**
 * Prometheus 기반 메트릭 수집 시스템
 * Express 애플리케이션의 성능 메트릭, 시스템 리소스, API 응답 시간 등을 수집
 */

import client from 'prom-client';
import pidusage from 'pidusage';
import logger from '../utils/Logger.js';
import Config from '../../config/Config.js';

class MetricsCollector {
    constructor() {
        this.config = Config.getInstance();
        this.environment = this.config.getEnvironment();
        this.isProduction = this.environment === 'production';

        // 기본 메트릭 수집 활성화 (CPU, 메모리 등)
        this.collectDefaultMetrics();

        // 커스텀 메트릭 정의
        this.initializeCustomMetrics();

        // 시스템 메트릭 수집 인터벌 설정
        this.systemMetricsInterval = null;
        this.startSystemMetricsCollection();

        logger.info('🔄 MetricsCollector 초기화 완료', {
            component: 'MetricsCollector',
            environment: this.environment,
            defaultMetricsEnabled: true,
            customMetricsEnabled: true
        });
    }

    /**
     * Prometheus 기본 메트릭 수집 활성화
     */
    collectDefaultMetrics() {
        // Node.js 기본 메트릭 수집 (이벤트 루프 지연, GC 등)
        client.collectDefaultMetrics({
            timeout: 5000,
            gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
            eventLoopMonitoringPrecision: 10,
            prefix: 'skku_gallery_'
        });
    }

    /**
     * 커스텀 메트릭 초기화
     */
    initializeCustomMetrics() {
        // HTTP 요청 수 (카운터)
        this.httpRequestsTotal = new client.Counter({
            name: 'skku_gallery_http_requests_total',
            help: 'Total number of HTTP requests',
            labelNames: ['method', 'route', 'status_code', 'user_role']
        });

        // HTTP 요청 응답 시간 (히스토그램)
        this.httpRequestDuration = new client.Histogram({
            name: 'skku_gallery_http_request_duration_seconds',
            help: 'Duration of HTTP requests in seconds',
            labelNames: ['method', 'route', 'status_code'],
            buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
        });

        // 활성 연결 수 (게이지)
        this.activeConnections = new client.Gauge({
            name: 'skku_gallery_active_connections',
            help: 'Number of active connections'
        });

        // 데이터베이스 쿼리 수행 시간
        this.dbQueryDuration = new client.Histogram({
            name: 'skku_gallery_db_query_duration_seconds',
            help: 'Duration of database queries in seconds',
            labelNames: ['query_type', 'table', 'status'],
            buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2]
        });

        // 에러 발생 수
        this.errorsTotal = new client.Counter({
            name: 'skku_gallery_errors_total',
            help: 'Total number of errors',
            labelNames: ['error_type', 'severity', 'route']
        });

        // 사용자 활동 메트릭
        this.userActions = new client.Counter({
            name: 'skku_gallery_user_actions_total',
            help: 'Total number of user actions',
            labelNames: ['action_type', 'user_role', 'resource']
        });

        // 이미지 업로드 메트릭
        this.imageUploads = new client.Counter({
            name: 'skku_gallery_image_uploads_total',
            help: 'Total number of image uploads',
            labelNames: ['status', 'file_type', 'size_category']
        });

        // 전시회 관련 메트릭
        this.exhibitionMetrics = new client.Gauge({
            name: 'skku_gallery_exhibitions_active',
            help: 'Number of active exhibitions'
        });

        // 시스템 리소스 메트릭
        this.systemCpuUsage = new client.Gauge({
            name: 'skku_gallery_system_cpu_usage_percent',
            help: 'System CPU usage percentage'
        });

        this.systemMemoryUsage = new client.Gauge({
            name: 'skku_gallery_system_memory_usage_bytes',
            help: 'System memory usage in bytes',
            labelNames: ['type'] // 'used', 'free', 'total'
        });

        // Redis 연결 상태
        this.redisConnectionStatus = new client.Gauge({
            name: 'skku_gallery_redis_connection_status',
            help: 'Redis connection status (1 = connected, 0 = disconnected)'
        });

        // 데이터베이스 연결 상태
        this.dbConnectionStatus = new client.Gauge({
            name: 'skku_gallery_db_connection_status',
            help: 'Database connection status (1 = connected, 0 = disconnected)'
        });
    }

    /**
     * HTTP 요청 메트릭 기록
     */
    recordHttpRequest(req, res, responseTime) {
        // route 추출을 더 안전하게 처리
        let routePath = 'unknown';
        try {
            if (req.route && typeof req.route.path === 'string') {
                routePath = req.route.path;
            } else if (typeof req.path === 'string') {
                routePath = req.path;
            } else if (typeof req.originalUrl === 'string') {
                // 쿼리 파라미터 제거
                routePath = req.originalUrl.split('?')[0];
            }
        } catch (error) {
            logger.warn('HTTP 요청에서 route 추출 중 오류 발생', { error: error.message });
        }

        const route = this.sanitizeRoute(routePath);
        const method = req.method || 'unknown';
        const statusCode = (res.statusCode || 500).toString();
        const userRole = req.session?.user?.role || 'anonymous';

        // 요청 카운터 증가
        this.httpRequestsTotal.inc({
            method,
            route,
            status_code: statusCode,
            user_role: userRole
        });

        // 응답 시간 기록
        this.httpRequestDuration.observe(
            { method, route, status_code: statusCode },
            responseTime / 1000 // milliseconds to seconds
        );

        // HTTP 메트릭 기록 로그 제거 (너무 빈번함)
    }

    /**
     * 데이터베이스 쿼리 메트릭 기록
     */
    recordDbQuery(queryType, table, duration, status = 'success') {
        this.dbQueryDuration.observe(
            { query_type: queryType, table, status },
            duration / 1000 // milliseconds to seconds
        );

        // DB 쿼리 메트릭 기록 로그 제거 (너무 빈번함)
    }

    /**
     * 에러 메트릭 기록
     */
    recordError(errorType, severity, route = 'unknown') {
        this.errorsTotal.inc({
            error_type: errorType,
            severity,
            route: this.sanitizeRoute(route)
        });

        logger.debug('📊 에러 메트릭 기록', {
            errorType,
            severity,
            route
        });
    }

    /**
     * 사용자 액션 메트릭 기록
     */
    recordUserAction(actionType, userRole, resource) {
        this.userActions.inc({
            action_type: actionType,
            user_role: userRole || 'anonymous',
            resource
        });

        logger.debug('📊 사용자 액션 메트릭 기록', {
            actionType,
            userRole,
            resource
        });
    }

    /**
     * 이미지 업로드 메트릭 기록
     */
    recordImageUpload(status, fileType, fileSize) {
        const sizeCategory = this.categorizeFileSize(fileSize);

        this.imageUploads.inc({
            status,
            file_type: fileType || 'unknown',
            size_category: sizeCategory
        });

        logger.debug('📊 이미지 업로드 메트릭 기록', {
            status,
            fileType,
            fileSize,
            sizeCategory
        });
    }

    /**
     * 시스템 메트릭 수집 시작
     */
    startSystemMetricsCollection() {
        // 60초마다 시스템 메트릭 수집 (기존 15초에서 60초로 증가)
        this.systemMetricsInterval = setInterval(async () => {
            try {
                await this.collectSystemMetrics();
            } catch (error) {
                logger.error('시스템 메트릭 수집 중 에러 발생', error);
            }
        }, 60000);

        logger.info('🔄 시스템 메트릭 수집 시작 (60초 간격)');
    }

    /**
     * 시스템 메트릭 수집
     */
    async collectSystemMetrics() {
        try {
            // pidusage를 사용하여 현재 프로세스의 CPU/메모리 사용량 수집
            const stats = await pidusage(process.pid);

            // CPU 사용률 기록
            this.systemCpuUsage.set(stats.cpu);

            // 메모리 사용량 기록
            const memoryUsage = process.memoryUsage();
            this.systemMemoryUsage.set({ type: 'rss' }, memoryUsage.rss);
            this.systemMemoryUsage.set({ type: 'heap_used' }, memoryUsage.heapUsed);
            this.systemMemoryUsage.set({ type: 'heap_total' }, memoryUsage.heapTotal);
            this.systemMemoryUsage.set({ type: 'external' }, memoryUsage.external);

            // 시스템 메트릭 수집 로그를 debug에서 제거 (너무 빈번함)
        } catch (error) {
            logger.error('시스템 메트릭 수집 실패', error);
        }
    }

    /**
     * 연결 상태 메트릭 업데이트
     */
    updateConnectionStatus(service, isConnected) {
        const status = isConnected ? 1 : 0;

        switch (service) {
        case 'redis':
            this.redisConnectionStatus.set(status);
            break;
        case 'database':
            this.dbConnectionStatus.set(status);
            break;
        }

        // 연결 상태 메트릭 업데이트 로그 제거 (너무 빈번함)
    }

    /**
     * 전시회 수 업데이트
     */
    updateActiveExhibitions(count) {
        this.exhibitionMetrics.set(count);

        // 활성 전시회 메트릭 업데이트 로그 제거 (너무 빈번함)
    }

    /**
     * 라우트 경로 정규화 (개인정보 제거)
     */
    sanitizeRoute(route) {
        // route가 문자열이 아닌 경우 안전하게 처리
        if (!route || typeof route !== 'string') {
            return 'unknown';
        }

        try {
            // ID 파라미터를 일반화
            return route
                .replace(/\/\d+/g, '/:id')
                .replace(/\/[a-fA-F0-9]{24}/g, '/:id') // MongoDB ObjectId
                .replace(/\/[a-fA-F0-9-]{36}/g, '/:uuid') // UUID
                .toLowerCase();
        } catch (error) {
            logger.warn('라우트 정규화 중 오류 발생', { route, error: error.message });
            return 'unknown';
        }
    }

    /**
     * 파일 크기 카테고리 분류
     */
    categorizeFileSize(sizeInBytes) {
        if (sizeInBytes < 1024 * 1024) return 'small'; // < 1MB
        if (sizeInBytes < 5 * 1024 * 1024) return 'medium'; // < 5MB
        if (sizeInBytes < 10 * 1024 * 1024) return 'large'; // < 10MB
        return 'xlarge'; // >= 10MB
    }

    /**
     * 모든 메트릭 가져오기 (Prometheus 포맷)
     */
    async getMetrics() {
        try {
            return await client.register.metrics();
        } catch (error) {
            logger.error('메트릭 수집 중 에러 발생', error);
            throw error;
        }
    }

    /**
     * 특정 메트릭의 현재 값 가져오기
     */
    async getMetricValue(metricName) {
        try {
            const metrics = await client.register.getSingleMetric(metricName);
            return metrics ? await metrics.get() : null;
        } catch (error) {
            logger.error(`메트릭 ${metricName} 조회 중 에러 발생`, error);
            return null;
        }
    }

    /**
     * 메트릭 리셋
     */
    resetMetrics() {
        client.register.resetMetrics();
        logger.info('🔄 모든 메트릭이 리셋되었습니다');
    }

    /**
     * 메트릭 수집 중지
     */
    stop() {
        if (this.systemMetricsInterval) {
            clearInterval(this.systemMetricsInterval);
            this.systemMetricsInterval = null;
        }

        client.register.clear();
        logger.info('🛑 MetricsCollector 중지됨');
    }

    /**
     * 메트릭 요약 정보 가져오기
     */
    async getMetricsSummary() {
        try {
            const httpRequestsTotal = await this.getMetricValue('skku_gallery_http_requests_total');
            const errorsTotal = await this.getMetricValue('skku_gallery_errors_total');
            const activeConnections = await this.getMetricValue('skku_gallery_active_connections');

            return {
                httpRequestsTotal: httpRequestsTotal?.values?.length || 0,
                errorsTotal: errorsTotal?.values?.length || 0,
                activeConnections: activeConnections?.values?.[0]?.value || 0,
                uptime: process.uptime(),
                memoryUsage: process.memoryUsage(),
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            logger.error('메트릭 요약 생성 중 에러 발생', error);
            return null;
        }
    }
}

// 싱글톤 인스턴스 생성
let metricsCollectorInstance = null;

export const getMetricsCollector = () => {
    if (!metricsCollectorInstance) {
        metricsCollectorInstance = new MetricsCollector();
    }
    return metricsCollectorInstance;
};

export { MetricsCollector };
export default getMetricsCollector;
