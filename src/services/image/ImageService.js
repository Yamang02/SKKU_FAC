import { ImageRepository } from '../../repositories/ImageRepository.js';
import FileServerService from './FileServerService.js';
import ImageUtil from '../../utils/ImageUtil.js';
import {
    ImageUploadError,
    ImageDeleteError,
    ImageValidationError,
    ImageOptimizationError,
    ImageStorageError,
    ImageMetadataError,
    ImageNotFoundError,
    ImageError
} from '../../errors/ImageError.js';

/**
 * 이미지 서비스
 * 이미지 처리 및 관리를 담당합니다.
 */
class ImageService {
    constructor() {
        this.imageRepository = new ImageRepository();
        this.fileServerService = new FileServerService();
    }

    /**
     * 이미지를 업로드합니다.
     * @param {Buffer} fileBuffer - 파일 버퍼
     * @param {string} originalName - 원본 파일명
     * @param {string} domain - 도메인 (artworks, exhibitions, users)
     * @returns {Promise<ImageResponseDto>} 업로드된 이미지 정보
     */
    async uploadImage(fileBuffer, originalName, domain) {
        try {
            // 1. 이미지 검증
            if (!ImageUtil.isValidImage(fileBuffer)) {
                throw new ImageValidationError('유효하지 않은 이미지 파일입니다.');
            }

            // 2. 이미지 최적화
            const optimizedImage = await ImageUtil.optimizeImage(fileBuffer);
            if (!optimizedImage) {
                throw new ImageOptimizationError('이미지 최적화에 실패했습니다.');
            }

            // 3. 파일 서버에 업로드
            const uploadResult = await this.fileServerService.uploadFile(optimizedImage);
            if (!uploadResult) {
                throw new ImageStorageError('파일 서버 업로드에 실패했습니다.');
            }

            // 4. 메타데이터 저장
            const imageData = {
                originalName,
                storedName: uploadResult.storedName,
                filePath: uploadResult.filePath,
                fileSize: optimizedImage.size,
                mimeType: fileBuffer.mimetype,
                width: optimizedImage.width,
                height: optimizedImage.height,
                domain: domain
            };

            const savedImage = await this.imageRepository.save(imageData);
            if (!savedImage) {
                throw new ImageMetadataError('이미지 메타데이터 저장에 실패했습니다.');
            }

            return savedImage.id;
        } catch (error) {
            if (error instanceof ImageError) {
                throw error;
            }
            throw new ImageUploadError(error.message);
        }
    }

    /**
     * 이미지를 삭제합니다.
     * @param {string} id - 이미지 ID
     * @returns {Promise<void>}
     */
    async deleteImage(imageId) {
        try {
            const image = await this.imageRepository.findById(imageId);
            if (!image) {
                throw new ImageNotFoundError();
            }

            // 1. 파일 서버에서 삭제
            const deleteResult = await this.fileServerService.deleteFile(image.filePath);
            if (!deleteResult) {
                throw new ImageStorageError('파일 서버에서 이미지 삭제에 실패했습니다.');
            }

            // 2. 메타데이터 삭제
            const deleteMetadataResult = await this.imageRepository.delete(imageId);
            if (!deleteMetadataResult) {
                throw new ImageMetadataError('이미지 메타데이터 삭제에 실패했습니다.');
            }

            return true;
        } catch (error) {
            if (error instanceof ImageError) {
                throw error;
            }
            throw new ImageDeleteError(error.message);
        }
    }

    /**
     * 이미지 정보를 조회합니다.
     * @param {string} id - 이미지 ID
     * @returns {Promise<ImageResponseDto>} 이미지 정보
     */
    async getImage(imageId) {
        try {
            const image = await this.imageRepository.findById(imageId);
            if (!image) {
                throw new ImageNotFoundError();
            }
            return image;
        } catch (error) {
            if (error instanceof ImageError) {
                throw error;
            }
            throw new ImageStorageError(error.message);
        }
    }
}

export default ImageService;
