import logger from '../utils/Logger.js';
import {
    getErrorStatusCode,
    getErrorSeverity,
    getErrorCategory,
    ErrorSeverity
} from '../error/BaseError.js';
import ErrorReporter from '../monitoring/ErrorReporter.js';
import Config from '../../config/Config.js';

/**
 * 중앙집중식 에러 처리 미들웨어
 * 모든 에러를 일관되게 처리하고 로깅합니다.
 */
export class ErrorHandler {
    /**
     * @param {object} options - 에러 처리 옵션
     * @param {boolean} options.isDevelopment - 개발 환경 여부
     * @param {boolean} options.includeStackTrace - 스택 트레이스 포함 여부
     * @param {boolean} options.enableDetailedLogging - 상세 로깅 활성화 여부
     * @param {object} options.customHandlers - 에러 타입별 커스텀 핸들러
     * @param {object} options.environmentConfig - 환경별 설정
     * @param {object} options.loggingConfig - 로깅 설정 커스터마이징
     * @param {object} options.responseConfig - 응답 형식 커스터마이징
     * @param {object} options.filterRules - 에러 필터링 규칙
     * @param {object} options.transformRules - 에러 변환 규칙
     */
    constructor(options = {}) {
        this.config = Config.getInstance();
        const environment = this.config.getEnvironment();

        // 기본 설정
        this.isDevelopment = options.isDevelopment ?? environment === 'development';
        this.includeStackTrace = options.includeStackTrace ?? this.isDevelopment;
        this.enableDetailedLogging = options.enableDetailedLogging ?? true;

        // 고급 커스터마이징 설정
        this.customHandlers = options.customHandlers || {};
        this.environmentConfig = this.initializeEnvironmentConfig(options.environmentConfig);
        this.loggingConfig = this.initializeLoggingConfig(options.loggingConfig);
        this.responseConfig = this.initializeResponseConfig(options.responseConfig);
        this.filterRules = options.filterRules || {};
        this.transformRules = options.transformRules || {};

        // 에러 리포터 설정
        this.errorReporter = options.errorReporter || new ErrorReporter({
            projectName: options.projectName || 'SKKU Gallery',
            enableNotifications: options.enableNotifications,
            emailConfig: options.emailConfig
        });

        // 메트릭 및 통계
        this.errorStats = {
            total: 0,
            byType: {},
            byStatus: {},
            bySeverity: {}
        };
    }

    /**
     * 환경별 설정 초기화
     * @param {object} config - 환경별 설정
     * @returns {object} 초기화된 환경 설정
     */
    initializeEnvironmentConfig(config = {}) {
        const defaultConfig = {
            development: {
                includeStackTrace: true,
                enableDetailedLogging: true,
                logLevel: 'debug',
                showInternalErrors: true
            },
            testing: {
                includeStackTrace: false,
                enableDetailedLogging: false,
                logLevel: 'error',
                showInternalErrors: false
            },
            staging: {
                includeStackTrace: false,
                enableDetailedLogging: true,
                logLevel: 'warn',
                showInternalErrors: false
            },
            production: {
                includeStackTrace: false,
                enableDetailedLogging: false,
                logLevel: 'error',
                showInternalErrors: false
            }
        };

        const environment = this.config.getEnvironment();
        return {
            ...defaultConfig,
            ...config,
            current: environment,
            active: { ...defaultConfig[environment], ...config[environment] }
        };
    }

    /**
     * 로깅 설정 초기화
     * @param {object} config - 로깅 설정
     * @returns {object} 초기화된 로깅 설정
     */
    initializeLoggingConfig(config = {}) {
        return {
            enableMetrics: config.enableMetrics ?? true,
            excludeFields: config.excludeFields || ['password', 'token', 'authorization'],
            maxBodySize: config.maxBodySize || 1024, // bytes
            enableRequestId: config.enableRequestId ?? true,
            customFields: config.customFields || {},
            ...config
        };
    }

    /**
     * 응답 설정 초기화
     * @param {object} config - 응답 설정
     * @returns {object} 초기화된 응답 설정
     */
    initializeResponseConfig(config = {}) {
        return {
            apiResponseTemplate: config.apiResponseTemplate || this.getDefaultApiTemplate(),
            htmlErrorTemplate: config.htmlErrorTemplate || 'common/error',
            enableCors: config.enableCors ?? true,
            customHeaders: config.customHeaders || {},
            ...config
        };
    }

    /**
     * 기본 API 응답 템플릿
     * @returns {Function} 응답 템플릿 함수
     */
    getDefaultApiTemplate() {
        return (errorInfo, isDevelopment) => ({
            success: false,
            error: {
                message: errorInfo.message,
                code: errorInfo.code,
                statusCode: errorInfo.statusCode,
                timestamp: new Date().toISOString(),
                ...(isDevelopment && {
                    name: errorInfo.name,
                    details: errorInfo.details,
                    stack: errorInfo.stack
                })
            }
        });
    }

    /**
     * Express.js 에러 처리 미들웨어
     * @param {Error} err - 에러 객체
     * @param {Request} req - Express Request 객체
     * @param {Response} res - Express Response 객체
     * @param {Function} next - Next 함수
     */
    handleError = (err, req, res, next) => {
        // 이미 응답이 시작된 경우 Express 기본 핸들러에 위임
        if (res.headersSent) {
            return next(err);
        }

        try {
            // 메트릭 업데이트
            this.updateErrorStats(err);

            // 에러 필터링 검사
            if (this.shouldIgnoreError(err, req)) {
                return next();
            }

            // 에러 변환 적용
            const transformedError = this.transformError(err, req);

            // 커스텀 핸들러 확인
            const customHandler = this.getCustomHandler(transformedError);
            if (customHandler) {
                return customHandler(transformedError, req, res, next);
            }

            // 에러 정보 추출
            const errorInfo = this.extractErrorInfo(transformedError);

            // 로깅
            this.logError(transformedError, req, errorInfo);

            // ErrorReporter를 통한 고급 리포팅
            this.reportError(transformedError, req, errorInfo);

            // 응답 전송
            this.sendErrorResponse(transformedError, req, res, errorInfo);

        } catch (handlingError) {
            // 에러 처리 중 에러가 발생한 경우
            logger.error('에러 처리 중 오류 발생', handlingError);
            this.sendFallbackError(res);
        }
    };

    /**
     * 에러 통계 업데이트
     * @param {Error} err - 에러 객체
     */
    updateErrorStats(err) {
        if (!this.loggingConfig.enableMetrics) return;

        this.errorStats.total++;

        const errorType = err.name || 'Unknown';
        const statusCode = getErrorStatusCode(err);
        const severity = getErrorSeverity(err);

        this.errorStats.byType[errorType] = (this.errorStats.byType[errorType] || 0) + 1;
        this.errorStats.byStatus[statusCode] = (this.errorStats.byStatus[statusCode] || 0) + 1;
        this.errorStats.bySeverity[severity] = (this.errorStats.bySeverity[severity] || 0) + 1;
    }

    /**
     * 에러 무시 여부 검사
     * @param {Error} err - 에러 객체
     * @param {Request} req - Express Request 객체
     * @returns {boolean}
     */
    shouldIgnoreError(err, req) {
        const { ignorePatterns, ignoreStatusCodes, ignoreUserAgents } = this.filterRules;

        // 상태 코드 기반 필터링
        if (ignoreStatusCodes && ignoreStatusCodes.includes(getErrorStatusCode(err))) {
            return true;
        }

        // URL 패턴 기반 필터링
        if (ignorePatterns && ignorePatterns.some(pattern =>
            new RegExp(pattern).test(req.originalUrl))) {
            return true;
        }

        // User-Agent 기반 필터링 (봇, 크롤러 등)
        if (ignoreUserAgents && ignoreUserAgents.some(agent => {
            const userAgent = req.get('User-Agent') || '';
            // 정규식인 경우 test() 사용, 문자열인 경우 includes() 사용
            if (agent instanceof RegExp) {
                return agent.test(userAgent);
            } else {
                return userAgent.includes(agent);
            }
        })) {
            return true;
        }

        return false;
    }

    /**
     * 에러 변환 적용
     * @param {Error} err - 원본 에러 객체
     * @param {Request} req - Express Request 객체
     * @returns {Error} 변환된 에러 객체
     */
    transformError(err, req) {
        const { messageTransforms, codeTransforms } = this.transformRules;

        // 메시지 변환
        if (messageTransforms) {
            for (const [pattern, replacement] of Object.entries(messageTransforms)) {
                if (new RegExp(pattern).test(err.message)) {
                    err.message = typeof replacement === 'function'
                        ? replacement(err.message, err, req)
                        : replacement;
                    break;
                }
            }
        }

        // 에러 코드 변환
        if (codeTransforms && err.code && codeTransforms[err.code]) {
            err.code = codeTransforms[err.code];
        }

        return err;
    }

    /**
     * 커스텀 핸들러 검색
     * @param {Error} err - 에러 객체
     * @returns {Function|null} 커스텀 핸들러 함수
     */
    getCustomHandler(err) {
        const { byType, byCode, byStatusCode } = this.customHandlers;

        // 타입별 핸들러
        if (byType && err.name && byType[err.name]) {
            return byType[err.name];
        }

        // 코드별 핸들러
        if (byCode && err.code && byCode[err.code]) {
            return byCode[err.code];
        }

        // 상태 코드별 핸들러
        const statusCode = getErrorStatusCode(err);
        if (byStatusCode && byStatusCode[statusCode]) {
            return byStatusCode[statusCode];
        }

        return null;
    }

    /**
     * 404 Not Found 에러 처리 미들웨어
     * @param {Request} req - Express Request 객체
     * @param {Response} res - Express Response 객체
     * @param {Function} next - Next 함수
     */
    handle404 = (req, res, next) => {
        const error = new Error(`페이지를 찾을 수 없습니다: ${req.originalUrl}`);
        error.name = 'NotFoundError';
        error.statusCode = 404;

        // 에러 처리 미들웨어로 전달
        next(error);
    };

    /**
     * 에러 정보 추출
     * @param {Error} err - 에러 객체
     * @returns {object} 추출된 에러 정보
     */
    extractErrorInfo(err) {
        const statusCode = getErrorStatusCode(err);
        const severity = getErrorSeverity(err);
        const category = getErrorCategory(err);

        return {
            statusCode,
            severity,
            category,
            code: err.code || 'UNKNOWN_ERROR',
            message: err.message || '알 수 없는 오류가 발생했습니다.',
            name: err.name || 'Error',
            stack: err.stack,
            details: err.details || null
        };
    }

    /**
     * 에러 로깅 (강화된 Winston 로거 통합)
     * @param {Error} err - 원본 에러 객체
     * @param {Request} req - Express Request 객체
     * @param {object} errorInfo - 추출된 에러 정보
     */
    logError(err, req, errorInfo) {
        // 환경별 설정 적용
        const activeConfig = this.environmentConfig.active;

        // 로그 레벨 체크
        if (!this.shouldLog(errorInfo.severity, activeConfig.logLevel)) {
            return;
        }

        // 사용자 정보 추출
        const userInfo = req.session?.user ? {
            username: req.session.user.username,
            role: req.session.user.role,
            id: req.session.user.id
        } : null;

        const logData = {
            url: req.originalUrl,
            method: req.method,
            ip: req.ip || req.connection?.remoteAddress,
            userAgent: req.get('User-Agent'),
            userId: req.session?.user?.id,
            timestamp: new Date().toISOString(),
            ...errorInfo,
            ...this.loggingConfig.customFields
        };

        // Request ID 추가
        if (this.loggingConfig.enableRequestId && req.id) {
            logData.requestId = req.id;
        }

        // 민감한 필드 제거
        const sanitizedLogData = this.sanitizeLogData(logData, req);

        // 강화된 에러 로깅 사용 (분석 포함)
        let errorId;
        if (errorInfo.severity === ErrorSeverity.CRITICAL || errorInfo.severity === ErrorSeverity.HIGH) {
            // 중요한 에러는 강화된 분석과 함께 로깅
            errorId = logger.logErrorWithAnalysis(
                this.getErrorMessage(errorInfo.severity),
                err,
                { request: sanitizedLogData, errorHandler: true },
                userInfo,
                req
            );
        } else {
            // 일반 에러는 기본 로깅 사용
            switch (errorInfo.severity) {
                case ErrorSeverity.MEDIUM:
                    logger.warn('⚠️ MEDIUM SEVERITY ERROR', { error: err, request: sanitizedLogData }, userInfo);
                    break;
                case ErrorSeverity.LOW:
                default:
                    if (errorInfo.statusCode === 404) {
                        logger.debug(`📄 404 Error - ${req.originalUrl}`, { request: sanitizedLogData }, userInfo);
                    } else {
                        logger.info('ℹ️ CLIENT ERROR', { error: err, request: sanitizedLogData }, userInfo);
                    }
                    break;
            }
        }

        // 상세 로깅이 활성화된 경우 추가 정보 로깅
        if (activeConfig.enableDetailedLogging && errorInfo.severity !== ErrorSeverity.LOW) {
            const detailedInfo = {
                errorStack: err.stack,
                requestHeaders: this.sanitizeHeaders(req.headers),
                requestBody: this.sanitizeBody(req.body),
                requestParams: req.params,
                requestQuery: req.query
            };

            if (errorId) {
                logger.debug(`상세 에러 정보 [${errorId}]`, detailedInfo, userInfo);
            } else {
                logger.debug('상세 에러 정보', detailedInfo, userInfo);
            }
        }

        // 에러 패턴 감지 (동일한 에러가 반복되는 경우)
        this.detectErrorPattern(err, req, errorInfo);

        return errorId;
    }

    /**
     * 심각도별 에러 메시지 생성
     * @param {string} severity - 에러 심각도
     * @returns {string} 에러 메시지
     */
    getErrorMessage(severity) {
        switch (severity) {
            case ErrorSeverity.CRITICAL:
                return '🚨 시스템 중요 에러 발생';
            case ErrorSeverity.HIGH:
                return '🔥 높은 심각도 에러 발생';
            case ErrorSeverity.MEDIUM:
                return '⚠️ 중간 심각도 에러 발생';
            case ErrorSeverity.LOW:
            default:
                return 'ℹ️ 클라이언트 에러 발생';
        }
    }

    /**
     * 에러 패턴 감지
     * @param {Error} err - 에러 객체
     * @param {Request} req - Express Request 객체
     * @param {object} _errorInfo - 에러 정보 (미사용)
     */
    detectErrorPattern(err, req, _errorInfo) {
        // 간단한 에러 패턴 감지 로직
        const errorKey = `${err.name}:${err.message}:${req.originalUrl}`;
        const now = Date.now();
        const timeWindow = 5 * 60 * 1000; // 5분

        // 에러 발생 기록 (메모리 기반 - 실제 구현에서는 Redis 등 사용 권장)
        if (!this.errorPatterns) {
            this.errorPatterns = new Map();
        }

        const pattern = this.errorPatterns.get(errorKey) || { count: 0, firstOccurrence: now, lastOccurrence: now };
        pattern.count++;
        pattern.lastOccurrence = now;

        this.errorPatterns.set(errorKey, pattern);

        // 패턴 감지 (5분 내에 동일한 에러가 5회 이상 발생)
        if (pattern.count >= 5 && (now - pattern.firstOccurrence) <= timeWindow) {
            logger.logErrorPattern(
                errorKey,
                pattern.count,
                `${Math.round((now - pattern.firstOccurrence) / 1000 / 60)}분`
            );

            // 패턴 카운터 리셋
            pattern.count = 0;
            pattern.firstOccurrence = now;
        }

        // 오래된 패턴 정리 (메모리 누수 방지)
        if (this.errorPatterns.size > 1000) {
            const cutoff = now - timeWindow;
            for (const [key, value] of this.errorPatterns.entries()) {
                if (value.lastOccurrence < cutoff) {
                    this.errorPatterns.delete(key);
                }
            }
        }
    }

    /**
     * 로깅 레벨 체크
     * @param {string} errorSeverity - 에러 심각도
     * @param {string} configLogLevel - 설정된 로그 레벨
     * @returns {boolean}
     */
    shouldLog(errorSeverity, configLogLevel) {
        const logLevels = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3
        };

        const severityLevels = {
            [ErrorSeverity.LOW]: 0,
            [ErrorSeverity.MEDIUM]: 2,
            [ErrorSeverity.HIGH]: 3,
            [ErrorSeverity.CRITICAL]: 3
        };

        const requiredLevel = logLevels[configLogLevel] || 0;
        const errorLevel = severityLevels[errorSeverity] || 0;

        return errorLevel >= requiredLevel;
    }

    /**
     * ErrorReporter를 통한 에러 리포팅
     * @param {Error} err - 에러 객체
     * @param {Request} req - Express Request 객체
     * @param {object} errorInfo - 에러 정보
     */
    async reportError(err, req, errorInfo) {
        try {
            const context = {
                url: req.originalUrl,
                method: req.method,
                userId: req.session?.user?.id,
                ip: req.ip || req.connection?.remoteAddress,
                userAgent: req.get('User-Agent'),
                referer: req.get('Referer'),
                extra: {
                    sessionId: req.sessionID,
                    query: req.query,
                    params: req.params
                }
            };

            await this.errorReporter.reportError(err, context, errorInfo.severity);
        } catch (reportError) {
            logger.error('Failed to report error to ErrorReporter', reportError);
        }
    }

    /**
     * 로그 데이터에서 민감한 정보 제거
     * @param {object} logData - 로그 데이터
     * @param {Request} _req - Express Request 객체 (미사용)
     * @returns {object} 정리된 로그 데이터
     */
    sanitizeLogData(logData, _req) {
        const { excludeFields } = this.loggingConfig;
        const sanitized = { ...logData };

        // 민감한 필드 제거
        excludeFields.forEach(field => {
            if (sanitized[field]) {
                sanitized[field] = '[REDACTED]';
            }
        });

        return sanitized;
    }

    /**
     * 요청 헤더에서 민감한 정보 제거
     * @param {object} headers - 요청 헤더
     * @returns {object} 정리된 헤더
     */
    sanitizeHeaders(headers) {
        const { excludeFields } = this.loggingConfig;
        const sanitized = { ...headers };

        excludeFields.forEach(field => {
            const lowerField = field.toLowerCase();
            if (sanitized[lowerField]) {
                sanitized[lowerField] = '[REDACTED]';
            }
        });

        return sanitized;
    }

    /**
     * 요청 본문에서 민감한 정보 제거 및 크기 제한
     * @param {object} body - 요청 본문
     * @returns {object} 정리된 본문
     */
    sanitizeBody(body) {
        if (!body || typeof body !== 'object') {
            return body;
        }

        const { excludeFields, maxBodySize } = this.loggingConfig;
        let sanitized = { ...body };

        // 민감한 필드 제거
        excludeFields.forEach(field => {
            if (sanitized[field]) {
                sanitized[field] = '[REDACTED]';
            }
        });

        // 크기 제한 적용
        const bodyString = JSON.stringify(sanitized);
        if (bodyString.length > maxBodySize) {
            sanitized = { _truncated: `Body too large (${bodyString.length} bytes)` };
        }

        return sanitized;
    }

    /**
     * 에러 응답 전송
     * @param {Error} err - 원본 에러 객체
     * @param {Request} req - Express Request 객체
     * @param {Response} res - Express Response 객체
     * @param {object} errorInfo - 추출된 에러 정보
     */
    sendErrorResponse(err, req, res, errorInfo) {
        // Content-Type 헤더가 이미 설정되어 있는지 확인
        if (!res.get('Content-Type')) {
            // Accept 헤더를 통해 클라이언트가 원하는 형식 판단
            if (this.isApiRequest(req)) {
                res.set('Content-Type', 'application/json');
            } else {
                res.set('Content-Type', 'text/html');
            }
        }

        res.status(errorInfo.statusCode);

        if (this.isApiRequest(req)) {
            this.sendJsonErrorResponse(res, err, errorInfo);
        } else {
            this.sendHtmlErrorResponse(req, res, errorInfo);
        }
    }

    /**
     * API 요청인지 판단
     * @param {Request} req - Express Request 객체
     * @returns {boolean}
     */
    isApiRequest(req) {
        // 1. XMLHttpRequest인지 확인
        if (req.xhr) return true;

        // 2. Accept 헤더에 JSON이 포함되어 있는지 확인
        const acceptHeader = req.get('Accept') || '';
        if (acceptHeader.includes('application/json')) return true;

        // 3. URL이 /api로 시작하는지 확인
        if (req.originalUrl.startsWith('/api')) return true;

        // 4. Content-Type이 JSON인지 확인
        const contentType = req.get('Content-Type') || '';
        if (contentType.includes('application/json')) return true;

        return false;
    }

    /**
     * JSON 형식 에러 응답 전송
     * @param {Response} res - Express Response 객체
     * @param {Error} err - 원본 에러 객체
     * @param {object} errorInfo - 추출된 에러 정보
     */
    sendJsonErrorResponse(res, err, errorInfo) {
        // 커스텀 응답 템플릿 사용
        const template = this.responseConfig.apiResponseTemplate;
        const activeConfig = this.environmentConfig.active;

        let response;
        if (typeof template === 'function') {
            response = template(errorInfo, activeConfig.showInternalErrors);
        } else {
            // 기본 응답 형식
            response = {
                success: false,
                error: {
                    message: errorInfo.message,
                    code: errorInfo.code,
                    statusCode: errorInfo.statusCode,
                    timestamp: new Date().toISOString()
                }
            };

            // 개발 환경에서는 추가 정보 포함
            if (activeConfig.showInternalErrors) {
                response.error.name = errorInfo.name;
                if (errorInfo.details) {
                    response.error.details = errorInfo.details;
                }
                if (this.environmentConfig.active.includeStackTrace && errorInfo.stack) {
                    response.error.stack = errorInfo.stack;
                }
            }
        }

        // 커스텀 헤더 추가
        if (this.responseConfig.customHeaders) {
            Object.entries(this.responseConfig.customHeaders).forEach(([key, value]) => {
                res.set(key, value);
            });
        }

        // CORS 설정
        if (this.responseConfig.enableCors) {
            res.set('Access-Control-Allow-Origin', '*');
            res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        }

        res.json(response);
    }

    /**
     * HTML 형식 에러 응답 전송
     * @param {Request} req - Express Request 객체
     * @param {Response} res - Express Response 객체
     * @param {object} errorInfo - 추출된 에러 정보
     */
    sendHtmlErrorResponse(req, res, errorInfo) {
        const returnUrl = this.getReturnUrl(req);
        const isAdminPath = req.originalUrl.startsWith('/admin');

        try {
            res.render('common/error', {
                title: `${errorInfo.statusCode} 에러`,
                message: errorInfo.message,
                returnUrl,
                isAdminPath,
                error: {
                    code: errorInfo.statusCode,
                    stack: this.includeStackTrace ? errorInfo.stack : null
                }
            });
        } catch (renderError) {
            logger.error('에러 페이지 렌더링 실패', renderError);
            this.sendFallbackError(res);
        }
    }

    /**
     * 이전 페이지 URL 결정
     * @param {Request} req - Express Request 객체
     * @returns {string} 돌아갈 URL
     */
    getReturnUrl(req) {
        const prevPage = req.session?.previousPage;

        if (req.originalUrl.startsWith('/admin')) {
            return '/admin';
        }

        if (prevPage && !prevPage.includes('/error')) {
            return prevPage;
        }

        return '/';
    }

    /**
     * 폴백 에러 응답 (에러 처리 중 에러 발생 시)
     * @param {Response} res - Express Response 객체
     */
    sendFallbackError(res) {
        if (!res.headersSent) {
            res.status(500).send('Internal Server Error');
        }
    }

    /**
     * 에러 통계 조회
     * @returns {object} 에러 통계 정보
     */
    getErrorStats() {
        return {
            ...this.errorStats,
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * 에러 통계 초기화
     */
    resetErrorStats() {
        this.errorStats = {
            total: 0,
            byType: {},
            byStatus: {},
            bySeverity: {}
        };
    }

    /**
     * 설정 업데이트
     * @param {object} newOptions - 새로운 설정 옵션
     */
    updateConfig(newOptions) {
        if (newOptions.environmentConfig) {
            this.environmentConfig = this.initializeEnvironmentConfig(newOptions.environmentConfig);
        }
        if (newOptions.loggingConfig) {
            this.loggingConfig = this.initializeLoggingConfig(newOptions.loggingConfig);
        }
        if (newOptions.responseConfig) {
            this.responseConfig = this.initializeResponseConfig(newOptions.responseConfig);
        }
        if (newOptions.filterRules) {
            this.filterRules = { ...this.filterRules, ...newOptions.filterRules };
        }
        if (newOptions.transformRules) {
            this.transformRules = { ...this.transformRules, ...newOptions.transformRules };
        }
        if (newOptions.customHandlers) {
            this.customHandlers = { ...this.customHandlers, ...newOptions.customHandlers };
        }
    }

    /**
     * 커스텀 핸들러 등록
     * @param {string} type - 핸들러 타입 ('byType', 'byCode', 'byStatusCode')
     * @param {string} key - 키 (에러 이름, 코드, 상태 코드)
     * @param {Function} handler - 핸들러 함수
     */
    registerCustomHandler(type, key, handler) {
        if (!this.customHandlers[type]) {
            this.customHandlers[type] = {};
        }
        this.customHandlers[type][key] = handler;
    }

    /**
     * 에러 변환 규칙 추가
     * @param {string} type - 변환 타입 ('messageTransforms', 'codeTransforms')
     * @param {string} pattern - 패턴 (정규식 문자열 또는 코드)
     * @param {string|Function} replacement - 대체값
     */
    addTransformRule(type, pattern, replacement) {
        if (!this.transformRules[type]) {
            this.transformRules[type] = {};
        }
        this.transformRules[type][pattern] = replacement;
    }

    /**
     * 에러 처리 미들웨어 팩토리
     * @param {object} options - 에러 처리 옵션
     * @returns {object} Express 에러 처리 미들웨어들과 핸들러 인스턴스
     */
    static create(options = {}) {
        const handler = new ErrorHandler(options);
        return {
            errorHandler: handler.handleError,
            notFoundHandler: handler.handle404,
            handler: handler // 핸들러 인스턴스 반환 (설정 업데이트 등을 위해)
        };
    }
}

export default ErrorHandler;
