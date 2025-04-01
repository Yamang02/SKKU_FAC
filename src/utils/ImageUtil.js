import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';

/**
 * 이미지 처리 유틸리티
 * 이미지 업로드, 삭제, 변환 등의 공통 기능을 제공합니다.
 */
class ImageUtil {
    /**
     * 이미지 파일을 저장합니다.
     * @param {Buffer} fileBuffer - 이미지 파일 버퍼
     * @param {string} originalName - 원본 파일명
     * @param {string} uploadDir - 업로드 디렉토리
     * @returns {Promise<{storedName: string, filePath: string}>}
     */
    static async saveImage(fileBuffer, originalName, uploadDir) {
        // 디버깅: 입력값 확인
        console.log('saveImage 입력값:', {
            fileBuffer: fileBuffer ? 'Buffer 존재' : 'Buffer 없음',
            originalName,
            uploadDir
        });

        if (!fileBuffer) {
            console.error('이미지 버퍼가 없습니다.');
            throw new Error('이미지 파일이 없습니다.');
        }

        // 절대 경로로 변환
        const absoluteUploadDir = path.resolve(process.cwd(), uploadDir);
        console.log('절대 업로드 경로:', absoluteUploadDir);

        // 유니크한 파일명 생성
        const storedName = this.generateUniqueFileName(originalName);
        console.log('생성된 파일명:', storedName);

        // 업로드 디렉토리 생성
        try {
            if (!fs.existsSync(absoluteUploadDir)) {
                console.log('업로드 디렉토리 생성 시도:', absoluteUploadDir);
                fs.mkdirSync(absoluteUploadDir, { recursive: true });
                console.log('업로드 디렉토리 생성 완료');
            }
        } catch (error) {
            console.error('디렉토리 생성 중 오류:', error);
            console.error('에러 스택:', error.stack);
            throw new Error('업로드 디렉토리 생성에 실패했습니다.');
        }

        const filePath = path.join(absoluteUploadDir, storedName);
        console.log('저장 경로:', filePath);

        try {
            console.log('Sharp 이미지 처리 시작');
            // 이미지 최적화 및 저장
            await sharp(fileBuffer)
                .resize(800, 800, { // 최대 크기 제한
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .jpeg({ quality: 80 }) // JPEG 품질 설정
                .toFile(filePath);

            console.log('이미지 저장 완료');

            return {
                storedName,
                filePath: path.relative(process.cwd(), filePath) // 상대 경로로 반환
            };
        } catch (error) {
            console.error('이미지 처리 중 오류:', error);
            console.error('에러 스택:', error.stack);
            console.error('에러 타입:', error.constructor.name);

            // 에러 발생 시 생성된 파일 삭제
            try {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    console.log('에러 발생으로 인한 임시 파일 삭제 완료');
                }
            } catch (unlinkError) {
                console.error('임시 파일 삭제 중 오류:', unlinkError);
            }

            throw error;
        }
    }

    /**
     * 이미지 파일을 삭제합니다.
     * @param {string} filePath - 삭제할 파일 경로
     * @returns {Promise<boolean>}
     */
    static async deleteImage(filePath) {
        try {
            if (fs.existsSync(filePath)) {
                await fs.promises.unlink(filePath);
                return true;
            }
            return false;
        } catch (error) {
            console.error('이미지 삭제 중 오류 발생:', error);
            return false;
        }
    }

    /**
     * 유니크한 파일명을 생성합니다.
     * @param {string} originalName - 원본 파일명
     * @returns {string}
     */
    static generateUniqueFileName(originalName) {
        const timestamp = Date.now();
        const randomString = crypto.randomBytes(8).toString('hex');
        const extension = path.extname(originalName);
        return `${timestamp}-${randomString}${extension}`;
    }

    /**
     * 이미지 파일의 유효성을 검사합니다.
     * @param {Object} file - 이미지 파일 객체
     * @returns {boolean}
     */
    static validateImage(file) {
        // 허용된 이미지 타입
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

        // 최대 파일 크기 (5MB)
        const maxSize = 5 * 1024 * 1024;

        return (
            allowedTypes.includes(file.mimetype) &&
            file.size <= maxSize
        );
    }

    /**
     * 이미지 파일의 메타데이터를 추출합니다.
     * @param {Buffer} fileBuffer - 이미지 파일 버퍼
     * @returns {Promise<{width: number, height: number}>}
     */
    static async getImageMetadata(fileBuffer) {
        const metadata = await sharp(fileBuffer).metadata();
        return {
            width: metadata.width,
            height: metadata.height
        };
    }
}

export default ImageUtil;
