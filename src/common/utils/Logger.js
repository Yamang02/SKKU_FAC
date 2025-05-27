import { infrastructureConfig } from '../../config/infrastructure.js';

class Logger {
    constructor() {
        this.environment = infrastructureConfig.environment;
        this.isDevelopment = this.environment === 'development' || this.environment === 'local';
    }

    /**
     * 로그 포맷팅
     */
    formatMessage(level, message, meta = {}) {
        const timestamp = new Date().toISOString();
        const prefix = this.getPrefix(level);

        if (this.isDevelopment) {
            return `[${timestamp}] ${prefix} ${message}`;
        }

        return JSON.stringify({
            timestamp,
            level,
            message,
            environment: this.environment,
            ...meta
        });
    }

    /**
     * 로그 레벨별 프리픽스
     */
    getPrefix(level) {
        const prefixes = {
            info: '✅',
            warn: '⚠️',
            error: '❌',
            debug: '🔍',
            success: '🎉'
        };
        return prefixes[level] || 'ℹ️';
    }

    /**
     * 정보 로그
     */
    info(message, meta = {}) {
        console.log(this.formatMessage('info', message, meta));
    }

    /**
     * 성공 로그
     */
    success(message, meta = {}) {
        console.log(this.formatMessage('success', message, meta));
    }

    /**
     * 경고 로그
     */
    warn(message, meta = {}) {
        console.warn(this.formatMessage('warn', message, meta));
    }

    /**
     * 에러 로그
     */
    error(message, error = null, meta = {}) {
        const errorMeta = error ? {
            ...meta,
            error: {
                message: error.message,
                stack: this.isDevelopment ? error.stack : undefined
            }
        } : meta;

        console.error(this.formatMessage('error', message, errorMeta));
    }

    /**
     * 디버그 로그 (개발 환경에서만)
     */
    debug(message, meta = {}) {
        if (this.isDevelopment) {
            console.log(this.formatMessage('debug', message, meta));
        }
    }

    /**
     * HTTP 요청 로그
     */
    http(req, res, duration) {
        const message = `${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`;
        const meta = {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            duration,
            userAgent: req.get('User-Agent'),
            ip: req.ip
        };

        if (res.statusCode >= 400) {
            this.warn(message, meta);
        } else {
            this.info(message, meta);
        }
    }

    /**
     * 환경 정보 로그
     */
    logEnvironmentInfo() {
        this.info('==== 환경 설정 정보 ====');
        this.info(`NODE_ENV: ${process.env.NODE_ENV}`);
        this.info(`DB_HOST: ${process.env.DB_HOST}`);
        this.info(`DB_NAME: ${process.env.DB_NAME}`);
        this.info(`DB_PORT: ${process.env.DB_PORT}`);
        this.info(`BASE_URL: ${process.env.BASE_URL}`);
        this.info(`PORT 환경변수 있음: ${process.env.PORT ? 'Yes' : 'No'}`);
        this.info('=====================');
    }

    /**
     * 서버 시작 로그
     */
    logServerStart(port) {
        this.success(`서버가 포트 ${port}에서 실행 중입니다.`);
        this.info(`환경: ${process.env.NODE_ENV || 'development'}`);
        this.info(`헬스체크 URL: http://localhost:${port}/health`);
    }
}

// 싱글톤 인스턴스
const logger = new Logger();

export default logger;
