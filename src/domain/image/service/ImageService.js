import FileServerService from './FileServerService.js';
import { ImageError } from '../../../common/error/ImageError.js';
import cloudinary from 'cloudinary';
/**
 * 이미지 서비스
 * 이미지 업로드, 삭제, 조회 등의 비즈니스 로직을 담당합니다.
 */
class ImageService {
    constructor() {
        this.fileServerService = new FileServerService();
    }

    /**
     * 업로드된 파일 정보를 추출합니다.
     * @param {Object} file - 업로드된 파일 정보
     * @returns {Promise<Object>} 저장된 이미지 정보
     */
    async getUploadedImageInfo(file) {
        if (!file || !file.path || !file.filename) {
            throw new Error('유효하지 않은 파일 업로드 정보입니다.');
        }

        return {
            imageUrl: file.path,          // 업로드된 이미지의 URL
            publicId: file.filename       // Cloudinary에서의 고유 식별자
        };
    }

    /**
     * Cloudinary 이미지 삭제
     * @param {string} publicId - Cloudinary에 저장된 이미지의 public_id
     * @returns {Promise<void>}
     */
    async deleteImage(publicId) {
        try {
            ('publicId', publicId);
            ('imageService deleteImage');
            const result = await cloudinary.uploader.destroy(publicId);
            if (result.result !== 'ok') {
                console.warn(`Cloudinary 이미지 삭제 실패: ${result.result}`);
            }
        } catch (error) {
            console.error('Cloudinary 이미지 삭제 중 에러:', error);
            // 실패하더라도 전체 트랜잭션에 영향 주지 않도록 처리
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
