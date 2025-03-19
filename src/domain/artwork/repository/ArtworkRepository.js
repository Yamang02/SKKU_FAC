/**
 * Artwork 리포지토리 인터페이스
 * 작품 도메인의 영속성을 담당합니다.
 */
class ArtworkRepository {
    /**
     * ID로 작품을 조회합니다.
     * @param {number} _id - 작품 ID
     * @returns {Promise<Object>} 작품 객체
     */
    async findById(_id) {
        throw new Error('ArtworkRepository.findById() must be implemented');
    }

    /**
     * 작품 목록을 검색합니다.
     * @param {Object} _params - 검색 조건
     * @returns {Promise<Object>} 작품 목록과 총 개수
     */
    async searchArtworks(_params) {
        throw new Error('ArtworkRepository.searchArtworks() must be implemented');
    }

    /**
     * 전시회별 작품 목록을 조회합니다.
     * @param {number} _exhibitionId - 전시회 ID
     * @returns {Promise<Array>} 작품 목록
     */
    async findByExhibitionId(_exhibitionId) {
        throw new Error('ArtworkRepository.findByExhibitionId() must be implemented');
    }

    /**
     * 연관 작품 목록을 조회합니다.
     * @param {number} _artworkId - 작품 ID
     * @returns {Promise<Array>} 연관 작품 목록
     */
    async findRelatedArtworks(_artworkId) {
        throw new Error('ArtworkRepository.findRelatedArtworks() must be implemented');
    }

    /**
     * 모든 학과 목록을 조회합니다.
     * @returns {Promise<Array>} 학과 목록
     */
    async getDepartments() {
        throw new Error('ArtworkRepository.getDepartments() must be implemented');
    }

    /**
     * 모든 연도 목록을 조회합니다.
     * @returns {Promise<Array>} 연도 목록
     */
    async getYears() {
        throw new Error('ArtworkRepository.getYears() must be implemented');
    }

    /**
     * 작품을 생성합니다.
     * @param {Object} _artwork - 생성할 작품 데이터
     * @returns {Promise<Object>} 생성된 작품
     */
    async create(_artwork) {
        throw new Error('ArtworkRepository.create() must be implemented');
    }

    /**
     * 작품을 수정합니다.
     * @param {number} _id - 작품 ID
     * @param {Object} _artwork - 수정할 작품 데이터
     * @returns {Promise<Object>} 수정된 작품
     */
    async update(_id, _artwork) {
        throw new Error('ArtworkRepository.update() must be implemented');
    }

    /**
     * 작품을 삭제합니다.
     * @param {number} _id - 작품 ID
     * @returns {Promise<boolean>} 삭제 성공 여부
     */
    async delete(_id) {
        throw new Error('ArtworkRepository.delete() must be implemented');
    }
}

export default ArtworkRepository;
