/**
 * 작품 데이터 유효성 검사 예외
 */
export class ArtworkValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ArtworkValidationError';
        this.status = 400;
    }
}
