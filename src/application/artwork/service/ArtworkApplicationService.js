import ArtworkDto from '../../../domain/artwork/dto/ArtworkDto.js';

/**
 * 작품 애플리케이션 서비스
 * 작품 관련 사용자 케이스를 처리합니다.
 */
class ArtworkApplicationService {
    constructor(artworkRepository) {
        this.artworkRepository = artworkRepository;
    }

    /**
     * 작품 목록을 검색합니다.
     * @param {Object} params - 검색 파라미터
     * @returns {Promise<Object>} 작품 목록과 총 개수
     */
    async searchArtworks(params) {
        const result = await this.artworkRepository.searchArtworks(params);
        return {
            items: result.items.map(artwork => new ArtworkDto(artwork)),
            total: result.total
        };
    }

    /**
     * ID로 작품을 조회합니다.
     * @param {number} id - 작품 ID
     * @returns {Promise<ArtworkDto|null>} 작품 DTO 또는 null
     */
    async getArtworkById(id) {
        const artwork = await this.artworkRepository.findById(id);
        return artwork ? new ArtworkDto(artwork) : null;
    }

    /**
     * 전시회 ID로 작품 목록을 조회합니다.
     * @param {number} exhibitionId - 전시회 ID
     * @returns {Promise<Array<ArtworkDto>>} 작품 DTO 목록
     */
    async getArtworksByExhibitionId(exhibitionId) {
        const artworks = await this.artworkRepository.findByExhibitionId(exhibitionId);
        return artworks.map(artwork => new ArtworkDto(artwork));
    }

    /**
     * 관련 작품 목록을 조회합니다.
     * @param {number} artworkId - 작품 ID
     * @returns {Promise<Array<ArtworkDto>>} 관련 작품 DTO 목록
     */
    async getRelatedArtworks(artworkId) {
        const artworks = await this.artworkRepository.findRelatedArtworks(artworkId);
        return artworks.map(artwork => new ArtworkDto(artwork));
    }

    /**
     * 학과 목록을 조회합니다.
     * @returns {Promise<Array<string>>} 학과 목록
     */
    async getDepartments() {
        return await this.artworkRepository.getDepartments();
    }

    /**
     * 연도 목록을 조회합니다.
     * @returns {Promise<Array<number>>} 연도 목록
     */
    async getYears() {
        return await this.artworkRepository.getYears();
    }
}

export default ArtworkApplicationService;
