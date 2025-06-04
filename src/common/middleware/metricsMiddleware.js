/**
 * Prometheus 메트릭 수집 미들웨어
 */

import getMetricsCollector from '../monitoring/getMetricsCollector.js';

const metricsCollector = getMetricsCollector();

/**
 * HTTP 요청 메트릭 수집 미들웨어
 */
export const metricsMiddleware = (req, res, next) => {
    const startTime = Date.now();

    // 응답 완료 시 메트릭 기록
    res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        metricsCollector.recordHttpRequest(req, res, responseTime);
    });

    next();
};

/**
 * /metrics 엔드포인트 핸들러
 */
export const metricsEndpoint = async (req, res) => {
    try {
        const metrics = await metricsCollector.getMetrics();
        res.set('Content-Type', 'text/plain');
        res.send(metrics);
    } catch (error) {
        res.status(500).send('메트릭 수집 중 오류 발생');
    }
};

export default { metricsMiddleware, metricsEndpoint };
