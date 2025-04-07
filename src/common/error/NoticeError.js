/**
 * 공지사항 관련 에러 클래스들
 */

export class NoticeError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class NoticeNotFoundError extends NoticeError {
    constructor(message = '공지사항을 찾을 수 없습니다.') {
        super(message);
    }
}

export class NoticeValidationError extends NoticeError {
    constructor(message = '공지사항 데이터가 유효하지 않습니다.') {
        super(message);
    }
}

export class NoticePermissionError extends NoticeError {
    constructor(message = '공지사항에 대한 권한이 없습니다.') {
        super(message);
    }
}
