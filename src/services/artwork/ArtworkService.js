import ArtworkRepository from '../../repositories/ArtworkRepository.js';
import ArtworkListDTO from '../../models/artwork/dto/ArtworkListDTO.js';
import ArtworkDetailDTO from '../../models/artwork/dto/ArtworkDetailDTO.js';
import ArtworkSimpleDTO from '../../models/artwork/dto/ArtworkSimpleDTO.js';

/**
 * 작품 서비스
 * 작품 관련 비즈니스 로직을 처리합니다.
 */
export default class ArtworkService {
    constructor() {
        this.artworkRepository = new ArtworkRepository();
    }

    /**
     * 작품 목록을 조회합니다.
     * @param {Object} params - 조회 파라미터
     * @returns {Promise<Object>} 작품 목록과 페이지 정보
     */
    async getArtworkList(params) {
        const { page = 1, limit = 12, sortField = 'createdAt', sortOrder = 'desc', searchType, keyword } = params;
        const artworks = await this.artworkRepository.findArtworks({ page, limit, sortField, sortOrder, searchType, keyword });

        return new ArtworkListDTO(
            artworks.items,
            artworks.total,
            page,
            limit
        ).toJSON();
    }

    /**
     * 작품 상세 정보를 조회합니다.
     * @param {string} id - 작품 ID
     * @returns {Promise<Object>} 작품 상세 정보
     */
    async getArtworkDetail(id) {
        const artwork = await this.artworkRepository.findArtworkById(id);
        if (!artwork) {
            throw new Error('작품을 찾을 수 없습니다.');
        }

        const relatedArtworks = await this.artworkRepository.findRelatedArtworks(id);
        return new ArtworkDetailDTO(artwork, relatedArtworks).toJSON();
    }

    /**
     * 작품의 간단한 정보를 조회합니다.
     * @param {string} id - 작품 ID
     * @param {string} type - 조회 타입 (card/modal)
     * @returns {Promise<Object>} 작품 간단 정보
     */
    async getArtworkSimple(id, type) {
        const artwork = await this.artworkRepository.findArtworkById(id);
        if (!artwork) {
            throw new Error('작품을 찾을 수 없습니다.');
        }

        return new ArtworkSimpleDTO(artwork, type).toJSON();
    }

    /**
     * 관리자용 작품 목록을 조회합니다.
     * @param {Object} params - 조회 파라미터
     * @returns {Promise<Object>} 작품 목록과 페이지 정보
     */
    async getManagementArtworkList(params) {
        const { page = 1, limit = 10, sortField = 'createdAt', sortOrder = 'desc', keyword } = params;
        const artworks = await this.artworkRepository.findArtworks({ page, limit, sortField, sortOrder, keyword });

        return new ArtworkListDTO(
            artworks.items,
            artworks.total,
            page,
            limit
        ).toJSON();
    }

    /**
     * 관리자용 작품 상세 정보를 조회합니다.
     * @param {string} id - 작품 ID
     * @returns {Promise<Object>} 작품 상세 정보
     */
    async getManagementArtworkDetail(id) {
        const artwork = await this.artworkRepository.findArtworkById(id);
        if (!artwork) {
            throw new Error('작품을 찾을 수 없습니다.');
        }

        return new ArtworkDetailDTO(artwork).toJSON();
    }

    /**
     * 작품을 생성합니다.
     * @param {Object} artworkData - 작품 데이터
     * @returns {Promise<Object>} 생성된 작품 정보
     */
    async createArtwork(artworkData) {
        // TODO: 데이터 유효성 검사 추가
        return await this.artworkRepository.createArtwork(artworkData);
    }

    /**
     * 작품을 수정합니다.
     * @param {string} id - 작품 ID
     * @param {Object} artworkData - 수정할 작품 데이터
     * @returns {Promise<Object>} 수정된 작품 정보
     */
    async updateArtwork(id, artworkData) {
        // TODO: 데이터 유효성 검사 추가
        const artwork = await this.artworkRepository.findArtworkById(id);
        if (!artwork) {
            throw new Error('작품을 찾을 수 없습니다.');
        }

        return await this.artworkRepository.updateArtwork(id, artworkData);
    }

    /**
     * 작품을 삭제합니다.
     * @param {string} id - 작품 ID
     * @returns {Promise<boolean>} 삭제 성공 여부
     */
    async deleteArtwork(id) {
        const artwork = await this.artworkRepository.findArtworkById(id);
        if (!artwork) {
            throw new Error('작품을 찾을 수 없습니다.');
        }

        return await this.artworkRepository.deleteArtwork(id);
    }
}
