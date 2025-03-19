/**
 * Notice 도메인 서비스
 * 공지사항 관련 순수 도메인 로직을 처리합니다.
 */
class NoticeDomainService {
    /**
     * 공지사항 제목의 유효성을 검사합니다.
     * @param {string} title - 공지사항 제목
     * @returns {boolean} 유효성 검사 결과
     */
    validateTitle(title) {
        if (!title || typeof title !== 'string') {
            return false;
        }
        return title.length >= 2 && title.length <= 100;
    }

    /**
     * 공지사항 내용의 유효성을 검사합니다.
     * @param {string} content - 공지사항 내용
     * @returns {boolean} 유효성 검사 결과
     */
    validateContent(content) {
        if (!content || typeof content !== 'string') {
            return false;
        }
        return content.length >= 10 && content.length <= 5000;
    }

    /**
     * 검색 유형의 유효성을 검사합니다.
     * @param {string} searchType - 검색 유형
     * @returns {boolean} 유효성 검사 결과
     */
    validateSearchType(searchType) {
        const validTypes = ['all', 'title', 'content', 'author'];
        return validTypes.includes(searchType);
    }

    /**
     * 페이지네이션 파라미터의 유효성을 검사합니다.
     * @param {number} page - 페이지 번호
     * @param {number} limit - 페이지당 항목 수
     * @returns {boolean} 유효성 검사 결과
     */
    validatePagination(page, limit) {
        return (
            Number.isInteger(page) &&
            Number.isInteger(limit) &&
            page > 0 &&
            limit > 0 &&
            limit <= 100
        );
    }
}

export default NoticeDomainService;
