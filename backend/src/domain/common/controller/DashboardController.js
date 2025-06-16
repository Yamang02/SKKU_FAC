/**
 * 모니터링 대시보드 컨트롤러
 */

import getMetricsCollector from '../../../common/monitoring/getMetricsCollector.js';
import logger from '../../../common/utils/Logger.js';

class DashboardController {
    constructor() {
        this.metricsCollector = getMetricsCollector();
    }

    /**
     * 대시보드 페이지 렌더링
     */
    async renderDashboard(req, res) {
        try {
            const metrics = await this.metricsCollector.getMetricsSummary();

            res.render('admin/monitoring/dashboard', {
                title: 'SKKU Gallery - 모니터링 대시보드',
                metrics,
                timestamp: new Date().toLocaleString('ko-KR')
            });
        } catch (error) {
            logger.error('대시보드 렌더링 중 에러 발생', error);
            res.status(500).render('error', {
                error: '대시보드를 로드할 수 없습니다.'
            });
        }
    }

    /**
     * 메트릭 API 엔드포인트 (AJAX용)
     */
    async getMetricsApi(req, res) {
        try {
            const summary = await this.metricsCollector.getMetricsSummary();
            res.json({
                success: true,
                data: summary,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            logger.error('메트릭 API 에러', error);
            res.status(500).json({
                success: false,
                error: '메트릭을 가져올 수 없습니다.'
            });
        }
    }
}

export default new DashboardController();
