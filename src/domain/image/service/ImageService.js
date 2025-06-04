import { ImageError } from '../../../common/error/ImageError.js';
import { deleteCloudinaryImage } from '../../../infrastructure/cloudinary/provider/cloudinaryStorageFactory.js';
import logger from '../../../common/utils/Logger.js';

/**
 * 이미지 서비스
 * 이미지 업로드, 삭제, 조회 등의 비즈니스 로직을 담당합니다.
 */
class ImageService {
    constructor() {}

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
            imageUrl: file.path, // 업로드된 이미지의 URL
            publicId: file.filename // Cloudinary에서의 고유 식별자
        };
    }

    /**
     * Cloudinary 이미지 삭제
     * @param {string} publicId - Cloudinary에 저장된 이미지의 public_id
     * @returns {Promise<boolean>} 삭제 성공 여부
     */
    async deleteImage(publicId) {
        try {
            logger.info('이미지 삭제 시작', { publicId });

            // 타임아웃 설정 (10초)
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Cloudinary 이미지 삭제 타임아웃')), 10000);
            });

            // 인프라 레이어의 삭제 함수 사용 (타임아웃과 경쟁)
            const result = await Promise.race([deleteCloudinaryImage(publicId), timeoutPromise]);

            logger.info('이미지 삭제 결과', { publicId, result });

            if (result.result !== 'ok') {
                logger.warn(`Cloudinary 이미지 삭제 실패: ${result.result}`, { publicId, result: result.result });
            }

            return true;
        } catch (error) {
            logger.error('Cloudinary 이미지 삭제 중 에러', error, { publicId });
            // 타임아웃이나 기타 에러가 발생해도 true 반환 (삭제 프로세스 중단 방지)
            return true;
        }
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
