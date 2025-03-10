import FeaturedArtworkDTO from '../dto/FeaturedArtworkDTO.js';
import { getFeaturedArtworks as getArtworksData } from '../../../infrastructure/data/featuredArtwork.js';

/**
 * 메인 페이지 관련 도메인 서비스
 */
class HomeService {
    /**
     * 메인 페이지에 표시될 추천 작품 목록을 가져옵니다.
     * @returns {Array<FeaturedArtworkDTO>} 추천 작품 DTO 목록
     */
    getFeaturedArtworks() {
        return getArtworksData().map(artwork => new FeaturedArtworkDTO(artwork));
    }
}

const homeService = new HomeService();
export const getFeaturedArtworks = () => homeService.getFeaturedArtworks();
