/**
 * 사용자 관련 에러 클래스
 */
export class UserNotFoundError extends Error {
    constructor(message = '사용자를 찾을 수 없습니다.') {
        super(message);
        this.name = 'UserNotFoundError';
        this.code = 'USER_NOT_FOUND';
    }
}

export class UserValidationError extends Error {
    constructor(message = '사용자 정보가 유효하지 않습니다.') {
        super(message);
        this.name = 'UserValidationError';
        this.code = 'USER_VALIDATION_ERROR';
    }
}

export class UserDuplicateError extends Error {
    constructor(message = '이미 존재하는 사용자입니다.') {
        super(message);
        this.name = 'UserDuplicateError';
        this.code = 'USER_DUPLICATE';
    }
}

export class UserAuthError extends Error {
    constructor(message = '인증에 실패했습니다.') {
        super(message);
        this.name = 'UserAuthError';
        this.code = 'USER_AUTH_ERROR';
    }
}
