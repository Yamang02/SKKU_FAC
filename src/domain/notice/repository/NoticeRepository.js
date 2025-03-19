/**
 * Notice 리포지토리 인터페이스
 * 공지사항의 영속성 처리를 위한 추상화 계층을 정의합니다.
 */
class NoticeRepository {
    /**
     * 모든 공지사항을 검색 조건에 따라 조회합니다.
     * @param {string} _searchType - 검색 유형 (all, title, content)
     * @param {string} _keyword - 검색어
     * @param {number} _offset - 시작 위치
     * @param {number} _limit - 조회할 항목 수
     * @returns {Promise<Array>} 공지사항 목록
     */
    async findBySearchType(_searchType, _keyword, _offset, _limit) {
        throw new Error('NoticeRepository.findBySearchType() must be implemented');
    }

    /**
     * 공지사항의 총 개수를 조회합니다.
     * @param {string} _searchType - 검색 유형
     * @param {string} _keyword - 검색어
     * @returns {Promise<number>} 총 공지사항 수
     */
    async count(_searchType, _keyword) {
        throw new Error('NoticeRepository.count() must be implemented');
    }

    /**
     * ID로 공지사항을 조회합니다.
     * @param {number} _id - 공지사항 ID
     * @returns {Promise<Object>} 공지사항 객체
     */
    async findById(_id) {
        throw new Error('NoticeRepository.findById() must be implemented');
    }

    /**
     * 공지사항의 조회수를 증가시킵니다.
     * @param {number} _id - 공지사항 ID
     * @returns {Promise<void>}
     */
    async incrementViews(_id) {
        throw new Error('NoticeRepository.incrementViews() must be implemented');
    }

    /**
     * 이전/다음 공지사항 ID를 조회합니다.
     * @param {number} _currentId - 현재 공지사항 ID
     * @returns {Promise<Object>} 이전/다음 공지사항 ID
     */
    async findAdjacentIds(_currentId) {
        throw new Error('NoticeRepository.findAdjacentIds() must be implemented');
    }
}

export default NoticeRepository;
