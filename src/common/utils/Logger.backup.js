import { infrastructureConfig } from '../../config/infrastructure.js';
import fs from 'fs';
import path from 'path';

class Logger {
    constructor() {
        this.environment = infrastructureConfig.environment;
        this.isDevelopment = this.environment === 'development' || this.environment === 'local';
        this.logDir = path.join(process.cwd(), 'logs');
        this.ensureLogDirectory();
    }

    /**
     * 로그 디렉토리 생성
     */
    ensureLogDirectory() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    /**
     * 로그 포맷팅 (사용자 정보 포함)
     */
    formatMessage(level, message, meta = {}, userInfo = null) {
        const timestamp = new Date().toISOString();
        const prefix = this.getPrefix(level);

        // 사용자 정보가 있으면 메시지 앞에 추가
        const userPrefix = userInfo ? `[${userInfo.username}]` : '';
        const formattedMessage = userPrefix ? `${userPrefix} ${message}` : message;

        if (this.isDevelopment) {
            return `[${timestamp}] ${prefix} ${formattedMessage}`;
        }

        return JSON.stringify({
            timestamp,
            level,
            message: formattedMessage,
            environment: this.environment,
            user: userInfo,
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
            success: '🎉',
            http: '🌐',
            auth: '🔐',
            db: '💾'
        };
        return prefixes[level] || 'ℹ️';
    }

    /**
     * 파일에 로그 저장 (프로덕션 환경)
     */
    writeToFile(level, formattedMessage) {
        if (!this.isDevelopment) {
            const logFile = path.join(this.logDir, `${level}.log`);
            const logEntry = `${formattedMessage}\n`;
            fs.appendFileSync(logFile, logEntry);
        }
    }

    /**
     * 정보 로그
     */
    info(message, meta = {}, userInfo = null) {
        const formatted = this.formatMessage('info', message, meta, userInfo);
        console.log(formatted);
        this.writeToFile('info', formatted);
    }

    /**
     * 성공 로그
     */
    success(message, meta = {}, userInfo = null) {
        const formatted = this.formatMessage('success', message, meta, userInfo);
        console.log(formatted);
        this.writeToFile('info', formatted);
    }

    /**
     * 경고 로그
     */
    warn(message, meta = {}, userInfo = null) {
        const formatted = this.formatMessage('warn', message, meta, userInfo);
        console.warn(formatted);
        this.writeToFile('warn', formatted);
    }

    /**
     * 에러 로그
     */
    error(message, error = null, meta = {}, userInfo = null) {
        const errorMeta = error ? {
            ...meta,
            error: {
                message: error.message,
                stack: this.isDevelopment ? error.stack : undefined
            }
        } : meta;

        const formatted = this.formatMessage('error', message, errorMeta, userInfo);
        console.error(formatted);
        this.writeToFile('error', formatted);
    }

    /**
     * 디버그 로그 (개발 환경에서만)
     */
    debug(message, meta = {}, userInfo = null) {
        if (this.isDevelopment) {
            const formatted = this.formatMessage('debug', message, meta, userInfo);
            console.log(formatted);
        }
    }

    /**
     * 인증 관련 로그
     */
    auth(message, meta = {}, userInfo = null) {
        const formatted = this.formatMessage('auth', message, meta, userInfo);
        console.log(formatted);
        this.writeToFile('auth', formatted);
    }

    /**
     * 데이터베이스 관련 로그
     */
    db(message, meta = {}, userInfo = null) {
        const formatted = this.formatMessage('db', message, meta, userInfo);
        console.log(formatted);
        this.writeToFile('db', formatted);
    }

    /**
     * HTTP 요청 로그 (사용자 정보 포함)
     */
    http(req, res, duration) {
        const userInfo = req.session?.user ? {
            username: req.session.user.username,
            role: req.session.user.role
        } : null;

        const userPrefix = userInfo ? `[${userInfo.username}]` : '';
        const message = `${userPrefix} ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`;

        const meta = {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            duration,
            userAgent: req.get('User-Agent'),
            ip: req.ip,
            user: userInfo
        };

        const formatted = this.formatMessage('http', message, meta);

        if (res.statusCode >= 400) {
            console.warn(formatted);
            this.writeToFile('warn', formatted);
        } else {
            console.log(formatted);
            this.writeToFile('info', formatted);
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

    /**
     * 요청 컨텍스트에서 사용자 정보 추출
     */
    extractUserInfo(req) {
        if (req?.session?.user) {
            return {
                username: req.session.user.username,
                role: req.session.user.role,
                id: req.session.user.id
            };
        }
        return null;
    }

    /**
     * 컨텍스트 기반 로깅 헬퍼 메서드들
     */
    withContext(req) {
        const userInfo = this.extractUserInfo(req);

        return {
            info: (message, meta = {}) => this.info(message, meta, userInfo),
            success: (message, meta = {}) => this.success(message, meta, userInfo),
            warn: (message, meta = {}) => this.warn(message, meta, userInfo),
            error: (message, error = null, meta = {}) => this.error(message, error, meta, userInfo),
            debug: (message, meta = {}) => this.debug(message, meta, userInfo),
            auth: (message, meta = {}) => this.auth(message, meta, userInfo),
            db: (message, meta = {}) => this.db(message, meta, userInfo)
        };
    }
}

// 싱글톤 인스턴스
const logger = new Logger();

export default logger;
