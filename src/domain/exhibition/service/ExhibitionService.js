/**
 * Exhibition 서비스
 * 전시회 관련 도메인 로직을 처리합니다.
 */
class ExhibitionService {
    constructor(exhibitionRepository) {
        this.exhibitionRepository = exhibitionRepository;
    }

    /**
     * 모든 전시회를 조회합니다.
     */
    async findAll() {
        return this.exhibitionRepository.findAll();
    }

    /**
     * 모든 전시회를 조회합니다.
     * @returns {Promise<Array>} 전시회 목록
     */
    async getExhibitions() {
        return this.exhibitionRepository.findAll();
    }

    /**
     * 전시회 ID로 전시회를 조회합니다.
     * @param {number} id - 전시회 ID
     */
    async findById(id) {
        return this.exhibitionRepository.findById(id);
    }

    /**
     * 카테고리로 전시회를 조회합니다.
     * @param {string} category - 카테고리
     */
    async findByCategory(category) {
        return this.exhibitionRepository.findByCategory(category);
    }

    /**
     * 새 전시회를 생성합니다.
     * @param {Object} exhibitionData - 전시회 데이터
     */
    async create(exhibitionData) {
        return this.exhibitionRepository.create(exhibitionData);
    }

    /**
     * 전시회를 수정합니다.
     * @param {number} id - 전시회 ID
     * @param {Object} exhibitionData - 수정할 데이터
     */
    async update(id, exhibitionData) {
        return this.exhibitionRepository.update(id, exhibitionData);
    }

    /**
     * 전시회를 삭제합니다.
     * @param {number} id - 전시회 ID
     */
    async delete(id) {
        return this.exhibitionRepository.delete(id);
    }
}

export default ExhibitionService;
