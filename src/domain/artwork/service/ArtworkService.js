import Artwork from '../entity/Artwork.js';
import ArtworkDTO from '../dto/ArtworkDTO.js';
import artworksData from '../../../infrastructure/data/artwork.js';
import * as exhibitionService from '../../exhibition/service/ExhibitionService.js';

/**
 * 작품 서비스
 * 작품 관련 도메인 로직을 처리합니다.
 */
class ArtworkService {
    constructor(artworkRepository) {
        this.artworkRepository = artworkRepository;
    }

    /**
     * 작품을 검색합니다.
     * @param {Object} params - 검색 파라미터
     */
    async searchArtworks(params) {
        return this.artworkRepository.searchArtworks(params);
    }

    /**
     * 학과 목록을 조회합니다.
     */
    async getDepartments() {
        return this.artworkRepository.getDepartments();
    }

    /**
     * 연도 목록을 조회합니다.
     */
    async getYears() {
        return this.artworkRepository.getYears();
    }

    /**
     * 작품 ID로 작품을 조회합니다.
     * @param {number} id - 작품 ID
     */
    async findById(id) {
        return this.artworkRepository.findById(id);
    }

    /**
     * 관련 작품 목록을 조회합니다.
     * @param {number} artworkId - 작품 ID
     */
    async findRelatedArtworks(artworkId) {
        return this.artworkRepository.findRelatedArtworks(artworkId);
    }

    /**
     * 전시회 ID로 작품 목록을 조회합니다.
     * @param {number} exhibitionId - 전시회 ID
     */
    async findByExhibitionId(exhibitionId) {
        return this.artworkRepository.findByExhibitionId(exhibitionId);
    }

    /**
     * 전시회 ID로 작품들을 삭제합니다.
     * @param {number} exhibitionId - 전시회 ID
     */
    async deleteByExhibitionId(exhibitionId) {
        return this.artworkRepository.deleteByExhibitionId(exhibitionId);
    }

    /**
     * 추천 작품 목록을 조회합니다.
     */
    async getFeaturedArtworks() {
        return this.artworkRepository.getFeaturedArtworks();
    }
}

export default ArtworkService;

/**
 * ID로 작품을 찾습니다.
 * @param {number} id 작품 ID
 * @returns {ArtworkDTO|null} 찾은 작품 DTO 또는 null
 */
export function getArtworkById(id) {
    const artwork = artworksData.find(art => art.id === parseInt(id));
    if (!artwork) return null;

    const artworkEntity = new Artwork(artwork);
    const exhibition = exhibitionService.getExhibitionByCode(artwork.exhibitionId);

    // DTO 변환 시 전시회 정보 추가
    const dto = convertToDTO([artworkEntity])[0];
    if (exhibition) {
        dto.exhibition = exhibition.title;
    }

    return dto;
}

/**
 * 작품 목록을 검색 조건에 따라 가져옵니다.
 * @param {Object} filters 검색 필터
 * @returns {Object} 작품 목록과 총 개수
 */
export function getArtworks(filters = {}) {
    return searchArtworks(filters);
}

/**
 * 작품 목록을 검색 조건에 따라 가져옵니다.
 * @param {Object} filters 검색 필터
 * @returns {Object} 작품 목록과 총 개수
 */
export function searchArtworks(filters = {}) {
    const { keyword, exhibition, year, department, featured, limit = 12, offset = 0 } = filters;

    // 필터링 로직
    let filteredArtworks = [...artworksData];

    if (keyword) {
        const searchTerm = keyword.toLowerCase();
        filteredArtworks = filteredArtworks.filter(art =>
            art.title.toLowerCase().includes(searchTerm) ||
            art.artist.toLowerCase().includes(searchTerm) ||
            art.description.toLowerCase().includes(searchTerm)
        );
    }

    if (exhibition) {
        filteredArtworks = filteredArtworks.filter(art =>
            art.exhibitionId === exhibition
        );
    }

    if (year) {
        filteredArtworks = filteredArtworks.filter(art =>
            art.year === parseInt(year)
        );
    }

    if (department) {
        filteredArtworks = filteredArtworks.filter(art =>
            art.department === department
        );
    }

    if (featured) {
        filteredArtworks = filteredArtworks.filter(art => art.isFeatured);
    }

    // 총 개수
    const total = filteredArtworks.length;

    // 페이지네이션
    const paginatedArtworks = filteredArtworks.slice(offset, offset + limit);

    // 엔티티 변환
    const artworkEntities = paginatedArtworks.map(art => new Artwork(art));

    return {
        items: convertToDTO(artworkEntities),
        total
    };
}

/**
 * 작품 엔티티 목록을 DTO로 변환합니다.
 * @param {Array<Artwork>} artworks 작품 엔티티 목록
 * @returns {Array<ArtworkDTO>} 작품 DTO 목록
 */
function convertToDTO(artworks) {
    return artworks.map(artwork => {
        const exhibition = exhibitionService.getExhibitionByCode(artwork.exhibitionId);
        return new ArtworkDTO(artwork, exhibition);
    });
}
