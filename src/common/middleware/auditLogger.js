import logger from '../utils/Logger.js';

/**
 * 감사 로깅 미들웨어
 * 관리자 작업에 대한 포괄적인 감사 추적을 제공합니다.
 */

/**
 * 감사 로그 타입 정의
 */
export const AuditLogType = {
    // 사용자 관리
    USER_CREATE: 'USER_CREATE',
    USER_UPDATE: 'USER_UPDATE',
    USER_DELETE: 'USER_DELETE',
    USER_ACTIVATE: 'USER_ACTIVATE',
    USER_DEACTIVATE: 'USER_DEACTIVATE',
    USER_PASSWORD_RESET: 'USER_PASSWORD_RESET',
    USER_VIEW: 'USER_VIEW',

    // 컨텐츠 관리
    ARTWORK_CREATE: 'ARTWORK_CREATE',
    ARTWORK_UPDATE: 'ARTWORK_UPDATE',
    ARTWORK_DELETE: 'ARTWORK_DELETE',
    ARTWORK_FEATURE: 'ARTWORK_FEATURE',
    ARTWORK_MODERATE: 'ARTWORK_MODERATE',
    ARTWORK_VIEW: 'ARTWORK_VIEW',

    EXHIBITION_CREATE: 'EXHIBITION_CREATE',
    EXHIBITION_UPDATE: 'EXHIBITION_UPDATE',
    EXHIBITION_DELETE: 'EXHIBITION_DELETE',
    EXHIBITION_FEATURE: 'EXHIBITION_FEATURE',
    EXHIBITION_MODERATE: 'EXHIBITION_MODERATE',
    EXHIBITION_VIEW: 'EXHIBITION_VIEW',

    // 시스템 관리
    ADMIN_LOGIN: 'ADMIN_LOGIN',
    ADMIN_LOGOUT: 'ADMIN_LOGOUT',
    ADMIN_ACCESS: 'ADMIN_ACCESS',
    SYSTEM_CONFIG_CHANGE: 'SYSTEM_CONFIG_CHANGE',
    BULK_OPERATION: 'BULK_OPERATION',

    // 권한 관리
    PERMISSION_GRANT: 'PERMISSION_GRANT',
    PERMISSION_REVOKE: 'PERMISSION_REVOKE',
    ROLE_CHANGE: 'ROLE_CHANGE',

    // 보안 이벤트
    UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
    PERMISSION_DENIED: 'PERMISSION_DENIED',
    SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY'
};

/**
 * 감사 로그 심각도 레벨
 */
export const AuditSeverity = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL'
};

/**
 * 감사 로그 결과 상태
 */
export const AuditResult = {
    SUCCESS: 'SUCCESS',
    FAILURE: 'FAILURE',
    PARTIAL: 'PARTIAL',
    BLOCKED: 'BLOCKED'
};

/**
 * 감사 로그 생성 클래스
 */
class AuditLogger {
    constructor() {
        this.sessionStore = new Map(); // 세션별 활동 추적
        this.suspiciousActivityThreshold = 10; // 의심스러운 활동 임계값
        this.rateLimitWindow = 60000; // 1분
    }

    /**
     * 감사 로그 기록
     * @param {Object} auditData - 감사 로그 데이터
     */
    log(auditData) {
        const {
            type,
            severity = AuditSeverity.MEDIUM,
            result = AuditResult.SUCCESS,
            user,
            resource,
            action,
            details = {},
            request,
            response,
            metadata = {}
        } = auditData;

        const auditEntry = {
            // 기본 정보
            timestamp: new Date().toISOString(),
            auditId: this.generateAuditId(),
            type,
            severity,
            result,

            // 사용자 정보
            user: this.sanitizeUserInfo(user),

            // 액션 정보
            action: {
                operation: action,
                resource: resource || 'unknown',
                endpoint: request?.originalUrl,
                method: request?.method,
                userAgent: request?.get('User-Agent'),
                ip: this.getClientIP(request),
                sessionId: request?.sessionID
            },

            // 요청/응답 정보
            request: this.sanitizeRequestData(request),
            response: this.sanitizeResponseData(response),

            // 상세 정보
            details: {
                ...details,
                duration: metadata.duration,
                affectedRecords: metadata.affectedRecords,
                previousValues: metadata.previousValues,
                newValues: metadata.newValues
            },

            // 컨텍스트 정보
            context: {
                environment: process.env.NODE_ENV,
                serverInstance: process.env.HOSTNAME || 'unknown',
                correlationId: request?.correlationId || this.generateCorrelationId()
            }
        };

        // 심각도에 따른 로깅 레벨 결정
        const logLevel = this.getLogLevel(severity);

        // Winston 로거로 기록
        logger[logLevel]('AUDIT_LOG', auditEntry);

        // 의심스러운 활동 감지
        this.detectSuspiciousActivity(auditEntry);

        // 실시간 알림이 필요한 경우
        if (severity === AuditSeverity.CRITICAL) {
            this.sendCriticalAlert(auditEntry);
        }

        return auditEntry.auditId;
    }

    /**
     * 사용자 정보 정제
     */
    sanitizeUserInfo(user) {
        if (!user) return null;

        return {
            id: user.id,
            username: user.username,
            role: user.role,
            email: user.email ? this.maskEmail(user.email) : null,
            isActive: user.isActive,
            lastLoginAt: user.lastLoginAt
        };
    }

    /**
     * 요청 데이터 정제
     */
    sanitizeRequestData(request) {
        if (!request) return null;

        const sensitiveFields = ['password', 'token', 'authorization', 'cookie'];
        const body = { ...request.body };
        const query = { ...request.query };
        const headers = { ...request.headers };

        // 민감한 필드 제거
        sensitiveFields.forEach(field => {
            if (body[field]) body[field] = '[REDACTED]';
            if (query[field]) query[field] = '[REDACTED]';
            if (headers[field]) headers[field] = '[REDACTED]';
        });

        return {
            method: request.method,
            url: request.originalUrl,
            params: request.params,
            query: Object.keys(query).length > 0 ? query : null,
            body: Object.keys(body).length > 0 ? body : null,
            contentType: request.get('Content-Type'),
            contentLength: request.get('Content-Length')
        };
    }

    /**
     * 응답 데이터 정제
     */
    sanitizeResponseData(response) {
        if (!response) return null;

        return {
            statusCode: response.statusCode,
            statusMessage: response.statusMessage,
            contentType: response.get('Content-Type'),
            contentLength: response.get('Content-Length')
        };
    }

    /**
     * 클라이언트 IP 주소 추출
     */
    getClientIP(request) {
        if (!request) return null;

        return request.ip ||
            request.connection?.remoteAddress ||
            request.socket?.remoteAddress ||
            (request.connection?.socket ? request.connection.socket.remoteAddress : null);
    }

    /**
     * 이메일 마스킹
     */
    maskEmail(email) {
        const [local, domain] = email.split('@');
        const maskedLocal = local.length > 2
            ? local.substring(0, 2) + '*'.repeat(local.length - 2)
            : local;
        return `${maskedLocal}@${domain}`;
    }

    /**
     * 심각도에 따른 로그 레벨 결정
     */
    getLogLevel(severity) {
        switch (severity) {
            case AuditSeverity.CRITICAL:
                return 'error';
            case AuditSeverity.HIGH:
                return 'warn';
            case AuditSeverity.MEDIUM:
                return 'info';
            case AuditSeverity.LOW:
            default:
                return 'debug';
        }
    }

    /**
     * 의심스러운 활동 감지
     */
    detectSuspiciousActivity(auditEntry) {
        const { user, action } = auditEntry;
        if (!user?.id) return;

        const sessionKey = `${user.id}_${action.sessionId}`;
        const now = Date.now();

        // 세션별 활동 추적
        if (!this.sessionStore.has(sessionKey)) {
            this.sessionStore.set(sessionKey, {
                activities: [],
                firstActivity: now,
                lastActivity: now
            });
        }

        const sessionData = this.sessionStore.get(sessionKey);
        sessionData.activities.push({
            timestamp: now,
            type: auditEntry.type,
            ip: action.ip
        });
        sessionData.lastActivity = now;

        // 최근 활동만 유지 (1분 윈도우)
        sessionData.activities = sessionData.activities.filter(
            activity => now - activity.timestamp < this.rateLimitWindow
        );

        // 의심스러운 패턴 감지
        const recentActivities = sessionData.activities.length;
        if (recentActivities > this.suspiciousActivityThreshold) {
            this.log({
                type: AuditLogType.SUSPICIOUS_ACTIVITY,
                severity: AuditSeverity.HIGH,
                user,
                action: 'RATE_LIMIT_EXCEEDED',
                details: {
                    activitiesInWindow: recentActivities,
                    threshold: this.suspiciousActivityThreshold,
                    windowMs: this.rateLimitWindow
                }
            });
        }

        // IP 변경 감지
        const uniqueIPs = new Set(sessionData.activities.map(a => a.ip));
        if (uniqueIPs.size > 3) {
            this.log({
                type: AuditLogType.SUSPICIOUS_ACTIVITY,
                severity: AuditSeverity.HIGH,
                user,
                action: 'MULTIPLE_IP_ACCESS',
                details: {
                    uniqueIPs: Array.from(uniqueIPs),
                    sessionDuration: now - sessionData.firstActivity
                }
            });
        }
    }

    /**
     * 중요 알림 전송
     */
    async sendCriticalAlert(auditEntry) {
        try {
            // 여기서 실시간 알림 시스템과 연동
            // 예: Slack, Discord, 이메일 등
            logger.error('CRITICAL_AUDIT_ALERT', {
                auditId: auditEntry.auditId,
                type: auditEntry.type,
                user: auditEntry.user,
                action: auditEntry.action,
                timestamp: auditEntry.timestamp
            });
        } catch (error) {
            logger.error('감사 로그 중요 알림 전송 실패', error);
        }
    }

    /**
     * 감사 ID 생성
     */
    generateAuditId() {
        return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 상관관계 ID 생성
     */
    generateCorrelationId() {
        return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 세션 정리 (메모리 누수 방지)
     */
    cleanupSessions() {
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000; // 24시간

        for (const [key, sessionData] of this.sessionStore.entries()) {
            if (now - sessionData.lastActivity > maxAge) {
                this.sessionStore.delete(key);
            }
        }
    }
}

// 싱글톤 인스턴스
const auditLogger = new AuditLogger();

// 주기적 세션 정리 (1시간마다)
setInterval(() => {
    auditLogger.cleanupSessions();
}, 60 * 60 * 1000);

/**
 * 감사 로깅 미들웨어 팩토리
 * @param {string} actionType - 액션 타입
 * @param {Object} options - 옵션
 * @returns {Function} Express 미들웨어
 */
export function createAuditMiddleware(actionType, options = {}) {
    const {
        severity = AuditSeverity.MEDIUM,
        captureRequest = true,
        captureResponse = false,
        extractResource = null,
        extractDetails = null
    } = options;

    return (req, res, next) => {
        const startTime = Date.now();

        // 응답 완료 시 감사 로그 기록
        const originalSend = res.send;
        res.send = function (data) {
            const endTime = Date.now();
            const duration = endTime - startTime;

            // 리소스 정보 추출
            let resource = 'unknown';
            if (extractResource && typeof extractResource === 'function') {
                try {
                    resource = extractResource(req, res);
                } catch (error) {
                    logger.warn('감사 로그 리소스 추출 실패', error);
                }
            } else if (req.params?.id) {
                resource = `${req.route?.path || req.path}/${req.params.id}`;
            } else {
                resource = req.route?.path || req.path;
            }

            // 상세 정보 추출
            let details = {};
            if (extractDetails && typeof extractDetails === 'function') {
                try {
                    details = extractDetails(req, res, data);
                } catch (error) {
                    logger.warn('감사 로그 상세 정보 추출 실패', error);
                }
            }

            // 결과 상태 결정
            let result = AuditResult.SUCCESS;
            if (res.statusCode >= 400) {
                result = res.statusCode >= 500 ? AuditResult.FAILURE : AuditResult.BLOCKED;
            }

            // 감사 로그 기록
            auditLogger.log({
                type: actionType,
                severity,
                result,
                user: req.user,
                resource,
                action: `${req.method} ${resource}`,
                details,
                request: captureRequest ? req : null,
                response: captureResponse ? res : null,
                metadata: { duration }
            });

            return originalSend.call(this, data);
        };

        next();
    };
}

/**
 * 관리자 액세스 감사 미들웨어
 */
export const auditAdminAccess = createAuditMiddleware(AuditLogType.ADMIN_ACCESS, {
    severity: AuditSeverity.MEDIUM,
    captureRequest: true,
    extractResource: (req) => `admin${req.path}`,
    extractDetails: (req) => ({
        adminRole: req.user?.role,
        accessedFeature: req.path.split('/')[2] || 'dashboard'
    })
});

/**
 * 사용자 관리 감사 미들웨어
 */
export const auditUserManagement = (actionType) => createAuditMiddleware(actionType, {
    severity: AuditSeverity.HIGH,
    captureRequest: true,
    extractResource: (req) => `user/${req.params?.id || 'bulk'}`,
    extractDetails: (req, _res, _data) => ({
        targetUserId: req.params?.id,
        changes: req.body,
        adminRole: req.user?.role
    })
});

/**
 * 컨텐츠 관리 감사 미들웨어
 */
export const auditContentManagement = (actionType) => createAuditMiddleware(actionType, {
    severity: AuditSeverity.MEDIUM,
    captureRequest: true,
    extractResource: (req) => {
        const resourceType = req.path.includes('artwork') ? 'artwork' : 'exhibition';
        return `${resourceType}/${req.params?.id || 'bulk'}`;
    },
    extractDetails: (req, _res, _data) => ({
        resourceId: req.params?.id,
        changes: req.body,
        adminRole: req.user?.role
    })
});

/**
 * 권한 거부 감사 로그
 */
export function logPermissionDenied(req, requiredPermissions) {
    auditLogger.log({
        type: AuditLogType.PERMISSION_DENIED,
        severity: AuditSeverity.HIGH,
        result: AuditResult.BLOCKED,
        user: req.user,
        resource: req.originalUrl,
        action: `${req.method} ${req.originalUrl}`,
        details: {
            requiredPermissions,
            userRole: req.user?.role,
            reason: 'Insufficient permissions'
        },
        request: req
    });
}

/**
 * 무권한 접근 감사 로그
 */
export function logUnauthorizedAccess(req) {
    auditLogger.log({
        type: AuditLogType.UNAUTHORIZED_ACCESS,
        severity: AuditSeverity.CRITICAL,
        result: AuditResult.BLOCKED,
        user: null,
        resource: req.originalUrl,
        action: `${req.method} ${req.originalUrl}`,
        details: {
            reason: 'No authentication provided',
            attemptedResource: req.originalUrl
        },
        request: req
    });
}

export { auditLogger, AuditLogger };
export default auditLogger;
