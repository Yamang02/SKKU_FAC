import { Router } from 'express';
import HealthController from './HealthController.js';
import { getMiddlewareStats, resetMiddlewareStats } from '../../../common/middleware/setupMiddleware.js';

const CommonRouter = Router();

// 헬스체크 엔드포인트
CommonRouter.get('/health', (req, res) => HealthController.checkHealth(req, res));

// 미들웨어 성능 통계 조회 (개발/테스트 환경에서만)
CommonRouter.get('/middleware-stats', (req, res) => {
    const config = req.app.get('config');

    // 프로덕션 환경에서는 접근 제한
    if (config && config.isProduction()) {
        return res.status(403).json({
            error: 'Access denied in production environment'
        });
    }

    try {
        const stats = getMiddlewareStats();
        res.json({
            success: true,
            data: stats,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve middleware stats',
            message: error.message
        });
    }
});

// 미들웨어 성능 통계 초기화 (개발/테스트 환경에서만)
CommonRouter.post('/middleware-stats/reset', (req, res) => {
    const config = req.app.get('config');

    // 프로덕션 환경에서는 접근 제한
    if (config && config.isProduction()) {
        return res.status(403).json({
            error: 'Access denied in production environment'
        });
    }

    try {
        resetMiddlewareStats();
        res.json({
            success: true,
            message: 'Middleware stats reset successfully',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to reset middleware stats',
            message: error.message
        });
    }
});

export default CommonRouter;
