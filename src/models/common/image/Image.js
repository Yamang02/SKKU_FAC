/**
 * 이미지 모델
 * 이미지 파일의 기본 정보를 담는 모델입니다.
 */
export default class Image {
    constructor(data = {}) {
        this.id = data.id || null;
        this.originalName = data.originalName || '';
        this.storedName = data.storedName || '';
        this.filePath = data.filePath || '';
        this.fileSize = data.fileSize || 0;
        this.mimeType = data.mimeType || '';
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
    }

    /**
     * 이미지 모델을 JSON 형태로 변환합니다.
     */
    toJSON() {
        return {
            id: this.id,
            originalName: this.originalName,
            storedName: this.storedName,
            filePath: this.filePath,
            fileSize: this.fileSize,
            mimeType: this.mimeType,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    /**
     * 이미지 모델을 생성합니다.
     */
    static create(data) {
        return new Image(data);
    }
}
