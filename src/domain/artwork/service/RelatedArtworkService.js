const RelatedArtworkDTO = require('../dto/RelatedArtworkDTO');
const relatedArtworksData = require('../../../infrastructure/data/relatedArtworks');

/**
 * 관련 작품 도메인 서비스
 */
class RelatedArtworkService {
    /**
     * 작품 ID에 해당하는 관련 작품 목록을 가져옵니다.
     * @param {number} artworkId 작품 ID
     * @param {number} limit 가져올 작품 수 (기본값: 5)
     * @returns {Array<RelatedArtworkDTO>} 관련 작품 DTO 목록
     */
    getRelatedArtworks(artworkId, limit = 5) {
        const artworkIdInt = parseInt(artworkId);
        
        // 작품 ID에 해당하는 관련 작품 목록 가져오기
        const relatedArtworks = relatedArtworksData[artworkIdInt] || [];
        
        // 제한된 수의 관련 작품 추출
        const limitedArtworks = relatedArtworks.slice(0, limit);
        
        // DTO로 변환
        return limitedArtworks.map(artwork => new RelatedArtworkDTO(artwork));
    }
}

module.exports = new RelatedArtworkService(); 