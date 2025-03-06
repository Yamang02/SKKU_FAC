const FeaturedArtworkDTO = require('../dto/FeaturedArtworkDTO');
const featuredArtworksData = require('../../../infrastructure/data/featuredArtworks');

/**
 * 메인 페이지 관련 도메인 서비스
 */
class HomeService {
    /**
     * 메인 페이지에 표시될 추천 작품 목록을 가져옵니다.
     * @returns {Array<FeaturedArtworkDTO>} 추천 작품 DTO 목록
     */
    getFeaturedArtworks() {
        return featuredArtworksData.map(artwork => new FeaturedArtworkDTO(artwork));
    }
}

module.exports = new HomeService(); 