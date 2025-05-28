/**
 * 에러 심각도 레벨 정의
 */
export const ErrorSeverity = {
    LOW: 'low',        // 일반적인 비즈니스 로직 에러 (404, 400 등)
    MEDIUM: 'medium',  // 권한, 인증 에러 (401, 403 등)
    HIGH: 'high',      // 서버 내부 에러 (500, 503 등)
    CRITICAL: 'critical' // 시스템 치명적 에러
};

/**
 * 에러 카테고리 정의
 */
export const ErrorCategory = {
    CLIENT: 'client',     // 클라이언트 요청 오류 (4xx)
    SERVER: 'server',     // 서버 내부 오류 (5xx)
    BUSINESS: 'business', // 비즈니스 로직 오류
    SYSTEM: 'system'      // 시스템 오류
};

/**
 * 모든 에러의 기본 클래스
 * 표준화된 에러 정보와 HTTP 상태 코드 매핑을 제공
 */
export class BaseError extends Error {
    /**
     * @param {string} message - 사용자에게 표시될 에러 메시지
     * @param {string} code - 내부 에러 코드
     * @param {number} statusCode - HTTP 상태 코드
     * @param {string} severity - 에러 심각도 (ErrorSeverity 사용)
     * @param {string} category - 에러 카테고리 (ErrorCategory 사용)
     * @param {any} details - 추가 에러 상세 정보
     */
    constructor(
        message,
        code = 'UNKNOWN_ERROR',
        statusCode = 500,
        severity = ErrorSeverity.MEDIUM,
        category = ErrorCategory.SERVER,
        details = null
    ) {
        super(message);

        this.name = this.constructor.name;
        this.code = code;
        this.statusCode = statusCode;
        this.severity = severity;
        this.category = category;
        this.details = details;
        this.timestamp = new Date().toISOString();

        // Stack trace 캡처
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    /**
     * 에러를 JSON 형태로 직렬화
     * @param {boolean} includeStack - 스택 트레이스 포함 여부
     * @returns {object} 직렬화된 에러 정보
     */
    toJSON(includeStack = false) {
        const result = {
            name: this.name,
            message: this.message,
            code: this.code,
            statusCode: this.statusCode,
            severity: this.severity,
            category: this.category,
            timestamp: this.timestamp
        };

        if (this.details) {
            result.details = this.details;
        }

        if (includeStack) {
            result.stack = this.stack;
        }

        return result;
    }

    /**
     * 클라이언트에게 안전하게 전송할 수 있는 에러 정보만 반환
     * @returns {object} 클라이언트용 에러 정보
     */
    toClientJSON() {
        return {
            message: this.message,
            code: this.code,
            timestamp: this.timestamp
        };
    }

    /**
     * 에러가 클라이언트 에러인지 확인
     * @returns {boolean}
     */
    isClientError() {
        return this.statusCode >= 400 && this.statusCode < 500;
    }

    /**
     * 에러가 서버 에러인지 확인
     * @returns {boolean}
     */
    isServerError() {
        return this.statusCode >= 500;
    }

    /**
     * 에러가 중요한 수준인지 확인 (HIGH, CRITICAL)
     * @returns {boolean}
     */
    isCritical() {
        return this.severity === ErrorSeverity.HIGH || this.severity === ErrorSeverity.CRITICAL;
    }
}

/**
 * HTTP 상태 코드별 기본 에러 클래스들
 */

/**
 * 400 Bad Request
 */
export class BadRequestError extends BaseError {
    constructor(message = '잘못된 요청입니다.', code = 'BAD_REQUEST', details = null) {
        super(message, code, 400, ErrorSeverity.LOW, ErrorCategory.CLIENT, details);
    }
}

/**
 * 401 Unauthorized
 */
export class UnauthorizedError extends BaseError {
    constructor(message = '인증이 필요합니다.', code = 'UNAUTHORIZED', details = null) {
        super(message, code, 401, ErrorSeverity.MEDIUM, ErrorCategory.CLIENT, details);
    }
}

/**
 * 403 Forbidden
 */
export class ForbiddenError extends BaseError {
    constructor(message = '접근 권한이 없습니다.', code = 'FORBIDDEN', details = null) {
        super(message, code, 403, ErrorSeverity.MEDIUM, ErrorCategory.CLIENT, details);
    }
}

/**
 * 404 Not Found
 */
export class NotFoundError extends BaseError {
    constructor(message = '요청한 리소스를 찾을 수 없습니다.', code = 'NOT_FOUND', details = null) {
        super(message, code, 404, ErrorSeverity.LOW, ErrorCategory.CLIENT, details);
    }
}

/**
 * 409 Conflict
 */
export class ConflictError extends BaseError {
    constructor(message = '요청이 충돌되었습니다.', code = 'CONFLICT', details = null) {
        super(message, code, 409, ErrorSeverity.LOW, ErrorCategory.CLIENT, details);
    }
}

/**
 * 422 Unprocessable Entity
 */
export class ValidationError extends BaseError {
    constructor(message = '입력 데이터가 유효하지 않습니다.', code = 'VALIDATION_ERROR', details = null) {
        super(message, code, 422, ErrorSeverity.LOW, ErrorCategory.CLIENT, details);
    }
}

/**
 * 500 Internal Server Error
 */
export class InternalServerError extends BaseError {
    constructor(message = '서버 내부 오류가 발생했습니다.', code = 'INTERNAL_SERVER_ERROR', details = null) {
        super(message, code, 500, ErrorSeverity.HIGH, ErrorCategory.SERVER, details);
    }
}

/**
 * 503 Service Unavailable
 */
export class ServiceUnavailableError extends BaseError {
    constructor(message = '서비스를 사용할 수 없습니다.', code = 'SERVICE_UNAVAILABLE', details = null) {
        super(message, code, 503, ErrorSeverity.HIGH, ErrorCategory.SERVER, details);
    }
}

/**
 * 기존 에러 클래스에서 BaseError로의 매핑 정보
 */
export const ErrorMapping = new Map([
    // User 에러들
    ['UserNotFoundError', { statusCode: 404, severity: ErrorSeverity.LOW, category: ErrorCategory.CLIENT }],
    ['UserValidationError', { statusCode: 422, severity: ErrorSeverity.LOW, category: ErrorCategory.CLIENT }],
    ['UserAuthError', { statusCode: 401, severity: ErrorSeverity.MEDIUM, category: ErrorCategory.CLIENT }],
    ['UserEmailDuplicateError', { statusCode: 409, severity: ErrorSeverity.LOW, category: ErrorCategory.CLIENT }],
    ['UserUsernameDuplicateError', { statusCode: 409, severity: ErrorSeverity.LOW, category: ErrorCategory.CLIENT }],
    ['UserInactiveError', { statusCode: 403, severity: ErrorSeverity.MEDIUM, category: ErrorCategory.CLIENT }],
    ['UserBlockedError', { statusCode: 403, severity: ErrorSeverity.MEDIUM, category: ErrorCategory.CLIENT }],
    ['UserUnverifiedError', { statusCode: 403, severity: ErrorSeverity.MEDIUM, category: ErrorCategory.CLIENT }],

    // Artwork 에러들
    ['ArtworkNotFoundError', { statusCode: 404, severity: ErrorSeverity.LOW, category: ErrorCategory.CLIENT }],
    ['ArtworkValidationError', { statusCode: 422, severity: ErrorSeverity.LOW, category: ErrorCategory.CLIENT }],
    ['ArtworkPermissionError', { statusCode: 403, severity: ErrorSeverity.MEDIUM, category: ErrorCategory.CLIENT }],

    // Exhibition 에러들
    ['ExhibitionNotFoundError', { statusCode: 404, severity: ErrorSeverity.LOW, category: ErrorCategory.CLIENT }],
    ['ExhibitionValidationError', { statusCode: 422, severity: ErrorSeverity.LOW, category: ErrorCategory.CLIENT }],

    // Notice 에러들
    ['NoticeNotFoundError', { statusCode: 404, severity: ErrorSeverity.LOW, category: ErrorCategory.CLIENT }],
    ['NoticeValidationError', { statusCode: 422, severity: ErrorSeverity.LOW, category: ErrorCategory.CLIENT }],
    ['NoticePermissionError', { statusCode: 403, severity: ErrorSeverity.MEDIUM, category: ErrorCategory.CLIENT }],

    // Image 에러들
    ['ImageUploadError', { statusCode: 422, severity: ErrorSeverity.MEDIUM, category: ErrorCategory.SERVER }],
    ['ImageDeleteError', { statusCode: 500, severity: ErrorSeverity.MEDIUM, category: ErrorCategory.SERVER }],
    ['ImageValidationError', { statusCode: 422, severity: ErrorSeverity.LOW, category: ErrorCategory.CLIENT }],
    ['ImageOptimizationError', { statusCode: 500, severity: ErrorSeverity.MEDIUM, category: ErrorCategory.SERVER }],
    ['ImageStorageError', { statusCode: 503, severity: ErrorSeverity.HIGH, category: ErrorCategory.SERVER }],
    ['ImageMetadataError', { statusCode: 500, severity: ErrorSeverity.MEDIUM, category: ErrorCategory.SERVER }],
    ['ImageNotFoundError', { statusCode: 404, severity: ErrorSeverity.LOW, category: ErrorCategory.CLIENT }],
    ['ImageTransactionError', { statusCode: 500, severity: ErrorSeverity.HIGH, category: ErrorCategory.SERVER }],

    // 기본 HTTP 에러들
    ['Error', { statusCode: 500, severity: ErrorSeverity.HIGH, category: ErrorCategory.SERVER }]
]);

/**
 * 에러 객체에서 HTTP 상태 코드를 추출
 * @param {Error} error - 에러 객체
 * @returns {number} HTTP 상태 코드
 */
export function getErrorStatusCode(error) {
    // BaseError를 상속한 경우
    if (error instanceof BaseError) {
        return error.statusCode;
    }

    // 기존 에러에 status 속성이 있는 경우
    if (error.status && typeof error.status === 'number') {
        return error.status;
    }

    // ErrorMapping에서 찾기
    const mapping = ErrorMapping.get(error.constructor.name);
    if (mapping) {
        return mapping.statusCode;
    }

    // 기본값
    return 500;
}

/**
 * 에러 객체에서 심각도를 추출
 * @param {Error} error - 에러 객체
 * @returns {string} 에러 심각도
 */
export function getErrorSeverity(error) {
    if (error instanceof BaseError) {
        return error.severity;
    }

    const mapping = ErrorMapping.get(error.constructor.name);
    if (mapping) {
        return mapping.severity;
    }

    return ErrorSeverity.MEDIUM;
}

/**
 * 에러 객체에서 카테고리를 추출
 * @param {Error} error - 에러 객체
 * @returns {string} 에러 카테고리
 */
export function getErrorCategory(error) {
    if (error instanceof BaseError) {
        return error.category;
    }

    const mapping = ErrorMapping.get(error.constructor.name);
    if (mapping) {
        return mapping.category;
    }

    return ErrorCategory.SERVER;
}
