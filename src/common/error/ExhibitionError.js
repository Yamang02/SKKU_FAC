/**
 * 전시회 관련 에러 클래스
 */
export class ExhibitionError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ExhibitionError';
    }
}

export class ExhibitionNotFoundError extends ExhibitionError {
    constructor(message) {
        super(message);
        this.name = 'ExhibitionNotFoundError';
    }
}

export class ExhibitionValidationError extends ExhibitionError {
    constructor(message) {
        super(message);
        this.name = 'ExhibitionValidationError';
    }
}

