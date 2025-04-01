import Image from '../models/common/image/Image.js';
import imageData from '../config/data/image.js';

/**
 * 이미지 레포지토리
 * 이미지 데이터 접근을 담당합니다.
 */
class ImageRepository {
    constructor() {
        // TODO: DB 연동 시 아래 코드로 변경
        /*
        this.db = new Database(); // DB 연결 설정
        */

        // 현재는 임시 데이터 사용
        this.images = imageData.map(data => new Image(data));
    }

    /**
     * 이미지를 저장합니다.
     * @param {Object} imageData - 이미지 데이터
     * @returns {Promise<Image>} 저장된 이미지
     */
    async saveImage(imageData) {
        // 새로운 ID 생성
        const newId = this.images.length > 0
            ? Math.max(...this.images.map(i => i.id)) + 1
            : 1;

        // Image 인스턴스 생성
        const image = new Image({
            ...imageData,
            id: newId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        // 이미지 추가
        this.images.push(image);

        return image;
    }

    /**
     * ID로 이미지를 찾습니다.
     * @param {string|number} id - 이미지 ID
     * @returns {Promise<Image|null>} 이미지 정보
     */
    async findImageById(id) {
        const image = this.images.find(i => i.id === Number(id));
        return image || null;
    }

    /**
     * 이미지를 삭제합니다.
     * @param {string|number} id - 이미지 ID
     * @returns {Promise<boolean>} 삭제 성공 여부
     */
    async deleteImage(id) {
        const index = this.images.findIndex(i => i.id === Number(id));
        if (index === -1) return false;

        this.images.splice(index, 1);
        return true;
    }
}

export default ImageRepository;
