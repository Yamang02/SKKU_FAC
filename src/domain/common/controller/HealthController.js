/**
 * 헬스체크 컨트롤러
 */
class HealthController {
    /**
     * 시스템 헬스체크
     */
    async checkHealth(req, res) {
        try {
            const health = {
                status: 'OK',
                timestamp: new Date().toISOString(),
                services: {
                    app: 'healthy'
                }
            };

            // 세션 스토어 상태 확인 (안전하게)
            try {
                // 세션이 초기화되어 있는지 확인
                if (req.session !== undefined) {
                    health.services.session = 'healthy';
                } else {
                    health.services.session = 'degraded';
                }
            } catch (error) {
                health.services.session = 'error';
            }

            res.status(200).json(health);
        } catch (error) {
            res.status(500).json({
                status: 'ERROR',
                timestamp: new Date().toISOString(),
                error: error.message
            });
        }
    }
}

export default new HealthController();
