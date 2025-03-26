/**
 * 공지사항 리포지토리 인터페이스
 * @interface
 */
class NoticeRepository {
    /**
     * 모든 공지사항을 조회합니다.
     * @returns {Promise<Array>} 공지사항 목록
     */
    async findAll() {
        throw new Error('Method not implemented');
    }

    /**
     * ID로 공지사항을 조회합니다.
     * @param {number} _id - 공지사항 ID
     * @returns {Promise<Object|null>} 공지사항 객체 또는 null
     */
    async findById(_id) {
        throw new Error('Method not implemented');
    }

    /**
     * 검색 조건에 맞는 공지사항을 조회합니다.
     * @param {string} _searchType - 검색 유형
     * @param {string} _keyword - 검색어
     * @param {number} _offset - 시작 위치
     * @param {number} _limit - 조회할 개수
     * @returns {Promise<Array>} 공지사항 목록
     */
    async findBySearchType(_searchType, _keyword, _offset, _limit) {
        throw new Error('Method not implemented');
    }

    /**
     * 검색 조건에 맞는 공지사항의 총 개수를 조회합니다.
     * @param {string} _searchType - 검색 유형
     * @param {string} _keyword - 검색어
     * @returns {Promise<number>} 공지사항 총 개수
     */
    async count(_searchType, _keyword) {
        throw new Error('Method not implemented');
    }

    /**
     * 공지사항의 조회수를 증가시킵니다.
     * @param {number} _id - 공지사항 ID
     * @returns {Promise<boolean>} 성공 여부
     */
    async incrementViews(_id) {
        throw new Error('Method not implemented');
    }
}

export default NoticeRepository;
