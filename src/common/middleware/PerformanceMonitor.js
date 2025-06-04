import logger from '../utils/Logger.js';
import { getConnectionPoolStats } from '../../infrastructure/db/adapter/MySQLDatabase.js';

/**
 * 성능 모니터링 미들웨어
 * API 응답 시간, 메모리 사용량, 데이터베이스 성능을 모니터링합니다.
 */
export default class PerformanceMonitor {
    constructor() {
        this.metrics = {
            requests: new Map(), // 요청별 메트릭
            aggregated: {
                totalRequests: 0,
                averageResponseTime: 0,
                slowQueries: [],
                errorCount: 0
            }
        };

        // 주기적으로 메트릭 정리 (메모리 누수 방지)
        setInterval(() => {
            this.cleanupMetrics();
        }, 5 * 60 * 1000); // 5분마다
    }

    /**
     * 성능 모니터링 미들웨어 생성
     * @param {Object} options - 모니터링 옵션
     * @returns {Function} Express 미들웨어
     */
    create(options = {}) {
        const {
            slowQueryThreshold = 1000, // 1초 이상이면 느린 쿼리로 간주
            logSlowQueries = true,
            trackMemory = true,
            trackDbPool = true
        } = options;

        return (req, res, next) => {
            const startTime = Date.now();
            const startMemory = trackMemory ? process.memoryUsage() : null;
            const requestId = this.generateRequestId();

            // 요청 정보 저장
            req.performanceMetrics = {
                requestId,
                startTime,
                startMemory,
                path: req.path,
                method: req.method,
                userAgent: req.get('User-Agent'),
                ip: req.ip
            };

            // 응답 완료 시 메트릭 수집
            res.on('finish', () => {
                const endTime = Date.now();
                const responseTime = endTime - startTime;
                const endMemory = trackMemory ? process.memoryUsage() : null;

                const metrics = {
                    ...req.performanceMetrics,
                    endTime,
                    responseTime,
                    statusCode: res.statusCode,
                    contentLength: res.get('Content-Length') || 0,
                    memoryUsage: this.calculateMemoryDelta(startMemory, endMemory)
                };

                // 메트릭 저장 및 분석
                this.recordMetrics(metrics);

                // 느린 쿼리 로깅
                if (logSlowQueries && responseTime > slowQueryThreshold) {
                    this.logSlowQuery(metrics);
                }

                // 데이터베이스 풀 상태 확인 (선택적)
                if (trackDbPool && responseTime > slowQueryThreshold) {
                    this.logDatabasePoolStatus();
                }
            });

            next();
        };
    }

    /**
     * 요청 ID 생성
     * @returns {string} 고유한 요청 ID
     */
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 메모리 사용량 변화 계산
     * @param {Object} startMemory - 시작 시 메모리 사용량
     * @param {Object} endMemory - 종료 시 메모리 사용량
     * @returns {Object} 메모리 변화량
     */
    calculateMemoryDelta(startMemory, endMemory) {
        if (!startMemory || !endMemory) return null;

        return {
            heapUsedDelta: endMemory.heapUsed - startMemory.heapUsed,
            heapTotalDelta: endMemory.heapTotal - startMemory.heapTotal,
            externalDelta: endMemory.external - startMemory.external,
            rss: endMemory.rss
        };
    }

    /**
     * 메트릭 기록
     * @param {Object} metrics - 수집된 메트릭
     */
    recordMetrics(metrics) {
        // 개별 요청 메트릭 저장 (최근 1000개만 유지)
        this.metrics.requests.set(metrics.requestId, metrics);

        // 집계 메트릭 업데이트
        this.updateAggregatedMetrics(metrics);

        // 개발 환경에서는 상세 로깅
        if (process.env.NODE_ENV === 'development') {
            this.logDetailedMetrics(metrics);
        }
    }

    /**
     * 집계 메트릭 업데이트
     * @param {Object} metrics - 새로운 메트릭
     */
    updateAggregatedMetrics(metrics) {
        const agg = this.metrics.aggregated;

        agg.totalRequests++;

        // 평균 응답 시간 계산 (이동 평균)
        agg.averageResponseTime = (
            (agg.averageResponseTime * (agg.totalRequests - 1) + metrics.responseTime) /
            agg.totalRequests
        );

        // 에러 카운트
        if (metrics.statusCode >= 400) {
            agg.errorCount++;
        }

        // 느린 쿼리 기록 (최근 50개만 유지)
        if (metrics.responseTime > 1000) {
            agg.slowQueries.push({
                path: metrics.path,
                method: metrics.method,
                responseTime: metrics.responseTime,
                timestamp: metrics.endTime
            });

            if (agg.slowQueries.length > 50) {
                agg.slowQueries.shift();
            }
        }
    }

    /**
     * 느린 쿼리 로깅
     * @param {Object} metrics - 메트릭 정보
     */
    logSlowQuery(metrics) {
        logger.warn('느린 API 응답 감지', {
            path: metrics.path,
            method: metrics.method,
            responseTime: `${metrics.responseTime}ms`,
            statusCode: metrics.statusCode,
            userAgent: metrics.userAgent,
            ip: metrics.ip,
            memoryDelta: metrics.memoryUsage?.heapUsedDelta
        });
    }

    /**
     * 데이터베이스 풀 상태 로깅
     */
    logDatabasePoolStatus() {
        const poolStats = getConnectionPoolStats();

        if (poolStats.available) {
            const utilizationRate = (poolStats.using / poolStats.max) * 100;

            logger.info('데이터베이스 풀 상태', {
                utilizationRate: `${utilizationRate.toFixed(1)}%`,
                activeConnections: poolStats.using,
                availableConnections: poolStats.availableConnections,
                waitingRequests: poolStats.waiting,
                maxConnections: poolStats.max
            });
        }
    }

    /**
     * 상세 메트릭 로깅 (개발 환경)
     * @param {Object} metrics - 메트릭 정보
     */
    logDetailedMetrics(metrics) {
        if (metrics.responseTime > 500) { // 500ms 이상만 로깅
            logger.debug('API 성능 메트릭', {
                path: metrics.path,
                method: metrics.method,
                responseTime: `${metrics.responseTime}ms`,
                statusCode: metrics.statusCode,
                contentLength: metrics.contentLength,
                memoryUsage: metrics.memoryUsage
            });
        }
    }

    /**
     * 메트릭 정리 (메모리 관리)
     */
    cleanupMetrics() {
        const requests = this.metrics.requests;
        const cutoffTime = Date.now() - (10 * 60 * 1000); // 10분 전

        // 오래된 요청 메트릭 제거
        for (const [requestId, metrics] of requests.entries()) {
            if (metrics.endTime < cutoffTime) {
                requests.delete(requestId);
            }
        }

        logger.debug(`메트릭 정리 완료: ${requests.size}개 요청 메트릭 유지`);
    }

    /**
     * 성능 통계 조회
     * @returns {Object} 성능 통계
     */
    getPerformanceStats() {
        const recentRequests = Array.from(this.metrics.requests.values())
            .filter(m => m.endTime > Date.now() - (5 * 60 * 1000)) // 최근 5분
            .sort((a, b) => b.endTime - a.endTime);

        const slowestRequests = recentRequests
            .filter(m => m.responseTime > 1000)
            .slice(0, 10);

        const errorRequests = recentRequests
            .filter(m => m.statusCode >= 400)
            .slice(0, 10);

        return {
            summary: {
                totalRequests: this.metrics.aggregated.totalRequests,
                averageResponseTime: Math.round(this.metrics.aggregated.averageResponseTime),
                errorRate: (this.metrics.aggregated.errorCount / this.metrics.aggregated.totalRequests * 100).toFixed(2),
                recentRequestCount: recentRequests.length
            },
            recentSlowestRequests: slowestRequests.map(m => ({
                path: m.path,
                method: m.method,
                responseTime: m.responseTime,
                statusCode: m.statusCode,
                timestamp: new Date(m.endTime).toISOString()
            })),
            recentErrors: errorRequests.map(m => ({
                path: m.path,
                method: m.method,
                responseTime: m.responseTime,
                statusCode: m.statusCode,
                timestamp: new Date(m.endTime).toISOString()
            })),
            databasePool: getConnectionPoolStats()
        };
    }

    /**
     * 성능 리포트 생성
     * @returns {string} 성능 리포트 텍스트
     */
    generatePerformanceReport() {
        const stats = this.getPerformanceStats();

        return `
=== 성능 모니터링 리포트 ===
총 요청 수: ${stats.summary.totalRequests}
평균 응답 시간: ${stats.summary.averageResponseTime}ms
에러율: ${stats.summary.errorRate}%
최근 5분 요청 수: ${stats.summary.recentRequestCount}

느린 요청 (최근 10개):
${stats.recentSlowestRequests.map(r =>
            `- ${r.method} ${r.path}: ${r.responseTime}ms (${r.statusCode})`
        ).join('\n')}

데이터베이스 풀:
- 사용률: ${((stats.databasePool.using / stats.databasePool.max) * 100).toFixed(1)}%
- 활성 연결: ${stats.databasePool.using}/${stats.databasePool.max}
- 대기 요청: ${stats.databasePool.waiting}
================================
        `;
    }
}

// 싱글톤 인스턴스 생성
const performanceMonitor = new PerformanceMonitor();

export { performanceMonitor };
