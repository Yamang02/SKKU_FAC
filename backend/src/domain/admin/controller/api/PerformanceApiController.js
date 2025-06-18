import { performanceMonitor } from '../../../../common/middleware/PerformanceMonitor.js';
import {
    getConnectionPoolStats,
    checkConnectionPoolHealth
} from '../../../../infrastructure/db/adapter/MySQLDatabase.js';
import logger from '../../../../common/utils/Logger.js';

/**
 * 성능 모니터링 API 컨트롤러
 * 관리자용 성능 통계 및 모니터링 기능을 제공합니다.
 */
export default class PerformanceApiController {
    /**
     * 성능 통계 조회
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    async getPerformanceStats(req, res) {
        try {
            const stats = performanceMonitor.getPerformanceStats();

            res.json({
                success: true,
                data: {
                    ...stats,
                    timestamp: new Date().toISOString(),
                    serverUptime: process.uptime(),
                    nodeVersion: process.version,
                    platform: process.platform
                }
            });
        } catch (error) {
            logger.error('성능 통계 조회 실패:', error);
            res.status(500).json({
                success: false,
                message: '성능 통계 조회 중 오류가 발생했습니다.',
                error: error.message
            });
        }
    }

    /**
     * 성능 리포트 생성
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    async generatePerformanceReport(req, res) {
        try {
            const report = performanceMonitor.generatePerformanceReport();

            res.json({
                success: true,
                data: {
                    report,
                    generatedAt: new Date().toISOString()
                }
            });
        } catch (error) {
            logger.error('성능 리포트 생성 실패:', error);
            res.status(500).json({
                success: false,
                message: '성능 리포트 생성 중 오류가 발생했습니다.',
                error: error.message
            });
        }
    }

    /**
     * 데이터베이스 연결 풀 상태 조회
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    async getDatabasePoolStatus(req, res) {
        try {
            const poolStats = getConnectionPoolStats();
            const isHealthy = checkConnectionPoolHealth();

            const utilizationRate = poolStats.available ? ((poolStats.using / poolStats.max) * 100).toFixed(1) : 0;

            res.json({
                success: true,
                data: {
                    ...poolStats,
                    utilizationRate: `${utilizationRate}%`,
                    isHealthy,
                    recommendations: this.generatePoolRecommendations(poolStats),
                    timestamp: new Date().toISOString()
                }
            });
        } catch (error) {
            logger.error('데이터베이스 풀 상태 조회 실패:', error);
            res.status(500).json({
                success: false,
                message: '데이터베이스 풀 상태 조회 중 오류가 발생했습니다.',
                error: error.message
            });
        }
    }

    /**
     * 시스템 메모리 사용량 조회
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    async getMemoryUsage(req, res) {
        try {
            const memoryUsage = process.memoryUsage();
            const systemMemory = {
                totalMemory: require('os').totalmem(),
                freeMemory: require('os').freemem()
            };

            const memoryStats = {
                process: {
                    heapUsed: this.formatBytes(memoryUsage.heapUsed),
                    heapTotal: this.formatBytes(memoryUsage.heapTotal),
                    external: this.formatBytes(memoryUsage.external),
                    rss: this.formatBytes(memoryUsage.rss),
                    heapUsedPercentage: ((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100).toFixed(1)
                },
                system: {
                    total: this.formatBytes(systemMemory.totalMemory),
                    free: this.formatBytes(systemMemory.freeMemory),
                    used: this.formatBytes(systemMemory.totalMemory - systemMemory.freeMemory),
                    usedPercentage: (
                        ((systemMemory.totalMemory - systemMemory.freeMemory) / systemMemory.totalMemory) *
                        100
                    ).toFixed(1)
                }
            };

            res.json({
                success: true,
                data: {
                    ...memoryStats,
                    recommendations: this.generateMemoryRecommendations(memoryUsage, systemMemory),
                    timestamp: new Date().toISOString()
                }
            });
        } catch (error) {
            logger.error('메모리 사용량 조회 실패:', error);
            res.status(500).json({
                success: false,
                message: '메모리 사용량 조회 중 오류가 발생했습니다.',
                error: error.message
            });
        }
    }

    /**
     * 성능 벤치마크 실행
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    async runPerformanceBenchmark(req, res) {
        try {
            const { testType = 'basic', iterations = 100 } = req.query;

            const benchmarkResults = await this.executeBenchmark(testType, parseInt(iterations));

            res.json({
                success: true,
                data: {
                    testType,
                    iterations,
                    results: benchmarkResults,
                    executedAt: new Date().toISOString()
                }
            });
        } catch (error) {
            logger.error('성능 벤치마크 실행 실패:', error);
            res.status(500).json({
                success: false,
                message: '성능 벤치마크 실행 중 오류가 발생했습니다.',
                error: error.message
            });
        }
    }

    /**
     * 연결 풀 권장사항 생성
     * @param {Object} poolStats - 연결 풀 통계
     * @returns {Array} 권장사항 목록
     */
    generatePoolRecommendations(poolStats) {
        const recommendations = [];

        if (!poolStats.available) {
            recommendations.push({
                type: 'error',
                message: '연결 풀이 사용 불가능합니다. 데이터베이스 연결을 확인하세요.'
            });
            return recommendations;
        }

        const utilizationRate = poolStats.using / poolStats.max;

        if (utilizationRate > 0.8) {
            recommendations.push({
                type: 'warning',
                message: `연결 풀 사용률이 높습니다 (${(utilizationRate * 100).toFixed(1)}%). 최대 연결 수 증가를 고려하세요.`
            });
        }

        if (poolStats.waiting > 0) {
            recommendations.push({
                type: 'warning',
                message: `${poolStats.waiting}개의 요청이 연결을 대기 중입니다. 연결 풀 크기 조정이 필요할 수 있습니다.`
            });
        }

        if (utilizationRate < 0.2 && poolStats.max > 5) {
            recommendations.push({
                type: 'info',
                message: `연결 풀 사용률이 낮습니다 (${(utilizationRate * 100).toFixed(1)}%). 최대 연결 수를 줄여 리소스를 절약할 수 있습니다.`
            });
        }

        if (recommendations.length === 0) {
            recommendations.push({
                type: 'success',
                message: '연결 풀이 정상적으로 작동하고 있습니다.'
            });
        }

        return recommendations;
    }

    /**
     * 메모리 권장사항 생성
     * @param {Object} processMemory - 프로세스 메모리 사용량
     * @param {Object} systemMemory - 시스템 메모리 정보
     * @returns {Array} 권장사항 목록
     */
    generateMemoryRecommendations(processMemory, systemMemory) {
        const recommendations = [];

        const heapUsageRate = processMemory.heapUsed / processMemory.heapTotal;
        const systemUsageRate = (systemMemory.totalMemory - systemMemory.freeMemory) / systemMemory.totalMemory;

        if (heapUsageRate > 0.8) {
            recommendations.push({
                type: 'warning',
                message: `힙 메모리 사용률이 높습니다 (${(heapUsageRate * 100).toFixed(1)}%). 메모리 누수를 확인하세요.`
            });
        }

        if (systemUsageRate > 0.9) {
            recommendations.push({
                type: 'error',
                message: `시스템 메모리 사용률이 매우 높습니다 (${(systemUsageRate * 100).toFixed(1)}%). 즉시 조치가 필요합니다.`
            });
        }

        if (processMemory.rss > 1024 * 1024 * 1024) {
            // 1GB
            recommendations.push({
                type: 'info',
                message: 'RSS 메모리가 1GB를 초과했습니다. 애플리케이션 최적화를 고려하세요.'
            });
        }

        if (recommendations.length === 0) {
            recommendations.push({
                type: 'success',
                message: '메모리 사용량이 정상 범위 내에 있습니다.'
            });
        }

        return recommendations;
    }

    /**
     * 벤치마크 실행
     * @param {string} testType - 테스트 유형
     * @param {number} iterations - 반복 횟수
     * @returns {Object} 벤치마크 결과
     */
    async executeBenchmark(testType, iterations) {
        const startTime = Date.now();
        const startMemory = process.memoryUsage();

        let results = {};

        switch (testType) {
        case 'basic':
            results = await this.basicBenchmark(iterations);
            break;
        case 'database':
            results = await this.databaseBenchmark(iterations);
            break;
        case 'memory':
            results = await this.memoryBenchmark(iterations);
            break;
        default:
            throw new Error(`지원하지 않는 벤치마크 유형: ${testType}`);
        }

        const endTime = Date.now();
        const endMemory = process.memoryUsage();

        return {
            ...results,
            totalTime: endTime - startTime,
            memoryDelta: {
                heapUsed: endMemory.heapUsed - startMemory.heapUsed,
                heapTotal: endMemory.heapTotal - startMemory.heapTotal,
                external: endMemory.external - startMemory.external
            }
        };
    }

    /**
     * 기본 벤치마크
     * @param {number} iterations - 반복 횟수
     * @returns {Object} 벤치마크 결과
     */
    async basicBenchmark(iterations) {
        const times = [];
        let totalSum = 0;

        for (let i = 0; i < iterations; i++) {
            const start = Date.now();

            // 간단한 계산 작업
            let sum = 0;
            for (let j = 0; j < 10000; j++) {
                sum += Math.sqrt(j);
            }
            totalSum += sum;

            times.push(Date.now() - start);
        }

        return {
            averageTime: times.reduce((a, b) => a + b, 0) / times.length,
            minTime: Math.min(...times),
            maxTime: Math.max(...times),
            totalOperations: iterations * 10000,
            computationResult: totalSum
        };
    }

    /**
     * 데이터베이스 벤치마크
     * @param {number} iterations - 반복 횟수
     * @returns {Object} 벤치마크 결과
     */
    async databaseBenchmark(iterations) {
        // 실제 구현에서는 간단한 SELECT 쿼리를 반복 실행
        const times = [];

        for (let i = 0; i < Math.min(iterations, 10); i++) {
            // DB 부하 방지를 위해 최대 10회
            const start = Date.now();

            // 간단한 쿼리 시뮬레이션 (실제로는 DB 쿼리 실행)
            await new Promise(resolve => setTimeout(resolve, Math.random() * 10));

            times.push(Date.now() - start);
        }

        return {
            averageQueryTime: times.reduce((a, b) => a + b, 0) / times.length,
            minQueryTime: Math.min(...times),
            maxQueryTime: Math.max(...times),
            totalQueries: times.length
        };
    }

    /**
     * 메모리 벤치마크
     * @param {number} iterations - 반복 횟수
     * @returns {Object} 벤치마크 결과
     */
    async memoryBenchmark(iterations) {
        const startMemory = process.memoryUsage();
        const arrays = [];

        // 메모리 할당 테스트
        for (let i = 0; i < Math.min(iterations, 100); i++) {
            arrays.push(new Array(10000).fill(Math.random()));
        }

        const peakMemory = process.memoryUsage();

        // 메모리 해제
        arrays.length = 0;

        // 가비지 컬렉션 강제 실행 (가능한 경우)
        if (global.gc) {
            global.gc();
        }

        const endMemory = process.memoryUsage();

        return {
            memoryAllocated: peakMemory.heapUsed - startMemory.heapUsed,
            memoryFreed: peakMemory.heapUsed - endMemory.heapUsed,
            peakHeapUsed: peakMemory.heapUsed,
            arraysCreated: arrays.length
        };
    }

    /**
     * 바이트를 읽기 쉬운 형태로 변환
     * @param {number} bytes - 바이트 수
     * @returns {string} 포맷된 문자열
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}
