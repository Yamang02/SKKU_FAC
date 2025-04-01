import { ImageStorageError } from '../../errors/ImageError.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';

/**
 * 파일 서버 서비스
 * 파일 시스템을 통한 파일 저장 및 관리를 담당합니다.
 */
class FileServerService {
    constructor() {
        this.uploadDir = path.join(process.cwd(), 'uploads');
        this._ensureUploadDir();
    }

    /**
     * 업로드 디렉토리가 존재하는지 확인하고 없으면 생성합니다.
     * @private
     */
    async _ensureUploadDir() {
        try {
            await fs.access(this.uploadDir);
        } catch {
            await fs.mkdir(this.uploadDir, { recursive: true });
        }
    }

    /**
     * 파일을 업로드합니다.
     * @param {Buffer} fileBuffer - 파일 버퍼
     * @returns {Promise<{storedName: string, filePath: string}>} 저장된 파일 정보
     */
    async uploadFile(fileBuffer) {
        try {
            const storedName = `${uuidv4()}.jpg`;
            const filePath = path.join(this.uploadDir, storedName);

            await fs.writeFile(filePath, fileBuffer);

            return {
                storedName,
                filePath
            };
        } catch (error) {
            throw new ImageStorageError('파일 저장에 실패했습니다.');
        }
    }

    /**
     * 파일을 삭제합니다.
     * @param {string} filePath - 파일 경로
     * @returns {Promise<boolean>} 삭제 성공 여부
     */
    async deleteFile(filePath) {
        try {
            await fs.unlink(filePath);
            return true;
        } catch (error) {
            throw new ImageStorageError('파일 삭제에 실패했습니다.');
        }
    }

    /**
     * 파일의 URL을 생성합니다.
     * @param {string} filePath - 파일 경로
     * @returns {string} 파일 URL
     */
    getUrl(filePath) {
        const storedName = path.basename(filePath);
        return `/uploads/${storedName}`;
    }
}

export default FileServerService;
