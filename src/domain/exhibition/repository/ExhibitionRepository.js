/**
 * Exhibition 리포지토리 인터페이스
 * 전시회 도메인의 영속성을 담당합니다.
 */
class ExhibitionRepository {
    /**
     * 모든 전시회를 조회합니다.
     * @returns {Promise<Array>} 전시회 목록
     */
    async findAll() {
        throw new Error('ExhibitionRepository.findAll() must be implemented');
    }

    /**
     * ID로 전시회를 조회합니다.
     * @param {number} _id - 전시회 ID
     * @returns {Promise<Object>} 전시회 객체
     */
    async findById(_id) {
        throw new Error('ExhibitionRepository.findById() must be implemented');
    }

    /**
     * 코드로 전시회를 조회합니다.
     * @param {string} _code - 전시회 코드
     * @returns {Promise<Object>} 전시회 객체
     */
    async findByCode(_code) {
        throw new Error('ExhibitionRepository.findByCode() must be implemented');
    }

    /**
     * 카테고리별 전시회를 조회합니다.
     * @param {string} _category - 전시회 카테고리
     * @returns {Promise<Array>} 전시회 목록
     */
    async findByCategory(_category) {
        throw new Error('ExhibitionRepository.findByCategory() must be implemented');
    }

    /**
     * 전시회를 생성합니다.
     * @param {Object} _exhibition - 생성할 전시회 데이터
     * @returns {Promise<Object>} 생성된 전시회
     */
    async create(_exhibition) {
        throw new Error('ExhibitionRepository.create() must be implemented');
    }

    /**
     * 전시회를 수정합니다.
     * @param {number} _id - 전시회 ID
     * @param {Object} _exhibition - 수정할 전시회 데이터
     * @returns {Promise<Object>} 수정된 전시회
     */
    async update(_id, _exhibition) {
        throw new Error('ExhibitionRepository.update() must be implemented');
    }

    /**
     * 전시회를 삭제합니다.
     * @param {number} _id - 전시회 ID
     * @returns {Promise<boolean>} 삭제 성공 여부
     */
    async delete(_id) {
        throw new Error('ExhibitionRepository.delete() must be implemented');
    }
}

export default ExhibitionRepository;
