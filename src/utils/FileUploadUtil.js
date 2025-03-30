import path from 'path';
import fs from 'fs';
import { FilePath } from '../constants/Path.js';

/**
 * 파일 업로드 유틸리티 클래스
 */
export default class FileUploadUtil {
    /**
     * 파일명을 안전하게 생성합니다.
     * @param {Object} params - 파일명 생성에 필요한 파라미터
     * @param {string} params.artwork_id - 작품 ID
     * @param {string} params.title - 작품 제목
     * @param {string} params.artist_name - 작가 이름
     * @param {string} params.department - 소속
     * @param {string} params.ext - 파일 확장자
     * @returns {string} 생성된 파일명
     */
    static generateSafeFilename({ artwork_id, title, artist_name, department, ext }) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const sanitizedTitle = title.replace(/[^a-zA-Z0-9가-힣]/g, '_');
        const sanitizedArtist = artist_name.replace(/[^a-zA-Z0-9가-힣]/g, '_');
        const sanitizedDepartment = department.replace(/[^a-zA-Z0-9가-힣]/g, '_');
        return `${artwork_id}-${sanitizedTitle}-${sanitizedArtist}-${sanitizedDepartment}_${timestamp}${ext}`;
    }

    /**
     * 파일 시스템 경로를 웹 URL로 변환합니다.
     * @param {string} filePath - 파일 시스템 경로
     * @returns {string} 웹 URL
     */
    static convertToWebUrl(filePath) {
        return filePath.replace('public', '').replace(/\\/g, '/');
    }

    /**
     * 이미지 파일을 저장합니다.
     * @param {Object} params - 파일 저장에 필요한 파라미터
     * @param {Object} params.file - multer로 업로드된 파일 객체
     * @param {string} params.artwork_id - 작품 ID
     * @param {string} params.title - 작품 제목
     * @param {string} params.artist_name - 작가 이름
     * @param {string} params.department - 소속
     * @returns {Promise<{filePath: string, imageUrl: string}>} 저장된 파일 경로와 웹 URL
     */
    static async saveImage({ file, artwork_id, title, artist_name, department }) {
        try {
            // 1. 파일 형식 검사
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!allowedTypes.includes(file.mimetype)) {
                throw new Error('지원하지 않는 파일 형식입니다. JPEG, PNG, GIF 파일만 업로드 가능합니다.');
            }

            // 파일 크기 검사 (5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                throw new Error('파일 크기가 너무 큽니다. 최대 5MB까지 업로드 가능합니다.');
            }

            // 2. 업로드 디렉토리 생성
            try {
                await fs.promises.mkdir(FilePath.UPLOAD.ARTWORKS, { recursive: true });
            } catch (error) {
                throw new Error('업로드 디렉토리를 생성할 수 없습니다.');
            }

            // 3. 파일명 생성
            const ext = path.extname(file.originalname);
            const filename = this.generateSafeFilename({ artwork_id, title, artist_name, department, ext });
            const filePath = path.join(FilePath.UPLOAD.ARTWORKS, filename);

            // 4. 파일 이동
            try {
                await fs.promises.rename(file.path, filePath);
            } catch (error) {
                throw new Error('파일 저장 중 오류가 발생했습니다. 다시 시도해주세요.');
            }

            // 5. 웹 URL 생성
            const imageUrl = this.convertToWebUrl(filePath);

            return { filePath, imageUrl };
        } catch (error) {
            // 오류 발생 시 임시 파일 삭제
            if (file.path && await fs.promises.access(file.path).then(() => true).catch(() => false)) {
                await fs.promises.unlink(file.path);
            }
            throw error; // 원본 에러 메시지 유지
        }
    }

    /**
     * 파일을 삭제합니다.
     * @param {string} filePath - 삭제할 파일의 경로
     * @returns {Promise<void>}
     */
    static async deleteFile(filePath) {
        if (filePath && await fs.promises.access(filePath).then(() => true).catch(() => false)) {
            await fs.promises.unlink(filePath);
        }
    }
}
