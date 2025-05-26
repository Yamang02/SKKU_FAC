import { Message } from '../constants/Message.js';

/**
 * 사용자 관련 에러 클래스
 */
export class UserNotFoundError extends Error {
    constructor(message = Message.USER.NOT_FOUND) {
        super(message);
        this.name = 'UserNotFoundError';
        this.code = 'USER_NOT_FOUND';
    }
}

export class UserValidationError extends Error {
    constructor(message = Message.USER.VALIDATION_ERROR) {
        super(message);
        this.name = 'UserValidationError';
        this.code = 'USER_VALIDATION_ERROR';
    }
}

export class UserAuthError extends Error {
    constructor(message = Message.USER.AUTH_ERROR) {
        super(message);
        this.name = 'UserAuthError';
        this.code = 'USER_AUTH_ERROR';
    }
}

export class UserEmailDuplicateError extends Error {
    constructor(message = Message.USER.EMAIL_DUPLICATE) {
        super(message);
        this.name = 'UserEmailDuplicateError';
        this.code = 'USER_EMAIL_DUPLICATE';
    }
}

export class UserUsernameDuplicateError extends Error {
    constructor(message = Message.USER.USERNAME_DUPLICATE) {
        super(message);
        this.name = 'UserUsernameDuplicateError';
        this.code = 'USER_USERNAME_DUPLICATE';
    }
}

export class UserInactiveError extends Error {
    constructor(message = Message.USER.INACTIVE_ERROR) {
        super(message);
        this.name = 'UserInactiveError';
        this.code = 'USER_INACTIVE_ERROR';
    }
}

export class UserBlockedError extends Error {
    constructor(message = Message.USER.BLOCKED_ERROR) {
        super(message);
        this.name = 'UserBlockedError';
        this.code = 'USER_BLOCKED_ERROR';
    }
}

export class UserUnverifiedError extends Error {
    constructor(message = Message.USER.UNVERIFIED_ERROR) {
        super(message);
        this.name = 'UserUnverifiedError';
        this.code = 'USER_UNVERIFIED_ERROR';
    }
}


