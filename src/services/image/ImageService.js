import ImageRepository from '../../repositories/ImageRepository.js';
import FileServerService from './FileServerService.js';
import { ImageTransaction } from './ImageTransaction.js';
import { ImageError } from '../../errors/ImageError.js';

/**
 * 이미지 서비스
 * 이미지 업로드, 삭제, 조회 등의 비즈니스 로직을 담당합니다.
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
     * @param {string} category - 이미지 카테고리 (artworks, artists, exhibitions)
     * @returns {Promise<Image>} 업로드된 이미지 정보
     */
    async uploadImage(fileBuffer, originalName, category) {
        try {
            // 1. 파일 존재 여부 확인
            if (!fileBuffer || !originalName) {
                throw new ImageError('파일이 존재하지 않습니다.');
            }

            // 2. 트랜잭션 시작
            const transaction = new ImageTransaction(this.fileServerService, this.imageRepository);

            // 3. 파일 서버에 저장
            const storedFile = await transaction.saveToFileServer(fileBuffer, category);

            // 4. DB에 이미지 정보 저장
            const imageData = {
                originalName,
                storedName: storedFile.storedName,
                filePath: storedFile.filePath,
                fileSize: fileBuffer.length,
                mimeType: this.getMimeType(originalName)
            };

            const savedImage = await transaction.saveToDatabase(imageData);

            // 5. 트랜잭션 완료
            await transaction.commit();

            return savedImage;
        } catch (error) {
            console.error('이미지 업로드 실패:', error);
            throw error;
        }
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
