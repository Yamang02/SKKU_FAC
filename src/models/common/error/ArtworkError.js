/**
 * 작품 관련 에러를 처리하는 커스텀 에러 클래스
 */
export class ArtworkError extends Error {
    constructor(message, code = 'ARTWORK_ERROR', status = 500) {
        super(message);
        this.name = 'ArtworkError';
        this.code = code;
        this.status = status;
    }
}

export class ArtworkNotFoundError extends ArtworkError {
    constructor(message = '작품을 찾을 수 없습니다.') {
        super(message, 'ARTWORK_NOT_FOUND', 404);
        this.name = 'ArtworkNotFoundError';
    }
}

export class ArtworkValidationError extends ArtworkError {
    constructor(message = '작품 데이터가 유효하지 않습니다.') {
        super(message, 'ARTWORK_VALIDATION_ERROR', 400);
        this.name = 'ArtworkValidationError';
    }
}

export class ArtworkPermissionError extends ArtworkError {
    constructor(message = '작품에 대한 권한이 없습니다.') {
        super(message, 'ARTWORK_PERMISSION_ERROR', 403);
        this.name = 'ArtworkPermissionError';
    }
}

export class ArtworkUploadError extends ArtworkError {
    constructor(message = '작품 업로드 중 오류가 발생했습니다.') {
        super(message, 'ARTWORK_UPLOAD_ERROR', 500);
        this.name = 'ArtworkUploadError';
    }
}
