import FileServerService from './FileServerService.js';
import { ImageError } from '../../../common/error/ImageError.js';

/**
 * 이미지 서비스
 * 이미지 업로드, 삭제, 조회 등의 비즈니스 로직을 담당합니다.
 */
class ImageService {
    constructor() {
        this.fileServerService = new FileServerService();
    }

    /**
     * 이미지를 업로드합니다.
     * @param {Object} file - 업로드된 파일 정보
     * @returns {Promise<Object>} 저장된 이미지 정보
     */
    async uploadImage(file) {
        if (!file || !file.path || !file.filename) {
            throw new Error('유효하지 않은 파일 업로드 정보입니다.');
        }

        return {
            imageUrl: file.path,          // 업로드된 이미지의 URL
            publicId: file.filename       // Cloudinary에서의 고유 식별자
        };
    }

    /**
     * 파일 확장자로부터 MIME 타입을 반환합니다.
     * @param {string} filename - 파일명
     * @returns {string} MIME 타입
     */
    getMimeType(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const mimeTypes = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif'
        };
        return mimeTypes[ext] || 'application/octet-stream';
    }

    /**
     * 이미지를 삭제합니다.
     * @param {string|number} imageId - 이미지 ID
     * @returns {Promise<boolean>} 삭제 성공 여부
     */
    async deleteImage(imageId) {
        const image = await this.imageRepository.findById(imageId);
        if (!image) {
            throw new ImageError('이미지를 찾을 수 없습니다.');
        }

        // 1. 파일 서버에서 삭제
        const deleteResult = await this.fileServerService.deleteFile(image.filePath);
        if (!deleteResult) {
            throw new ImageError('파일 서버에서 이미지 삭제에 실패했습니다.');
        }

        // 2. 메타데이터 삭제
        const deleteMetadataResult = await this.imageRepository.delete(imageId);
        if (!deleteMetadataResult) {
            throw new ImageError('이미지 메타데이터 삭제에 실패했습니다.');
        }

        return true;
    }

    /**
     * 이미지를 조회합니다.
     * @param {string|number} imageId - 이미지 ID
     * @returns {Promise<Image>} 이미지 정보
     */
    async getImage(imageId) {
        const image = await this.imageRepository.findImageById(imageId);
        if (!image) {
            throw new ImageError('이미지를 찾을 수 없습니다.');
        }
        return image;
    }
}

export default ImageService;
