import ArtworkService from '../../../artwork/service/ArtworkService.js';

export default class ArtworkManagementService {
    constructor() {
        this.artworkService = new ArtworkService();
    }

    /**
     * 작품 목록을 조회합니다.
     * @param {Object} options - 페이지네이션 옵션
     * @returns {Promise<Object>} 작품 목록 데이터
     */
    async getArtworkList(options) {
        try {
            return await this.artworkService.getArtworkList(options);
        } catch (error) {
            console.error('작품 목록 조회 서비스 오류:', error);
            throw error;
        }
    }

    /**
     * 작품을 삭제합니다.
     * @param {number} artworkId - 작품 ID
     * @returns {Promise<boolean>} 성공 여부
     */
    async deleteArtwork(artworkId) {
        try {
            return await this.artworkService.deleteArtwork(artworkId);
        } catch (error) {
            console.error('작품 삭제 서비스 오류:', error);
            throw error;
        }
    }
}
