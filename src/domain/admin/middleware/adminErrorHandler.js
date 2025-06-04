import logger from '../../../common/utils/Logger.js';
import { AuditLogType, AuditSeverity } from '../../../common/middleware/auditLogger.js';

/**
 * Admin 도메인 전용 에러 처리 미들웨어
 * 관리자 페이지에서 발생하는 에러를 적절히 처리하고 로깅합니다.
 */

/**
 * 에러 타입 분류
 */
export const AdminErrorType = {
    VALIDATION: 'VALIDATION',
    AUTHORIZATION: 'AUTHORIZATION',
    NOT_FOUND: 'NOT_FOUND',
    DATABASE: 'DATABASE',
    EXTERNAL_SERVICE: 'EXTERNAL_SERVICE',
    SYSTEM: 'SYSTEM'
};

/**
 * 에러 심각도 분류
 */
export const AdminErrorSeverity = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL'
};

/**
 * 에러 타입 감지
 */
function detectErrorType(error) {
    // Sequelize 에러
    if (error.name && error.name.includes('Sequelize')) {
        return AdminErrorType.DATABASE;
    }

    // 유효성 검사 에러
    if (error.name === 'ValidationError' || error.message.includes('validation')) {
        return AdminErrorType.VALIDATION;
    }

    // 권한 에러
    if (
        error.message.includes('권한') ||
        error.message.includes('unauthorized') ||
        error.message.includes('forbidden')
    ) {
        return AdminErrorType.AUTHORIZATION;
    }

    // 404 에러
    if (error.message.includes('찾을 수 없') || error.message.includes('not found')) {
        return AdminErrorType.NOT_FOUND;
    }

    // 외부 서비스 에러 (Cloudinary 등)
    if (error.message.includes('cloudinary') || error.message.includes('external')) {
        return AdminErrorType.EXTERNAL_SERVICE;
    }

    return AdminErrorType.SYSTEM;
}

/**
 * 에러 심각도 결정
 */
function determineErrorSeverity(errorType, error) {
    switch (errorType) {
    case AdminErrorType.VALIDATION:
        return AdminErrorSeverity.LOW;
    case AdminErrorType.NOT_FOUND:
        return AdminErrorSeverity.LOW;
    case AdminErrorType.AUTHORIZATION:
        return AdminErrorSeverity.MEDIUM;
    case AdminErrorType.DATABASE:
        return AdminErrorSeverity.HIGH;
    case AdminErrorType.EXTERNAL_SERVICE:
        return AdminErrorSeverity.MEDIUM;
    case AdminErrorType.SYSTEM:
        return error.stack ? AdminErrorSeverity.HIGH : AdminErrorSeverity.MEDIUM;
    default:
        return AdminErrorSeverity.MEDIUM;
    }
}

/**
 * 사용자 친화적 에러 메시지 생성
 */
function createUserFriendlyMessage(errorType, _error) {
    switch (errorType) {
    case AdminErrorType.VALIDATION:
        return '입력된 정보에 오류가 있습니다. 다시 확인해주세요.';
    case AdminErrorType.AUTHORIZATION:
        return '이 작업을 수행할 권한이 없습니다.';
    case AdminErrorType.NOT_FOUND:
        return '요청한 리소스를 찾을 수 없습니다.';
    case AdminErrorType.DATABASE:
        return '데이터베이스 처리 중 오류가 발생했습니다.';
    case AdminErrorType.EXTERNAL_SERVICE:
        return '외부 서비스 연동 중 오류가 발생했습니다.';
    case AdminErrorType.SYSTEM:
    default:
        return '시스템 오류가 발생했습니다. 관리자에게 문의해주세요.';
    }
}

/**
 * 에러 로깅
 */
function logAdminError(error, req, errorType, severity) {
    const logData = {
        errorType,
        severity,
        message: error.message,
        stack: error.stack,
        url: req.originalUrl,
        method: req.method,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        user: req.user
            ? {
                id: req.user.id,
                username: req.user.username,
                role: req.user.role
            }
            : null,
        timestamp: new Date().toISOString()
    };

    // 심각도에 따른 로그 레벨 결정
    switch (severity) {
    case AdminErrorSeverity.LOW:
        logger.warn('Admin 도메인 경고', logData);
        break;
    case AdminErrorSeverity.MEDIUM:
        logger.error('Admin 도메인 에러', logData);
        break;
    case AdminErrorSeverity.HIGH:
        logger.error('Admin 도메인 심각한 에러', logData);
        break;
    case AdminErrorSeverity.CRITICAL:
        logger.error('Admin 도메인 치명적 에러', logData);
        // 추가적인 알림 로직 (예: 슬랙, 이메일 등)
        break;
    }

    // 감사 로그 기록 (높은 심각도의 경우)
    if (severity === AdminErrorSeverity.HIGH || severity === AdminErrorSeverity.CRITICAL) {
        // 감사 로그는 별도로 기록
        logger.audit('Admin 에러 발생', {
            type: AuditLogType.SYSTEM_ERROR,
            severity: AuditSeverity.HIGH,
            user: req.user,
            action: 'ERROR_OCCURRED',
            resource: req.originalUrl,
            details: {
                errorType,
                message: error.message,
                userAgent: req.get('User-Agent'),
                ip: req.ip
            }
        });
    }
}

/**
 * Admin 에러 처리 미들웨어
 */
export function adminErrorHandler(error, req, res, _next) {
    // 에러 타입 및 심각도 분석
    const errorType = detectErrorType(error);
    const severity = determineErrorSeverity(errorType, error);
    const userMessage = createUserFriendlyMessage(errorType, error);

    // 에러 로깅
    logAdminError(error, req, errorType, severity);

    // 응답 처리
    if (req.xhr || req.headers.accept?.includes('application/json')) {
        // AJAX 요청인 경우 JSON 응답
        const statusCode = getStatusCodeForErrorType(errorType);
        return res.status(statusCode).json({
            success: false,
            error: userMessage,
            errorType,
            timestamp: new Date().toISOString()
        });
    } else {
        // 일반 페이지 요청인 경우
        req.flash('error', userMessage);

        // 적절한 리다이렉트 경로 결정
        const redirectPath = determineRedirectPath(req, errorType);
        return res.redirect(redirectPath);
    }
}

/**
 * 에러 타입에 따른 HTTP 상태 코드 결정
 */
function getStatusCodeForErrorType(errorType) {
    switch (errorType) {
    case AdminErrorType.VALIDATION:
        return 400;
    case AdminErrorType.AUTHORIZATION:
        return 403;
    case AdminErrorType.NOT_FOUND:
        return 404;
    case AdminErrorType.DATABASE:
    case AdminErrorType.EXTERNAL_SERVICE:
    case AdminErrorType.SYSTEM:
    default:
        return 500;
    }
}

/**
 * 에러 타입에 따른 리다이렉트 경로 결정
 */
function determineRedirectPath(req, errorType) {
    const originalUrl = req.originalUrl;

    // 특정 관리 페이지에서 발생한 에러의 경우
    if (originalUrl.includes('/admin/management/user')) {
        return '/admin/management/user';
    }
    if (originalUrl.includes('/admin/management/artwork')) {
        return '/admin/management/artwork';
    }
    if (originalUrl.includes('/admin/management/exhibition')) {
        return '/admin/management/exhibition';
    }
    if (originalUrl.includes('/admin/batch')) {
        return '/admin/batch';
    }

    // 권한 에러의 경우 대시보드로
    if (errorType === AdminErrorType.AUTHORIZATION) {
        return '/admin';
    }

    // 기본적으로 관리자 대시보드로
    return '/admin';
}

/**
 * 404 에러 처리 미들웨어 (Admin 전용)
 */
export function adminNotFoundHandler(req, res, next) {
    // Admin 경로가 아닌 경우 다음 미들웨어로
    if (!req.originalUrl.startsWith('/admin')) {
        return next();
    }

    logger.warn('Admin 페이지 404 에러', {
        url: req.originalUrl,
        method: req.method,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        user: req.user
            ? {
                id: req.user.id,
                username: req.user.username
            }
            : null
    });

    req.flash('error', '요청한 페이지를 찾을 수 없습니다.');
    return res.redirect('/admin');
}

/**
 * 비동기 에러 캐처 래퍼
 */
export function asyncErrorCatcher(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

export default {
    adminErrorHandler,
    adminNotFoundHandler,
    asyncErrorCatcher,
    AdminErrorType,
    AdminErrorSeverity
};
