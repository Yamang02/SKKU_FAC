const Artwork = require('../entity/Artwork');
const ArtworkDTO = require('../dto/ArtworkDTO');
const artworksData = require('../../../infrastructure/data/artworks');
const exhibitionService = require('../../exhibition/service/ExhibitionService');

/**
 * 작품 관련 도메인 서비스
 */
class ArtworkService {
    /**
     * 모든 작품 목록을 가져옵니다.
     * @returns {Array<ArtworkDTO>} 작품 DTO 목록
     */
    getAllArtworks() {
        const artworks = artworksData.map(artwork => new Artwork(artwork));
        return this._convertToDTO(artworks);
    }

    /**
     * ID로 작품을 찾습니다.
     * @param {number} id 작품 ID
     * @returns {ArtworkDTO|null} 찾은 작품 DTO 또는 null
     */
    getArtworkById(id) {
        const artwork = artworksData.find(art => art.id === parseInt(id));
        if (!artwork) return null;
        
        const artworkEntity = new Artwork(artwork);
        const exhibition = exhibitionService.getExhibitionByCode(artwork.exhibitionId);
        
        return new ArtworkDTO(artworkEntity, exhibition);
    }

    /**
     * 검색 조건에 맞는 작품 목록을 가져옵니다.
     * @param {Object} filters 검색 필터
     * @returns {Array<ArtworkDTO>} 필터링된 작품 DTO 목록
     */
    searchArtworks(filters = {}) {
        const { keyword, exhibition, year, department } = filters;
        
        let filteredArtworks = [...artworksData];
        
        // 키워드 검색
        if (keyword) {
            const searchTerm = keyword.toLowerCase();
            filteredArtworks = filteredArtworks.filter(artwork => 
                artwork.title.toLowerCase().includes(searchTerm) || 
                artwork.artist.toLowerCase().includes(searchTerm) ||
                artwork.description.toLowerCase().includes(searchTerm)
            );
        }
        
        // 전시회 필터링
        if (exhibition && exhibition !== 'all') {
            filteredArtworks = filteredArtworks.filter(artwork => 
                artwork.exhibitionId === exhibition
            );
        }
        
        // 제작 연도 필터링
        if (year) {
            filteredArtworks = filteredArtworks.filter(artwork => 
                artwork.year === year
            );
        }
        
        // 학과 필터링
        if (department) {
            filteredArtworks = filteredArtworks.filter(artwork => 
                artwork.department.includes(department)
            );
        }
        
        const artworkEntities = filteredArtworks.map(artwork => new Artwork(artwork));
        return this._convertToDTO(artworkEntities);
    }

    /**
     * 작품 엔티티 배열을 DTO 배열로 변환합니다.
     * @param {Array<Artwork>} artworks 작품 엔티티 배열
     * @returns {Array<ArtworkDTO>} 작품 DTO 배열
     * @private
     */
    _convertToDTO(artworks) {
        return artworks.map(artwork => {
            const exhibition = exhibitionService.getExhibitionByCode(artwork.exhibitionId);
            return new ArtworkDTO(artwork, exhibition);
        });
    }
}

module.exports = new ArtworkService(); 