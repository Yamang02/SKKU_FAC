import { db } from '../../../infrastructure/db/adapter/MySQLDatabase.js';
import redisClient from '../../../infrastructure/redis/RedisClient.js';
import Config from '../../../config/Config.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import getMetricsCollector from '../../../common/monitoring/getMetricsCollector.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 헬스체크 컨트롤러
 */
class HealthController {
    constructor() {
        this.config = Config.getInstance();
        this.redisClient = redisClient;
        this.startTime = Date.now();
        this.metricsCollector = getMetricsCollector();
    }

    /**
     * 시스템 헬스체크
     */
    async checkHealth(req, res) {
        try {
            const health = {
                status: 'OK',
                timestamp: new Date().toISOString(),
                uptime: Math.floor((Date.now() - this.startTime) / 1000),
                environment: this.config.get('app.environment') || process.env.NODE_ENV || 'unknown',
                version: this.getVersion(),
                services: {
                    app: 'healthy'
                }
            };

            // 데이터베이스 연결 상태 확인
            health.database = await this.checkDatabaseConnection();

            // Redis 연결 상태 확인
            health.redis = await this.checkRedisConnection();

            // 메트릭 수집기에 연결 상태 업데이트
            this.metricsCollector.updateConnectionStatus('database', health.database.status === 'connected');
            this.metricsCollector.updateConnectionStatus('redis', health.redis.status === 'connected');

            // 세션 스토어 상태 확인 (안전하게)
            try {
                if (req.session !== undefined) {
                    health.services.session = 'healthy';
                } else {
                    health.services.session = 'degraded';
                }
            } catch (error) {
                health.services.session = 'error';
            }

            // 전체 상태 결정 (핵심 서비스만 체크)
            const coreServicesHealthy =
                health.database.status === 'connected' &&
                health.redis.status === 'connected';

            if (!coreServicesHealthy) {
                health.status = 'DEGRADED';
            }

            const statusCode = health.status === 'OK' ? 200 : 503;
            res.status(statusCode).json(health);
        } catch (error) {
            res.status(500).json({
                status: 'ERROR',
                timestamp: new Date().toISOString(),
                uptime: Math.floor((Date.now() - this.startTime) / 1000),
                environment: this.config.get('app.environment') || process.env.NODE_ENV || 'unknown',
                version: this.getVersion(),
                error: error.message
            });
        }
    }

    /**
     * 데이터베이스 연결 상태 확인
     */
    async checkDatabaseConnection() {
        try {
            await db.authenticate();
            return {
                status: 'connected',
                type: 'MySQL',
                host: this.config.get('database.host'),
                database: this.config.get('database.database')
            };
        } catch (error) {
            return {
                status: 'disconnected',
                type: 'MySQL',
                error: error.message
            };
        }
    }

    /**
     * Redis 연결 상태 확인
     */
    async checkRedisConnection() {
        try {
            const isConnected = await this.redisClient.testConnection();
            if (isConnected) {
                return {
                    status: 'connected',
                    type: 'Redis'
                };
            } else {
                return {
                    status: 'disconnected',
                    type: 'Redis',
                    error: 'Connection test failed'
                };
            }
        } catch (error) {
            return {
                status: 'disconnected',
                type: 'Redis',
                error: error.message
            };
        }
    }

    /**
     * 애플리케이션 버전 정보 가져오기
     */
    getVersion() {
        try {
            const packageJsonPath = path.resolve(__dirname, '../../../../package.json');
            const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
            return packageJson.version || '1.0.0';
        } catch (error) {
            return '1.0.0';
        }
    }
}

export default new HealthController();
