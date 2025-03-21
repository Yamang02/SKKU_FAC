/**
 * 메인 페이지 관련 도메인 서비스
 */
class HomeService {
    constructor(artworkRepository) {
        this.artworkRepository = artworkRepository;
    }

    async getFeaturedArtworks() {
        try {
            return await this.artworkRepository.getFeaturedArtworks();
        } catch (error) {
            console.error('Error in getFeaturedArtworks:', error);
            return [];
        }
    }
}

const homeService = new HomeService();
export const getFeaturedArtworks = () => homeService.getFeaturedArtworks();

export default HomeService;
