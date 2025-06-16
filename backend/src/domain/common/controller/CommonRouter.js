import { Router } from 'express';
import HealthController from './HealthController.js';
import DashboardController from './DashboardController.js';
// 미들웨어 통계 기능은 개발환경에서 비활성화
// import { getMiddlewareStats, resetMiddlewareStats } from '../../../common/middleware/setupMiddleware.js';
import { csrfTokenEndpoint, csrfDebugEndpoint } from '../../../common/middleware/csrfProtection.js';

const CommonRouter = Router();

// 헬스체크 엔드포인트
CommonRouter.get('/health', (req, res) => HealthController.checkHealth(req, res));

// 모니터링 대시보드 API
CommonRouter.get('/api/monitoring/metrics', (req, res) => DashboardController.getMetricsApi(req, res));

// CSRF 토큰 제공 엔드포인트
CommonRouter.get('/csrf-token', csrfTokenEndpoint);

// CSRF 디버그 정보 (개발 환경에서만)
CommonRouter.get('/csrf-debug', csrfDebugEndpoint);

// 미들웨어 성능 통계 기능은 개발환경에서 비활성화됨
/*
CommonRouter.get('/middleware-stats', (req, res) => {
    res.status(404).json({ error: 'Middleware stats disabled in development' });
});

CommonRouter.post('/middleware-stats/reset', (req, res) => {
    res.status(404).json({ error: 'Middleware stats disabled in development' });
});
*/

export default CommonRouter;
