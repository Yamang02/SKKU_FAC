/**
 * 이미지 관련 에러의 기본 클래스
 */
export class ImageError extends Error {
    constructor(message, code = 'IMAGE_ERROR') {
        super(message);
        this.name = 'ImageError';
        this.code = code;
    }
}

/**
 * 이미지 업로드 실패 에러
 */
export class ImageUploadError extends ImageError {
    constructor(message = '이미지 업로드에 실패했습니다.') {
        super(message, 'IMAGE_UPLOAD_ERROR');
        this.name = 'ImageUploadError';
    }
}

/**
 * 이미지 삭제 실패 에러
 */
export class ImageDeleteError extends ImageError {
    constructor(message = '이미지 삭제에 실패했습니다.') {
        super(message, 'IMAGE_DELETE_ERROR');
        this.name = 'ImageDeleteError';
    }
}

/**
 * 이미지 검증 실패 에러
 */
export class ImageValidationError extends ImageError {
    constructor(message = '이미지 검증에 실패했습니다.') {
        super(message, 'IMAGE_VALIDATION_ERROR');
        this.name = 'ImageValidationError';
    }
}

/**
 * 이미지 최적화 실패 에러
 */
export class ImageOptimizationError extends ImageError {
    constructor(message = '이미지 최적화에 실패했습니다.') {
        super(message, 'IMAGE_OPTIMIZATION_ERROR');
        this.name = 'ImageOptimizationError';
    }
}

/**
 * 이미지 저장소 접근 에러
 */
export class ImageStorageError extends ImageError {
    constructor(message = '이미지 저장소 접근에 실패했습니다.') {
        super(message, 'IMAGE_STORAGE_ERROR');
        this.name = 'ImageStorageError';
    }
}

/**
 * 이미지 메타데이터 저장 실패 에러
 */
export class ImageMetadataError extends ImageError {
    constructor(message = '이미지 메타데이터 저장에 실패했습니다.') {
        super(message, 'IMAGE_METADATA_ERROR');
        this.name = 'ImageMetadataError';
    }
}

/**
 * 이미지 찾을 수 없음 에러
 */
export class ImageNotFoundError extends ImageError {
    constructor(message = '이미지를 찾을 수 없습니다.') {
        super(message, 'IMAGE_NOT_FOUND_ERROR');
        this.name = 'ImageNotFoundError';
    }
}

/**
 * 이미지 트랜잭션 관련 에러
 */
export class ImageTransactionError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ImageTransactionError';
        this.status = 500;
    }
}
