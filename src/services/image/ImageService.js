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
     * @param {Object} file - 업로드된 파일 정보
     * @param {string} category - 이미지 카테고리 (artworks, exhibitions 등)
     * @returns {Promise<Object>} 저장된 이미지 정보
     */
    async uploadImage(file, category) {
        try {
            console.log('=== ImageService: 이미지 업로드 시작 ===');
            console.log('파일 정보:', {
                originalname: file.originalname,
                mimetype: file.mimetype,
                size: file.size
            });
            console.log('업로드 카테고리:', category);

            // 파일 유효성 검사
            if (!file) {
                console.error('파일이 없습니다.');
                throw new ImageError('파일이 업로드되지 않았습니다.');
            }

            if (!file.mimetype.startsWith('image/')) {
                console.error('잘못된 파일 형식:', file.mimetype);
                throw new ImageError('이미지 파일만 업로드 가능합니다.');
            }

            // 카테고리 유효성 검사
            if (!category) {
                console.error('카테고리가 지정되지 않았습니다.');
                throw new ImageError('이미지 카테고리는 필수입니다.');
            }

            // 트랜잭션 시작
            const transaction = new ImageTransaction(this.fileServerService, this.imageRepository);
            console.log('트랜잭션 시작');

            try {
                // 파일 서버에 저장
                const uploadedFile = await transaction.saveToFileServer(file.buffer, category);
                console.log('파일 저장 완료:', uploadedFile);

                // 이미지 정보를 데이터베이스에 저장
                const imageData = {
                    originalName: file.originalname,
                    storedName: uploadedFile.storedName,
                    filePath: uploadedFile.filePath,
                    fileSize: file.size,
                    mimeType: file.mimetype
                };
                console.log('데이터베이스에 저장할 이미지 정보:', imageData);

                const savedImage = await transaction.saveToDatabase(imageData);
                console.log('데이터베이스 저장 완료:', savedImage);

                // 트랜잭션 커밋
                await transaction.commit();
                console.log('트랜잭션 커밋 완료');

                console.log('=== 이미지 업로드 완료 ===');
                return savedImage;
            } catch (error) {
                // 트랜잭션 롤백
                console.error('업로드 중 오류 발생, 롤백 시작');
                await transaction.rollback();
                console.log('롤백 완료');
                throw error;
            }
        } catch (error) {
            console.error('이미지 업로드 중 오류:', error);
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
