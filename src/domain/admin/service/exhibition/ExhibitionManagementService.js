import ExhibitionService from '../../../exhibition/service/ExhibitionService.js';

export default class ExhibitionManagementService {
    constructor() {
        this.exhibitionService = new ExhibitionService();
    }

    /**
     * 전시회 목록을 조회합니다.
     * @param {Object} options - 페이지네이션 옵션
     * @returns {Promise<Object>} 전시회 목록 데이터
     */
    async getExhibitionList(options) {
        try {
            return await this.exhibitionService.getExhibitionList(options);
        } catch (error) {
            console.error('전시회 목록 조회 서비스 오류:', error);
            throw error;
        }
    }

    /**
     * 전시회 상세 정보를 조회합니다.
     * @param {number} exhibitionId - 전시회 ID
     * @returns {Promise<Object>} 전시회 상세 데이터
     */
    async getExhibitionDetail(exhibitionId) {
        try {
            return await this.exhibitionService.getExhibitionDetail(exhibitionId);
        } catch (error) {
            console.error('전시회 상세 조회 서비스 오류:', error);
            throw error;
        }
    }

    /**
     * 새 전시회를 생성합니다.
     * @param {Object} exhibitionData - 전시회 데이터
     * @returns {Promise<number>} 생성된 전시회 ID
     */
    async createExhibition(exhibitionData) {
        try {
            return await this.exhibitionService.createExhibition(exhibitionData);
        } catch (error) {
            console.error('전시회 생성 서비스 오류:', error);
            throw error;
        }
    }

    /**
     * 전시회를 수정합니다.
     * @param {number} exhibitionId - 전시회 ID
     * @param {Object} exhibitionData - 수정할 전시회 데이터
     * @returns {Promise<boolean>} 성공 여부
     */
    async updateExhibition(exhibitionId, exhibitionData) {
        try {
            return await this.exhibitionService.updateExhibition(exhibitionId, exhibitionData);
        } catch (error) {
            console.error('전시회 수정 서비스 오류:', error);
            throw error;
        }
    }

    /**
     * 전시회를 삭제합니다.
     * @param {number} exhibitionId - 전시회 ID
     * @returns {Promise<boolean>} 성공 여부
     */
    async deleteExhibition(exhibitionId) {
        try {
            return await this.exhibitionService.deleteExhibition(exhibitionId);
        } catch (error) {
            console.error('전시회 삭제 서비스 오류:', error);
            throw error;
        }
    }
}
