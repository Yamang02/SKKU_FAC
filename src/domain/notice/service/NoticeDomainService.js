/**
 * Notice 도메인 서비스
 * 공지사항 관련 순수 도메인 로직을 처리합니다.
 */
class NoticeDomainService {
    constructor(noticeRepository) {
        this.noticeRepository = noticeRepository;
    }

    /**
     * 페이지네이션을 위한 페이지 배열을 생성합니다.
     * @param {number} currentPage - 현재 페이지
     * @param {number} totalPages - 전체 페이지 수
     * @returns {Object} 페이지네이션 정보
     */
    createPaginationInfo(currentPage, totalPages) {
        const maxPagesDisplayed = 5; // 한 번에 표시할 페이지 수
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesDisplayed / 2));
        let endPage = startPage + maxPagesDisplayed - 1;

        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = Math.max(1, endPage - maxPagesDisplayed + 1);
        }

        const pages = Array.from(
            { length: endPage - startPage + 1 },
            (_, i) => startPage + i
        );

        return {
            currentPage,
            totalPages,
            pages,
            hasPrev: currentPage > 1,
            hasNext: currentPage < totalPages,
            showFirstPage: startPage > 1,
            showLastPage: endPage < totalPages,
            showFirstEllipsis: startPage > 2,
            showLastEllipsis: endPage < totalPages - 1
        };
    }

    async getNoticeList(page, limit, searchOptions = {}) {
        const { searchType = 'all', keyword = '' } = searchOptions;
        const offset = (page - 1) * limit;

        // 검색 유형 유효성 검사
        if (!this.validateSearchType(searchType)) {
            throw new Error('유효하지 않은 검색 유형입니다.');
        }

        // 페이지네이션 유효성 검사
        if (!this.validatePagination(page, limit)) {
            throw new Error('유효하지 않은 페이지네이션 파라미터입니다.');
        }

        const notices = await this.noticeRepository.findBySearchType(searchType, keyword, offset, limit);
        const totalCount = await this.noticeRepository.count(searchType, keyword);
        const totalPages = Math.ceil(totalCount / limit);

        return {
            notices,
            pagination: {
                ...this.createPaginationInfo(page, totalPages),
                totalItems: totalCount,
                itemsPerPage: limit
            }
        };
    }

    async getNoticeDetail(noticeId) {
        const notice = await this.noticeRepository.findById(noticeId);
        if (!notice) {
            throw new Error('공지사항을 찾을 수 없습니다.');
        }
        return notice;
    }

    validateNoticeData(noticeData) {
        if (!noticeData.title || noticeData.title.trim().length === 0) {
            throw new Error('제목은 필수 입력 항목입니다.');
        }
        if (!noticeData.content || noticeData.content.trim().length === 0) {
            throw new Error('내용은 필수 입력 항목입니다.');
        }
        if (noticeData.title.length > 100) {
            throw new Error('제목은 100자를 초과할 수 없습니다.');
        }
    }

    async checkNoticeExists(noticeId) {
        const notice = await this.noticeRepository.findById(noticeId);
        if (!notice) {
            throw new Error('공지사항을 찾을 수 없습니다.');
        }
        return notice;
    }

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
