import { ImageTransactionError } from '../../errors/ImageError.js';

/**
 * 이미지 저장 트랜잭션
 * 파일 서버와 DB 저장을 트랜잭션으로 처리합니다.
 */
export class ImageTransaction {
    constructor(fileServerService, imageRepository) {
        this.fileServerService = fileServerService;
        this.imageRepository = imageRepository;
        this.uploadedFile = null;
        this.savedImage = null;
    }

    /**
     * 파일 서버에 이미지를 저장합니다.
     * @param {Buffer} fileBuffer - 파일 버퍼
     * @param {string} category - 파일 카테고리
     * @returns {Promise<{storedName: string, filePath: string}>} 저장된 파일 정보
     */
    async saveToFileServer(fileBuffer, category) {
        try {
            console.log('파일 서버 저장 시작');
            this.uploadedFile = await this.fileServerService.uploadFile(fileBuffer, category);
            console.log('파일 서버 저장 성공:', {
                storedName: this.uploadedFile.storedName,
                filePath: this.uploadedFile.filePath
            });
            return this.uploadedFile;
        } catch (error) {
            console.error('파일 서버 저장 실패:', error.message);
            throw new ImageTransactionError('파일 서버 저장 실패: ' + error.message);
        }
    }

    /**
     * DB에 이미지 정보를 저장합니다.
     * @param {Object} imageData - 이미지 데이터
     * @returns {Promise<Object>} 저장된 이미지 정보
     */
    async saveToDatabase(imageData) {
        try {
            console.log('DB 저장 시작:', imageData);
            this.savedImage = await this.imageRepository.saveImage(imageData);
            console.log('DB 저장 성공:', { imageId: this.savedImage.id });
            return this.savedImage;
        } catch (error) {
            console.error('DB 저장 실패:', error.message);
            // DB 저장 실패 시 파일 서버에서 파일 삭제
            if (this.uploadedFile) {
                await this.rollback();
            }
            throw new ImageTransactionError('DB 저장 실패: ' + error.message);
        }
    }

    /**
     * 트랜잭션 롤백
     * 파일 서버에서 저장된 파일을 삭제합니다.
     */
    async rollback() {
        if (this.uploadedFile) {
            try {
                console.log('롤백 시작:', { storedName: this.uploadedFile.storedName });
                await this.fileServerService.deleteFile(this.uploadedFile.storedName);
                console.log('롤백 성공');
            } catch (error) {
                console.error('롤백 중 파일 삭제 실패:', error.message);
            }
        }
    }

    /**
     * 트랜잭션 커밋
     * 모든 작업이 성공적으로 완료되었음을 확인합니다.
     * @returns {Promise<Object>} 저장된 이미지 정보
     */
    async commit() {
        if (!this.uploadedFile || !this.savedImage) {
            console.error('트랜잭션 완료 실패:', {
                hasUploadedFile: !!this.uploadedFile,
                hasSavedImage: !!this.savedImage
            });
            throw new ImageTransactionError('트랜잭션이 완료되지 않았습니다.');
        }
        console.log('트랜잭션 완료:', {
            imageId: this.savedImage.id,
            storedName: this.uploadedFile.storedName
        });
        return this.savedImage;
    }
}
