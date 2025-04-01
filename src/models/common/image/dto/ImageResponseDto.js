/**
 * 이미지 응답 데이터를 위한 DTO
 */
export default class ImageResponseDto {
    constructor(image) {
        this.id = image.id;
        this.originalName = image.originalName;
        this.storedName = image.storedName;
        this.filePath = image.filePath;
        this.fileSize = image.fileSize;
        this.mimeType = image.mimeType;
        this.width = image.width;
        this.height = image.height;
        this.domain = image.domain;
        this.createdAt = image.createdAt;
        this.updatedAt = image.updatedAt;
    }

    toJSON() {
        return {
            id: this.id,
            originalName: this.originalName,
            storedName: this.storedName,
            filePath: this.filePath,
            fileSize: this.fileSize,
            mimeType: this.mimeType,
            width: this.width,
            height: this.height,
            domain: this.domain,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}
