import Artwork from '../entity/Artwork.js';
import ArtworkDto from '../dto/ArtworkDto.js';
import artworksData from '../../../infrastructure/data/artwork.js';
import exhibitionData from '../../../infrastructure/data/exhibition.js';

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
        const artwork = artworksData.find(art => art.id === parseInt(id));
        if (!artwork) return null;

        const artworkEntity = new Artwork(artwork);
        const exhibition = exhibitionData.find(exh => exh.id === parseInt(artwork.exhibitionId));
        const dto = this.convertToDTO([artworkEntity])[0];
        if (exhibition) {
            dto.exhibition = exhibition;
        }

        return dto;
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

    /**
     * 작품의 댓글 목록을 조회합니다.
     * @param {number} artworkId - 작품 ID
     * @param {number} page - 페이지 번호
     */
    async getComments(artworkId, page = 1) {
        return this.artworkRepository.getComments(artworkId, page);
    }

    /**
     * 관련 작품 목록을 조회합니다.
     * @param {number} artworkId - 작품 ID
     */
    async getRelatedArtworks(artworkId) {
        return this.artworkRepository.getRelatedArtworks(artworkId);
    }

    /**
     * 작품 엔티티 목록을 DTO로 변환합니다.
     * @param {Array<Artwork>} artworks 작품 엔티티 목록
     * @returns {Array<ArtworkDto>} 작품 DTO 목록
     */
    convertToDTO(artworks) {
        return artworks.map(artwork => {
            const exhibition = exhibitionData.find(exh => exh.id === parseInt(artwork.exhibitionId));
            const dto = new ArtworkDto(artwork, exhibition);
            if (exhibition) {
                dto.exhibition = exhibition;
            }
            return dto;
        });
    }

    /**
     * 작품 목록을 검색 조건에 따라 가져옵니다.
     * @param {Object} filters 검색 필터
     * @returns {Object} 작품 목록과 총 개수
     */
    async searchArtworksWithFilters(filters = {}) {
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
            items: this.convertToDTO(artworkEntities),
            total
        };
    }

    async findByUserId(userId, page = 1, limit = 10) {
        try {
            const offset = (page - 1) * limit;
            const artworks = await this.artworkRepository.findByUserId(userId, offset, limit);
            return artworks.map(artwork => ({
                id: artwork.id,
                title: artwork.title,
                description: artwork.description,
                imageUrl: artwork.imageUrl,
                createdAt: artwork.createdAt
            }));
        } catch (error) {
            console.error('사용자 작품 조회 중 오류:', error);
            return [];
        }
    }

    async countByUserId(userId) {
        try {
            return await this.artworkRepository.countByUserId(userId);
        } catch (error) {
            console.error('사용자 작품 수 조회 중 오류:', error);
            return 0;
        }
    }

    /**
     * 모든 작품을 조회합니다.
     * @returns {Promise<Array>} 작품 목록
     */
    async findAll() {
        const artworkEntities = artworksData.map(art => new Artwork(art));
        return this.convertToDTO(artworkEntities);
    }

    /**
     * 작품을 수정합니다.
     * @param {number} id - 작품 ID
     * @param {Object} updateData - 수정할 데이터
     * @returns {Promise<Object>} 수정된 작품
     */
    async update(id, updateData) {
        const artwork = await this.artworkRepository.update(id, updateData);
        if (!artwork) return null;
        return new ArtworkDto(artwork);
    }

    /**
     * 작품을 삭제합니다.
     * @param {number} id - 작품 ID
     * @returns {Promise<boolean>} 삭제 성공 여부
     */
    async delete(id) {
        return await this.artworkRepository.delete(id);
    }

    /**
     * 모든 작가 목록을 조회합니다.
     * @returns {Promise<Array>} 작가 목록
     */
    async getArtists() {
        // 작품 데이터에서 고유한 작가 정보 추출
        const artists = Array.from(new Set(artworksData.map(artwork => artwork.artist)))
            .map((name, index) => ({
                id: index + 1,
                name
            }));
        return artists;
    }
}

export default ArtworkService;
