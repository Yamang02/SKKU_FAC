/**
 * 애플리케이션 기본 에러 클래스
 */
class ApplicationError extends Error {
    constructor(message, status = 500, viewData = {}) {
        super(message);
        this.name = this.constructor.name;
        this.status = status;
        this.viewData = viewData;
    }
}

/**
 * 유효성 검사 에러
 */
export class ValidationError extends ApplicationError {
    constructor(message, viewData = {}) {
        super(message, 400, viewData);
    }
}

/**
 * 인증 에러
 */
export class AuthenticationError extends ApplicationError {
    constructor(message, viewData = {}) {
        super(message, 401, viewData);
    }
}

/**
 * 권한 에러
 */
export class AuthorizationError extends ApplicationError {
    constructor(message, viewData = {}) {
        super(message, 403, viewData);
    }
}

/**
 * 리소스를 찾을 수 없음 에러
 */
export class NotFoundError extends ApplicationError {
    constructor(message, viewData = {}) {
        super(message, 404, viewData);
    }
}

export default ApplicationError;
