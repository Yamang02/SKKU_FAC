/**
 * Artwork 유스케이스
 * 작품 관련 애플리케이션 로직을 처리합니다.
 */

import Pagination from '../../domain/common/pagination/Pagination.js';

export default class ArtworkUseCase {
    constructor(artworkService, exhibitionService) {
        this.artworkService = artworkService;
        this.exhibitionService = exhibitionService;
    }

    /**
     * 작품을 검색합니다.
     * @param {Object} params - 검색 파라미터
     */
    async searchArtworks(params) {
        const { page = 1, limit = 12 } = params;
        const artworks = await this.artworkService.searchArtworks(params);
        const exhibitions = await this.exhibitionService.getExhibitions();

        const pagination = new Pagination(artworks.length, { page: parseInt(page), limit: parseInt(limit) });
        const startIndex = (pagination.options.page - 1) * pagination.options.limit;
        const endIndex = startIndex + pagination.options.limit;
        const paginatedArtworks = artworks.slice(startIndex, endIndex);

        return {
            artworks: paginatedArtworks,
            exhibitions,
            pagination: pagination.toJSON()
        };
    }

    /**
     * 학과 목록을 조회합니다.
     */
    async getDepartments() {
        return await this.artworkService.getDepartments();
    }

    /**
     * 연도 목록을 조회합니다.
     */
    async getYears() {
        return await this.artworkService.getYears();
    }

    /**
     * 작품 ID로 작품을 조회합니다.
     * @param {number} id - 작품 ID
     */
    async getArtworkById(id) {
        return await this.artworkService.findById(id);
    }

    /**
     * 관련 작품 목록을 조회합니다.
     * @param {number} id - 작품 ID
     */
    async getRelatedArtworks(id) {
        return await this.artworkService.getRelatedArtworks(id);
    }

    /**
     * 전시회 ID로 작품 목록을 조회합니다.
     * @param {number} exhibitionId - 전시회 ID
     */
    async findByExhibitionId(exhibitionId) {
        return await this.artworkService.findByExhibitionId(exhibitionId);
    }

    /**
     * 전시회 ID로 작품들을 삭제합니다.
     * @param {number} exhibitionId - 전시회 ID
     */
    async deleteByExhibitionId(exhibitionId) {
        return await this.artworkService.deleteByExhibitionId(exhibitionId);
    }

    /**
     * 작품의 댓글 목록을 조회합니다.
     * @param {number} artworkId - 작품 ID
     * @param {number} page - 페이지 번호
     */
    async getComments(artworkId, page = 1) {
        return await this.artworkService.getComments(artworkId, page);
    }

    async getUserArtworks(userId, page = 1, limit = 10) {
        try {
            const artworks = await this.artworkService.findByUserId(userId, page, limit);
            return artworks || [];
        } catch (error) {
            console.error('사용자 작품 조회 중 오류:', error);
            return [];
        }
    }

    async getUserArtworksCount(userId) {
        try {
            return await this.artworkService.countByUserId(userId);
        } catch (error) {
            console.error('사용자 작품 수 조회 중 오류:', error);
            return 0;
        }
    }
}
