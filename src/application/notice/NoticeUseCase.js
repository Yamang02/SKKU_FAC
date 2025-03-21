/**
 * Notice 유스케이스
 * 공지사항 관련 애플리케이션 로직을 처리합니다.
 */
class NoticeUseCase {
    constructor(noticeService, commentService) {
        this.noticeService = noticeService;
        this.commentService = commentService;
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

    /**
     * 공지사항 목록을 조회합니다.
     * @param {Object} params - 조회 파라미터
     * @param {number} params.page - 페이지 번호
     * @param {number} params.limit - 페이지당 항목 수
     * @param {string} params.searchType - 검색 유형
     * @param {string} params.keyword - 검색어
     */
    async getNoticeList({ page = 1, limit = 10, searchType = 'all', keyword = '' }) {
        // 유효성 검사
        if (!this.noticeService.validateSearchType(searchType)) {
            throw new Error('유효하지 않은 검색 유형입니다.');
        }
        if (!this.noticeService.validatePagination(page, limit)) {
            throw new Error('유효하지 않은 페이지네이션 파라미터입니다.');
        }

        const offset = (page - 1) * limit;
        const notices = await this.noticeService.findBySearchType(searchType, keyword, offset, limit);
        const totalCount = await this.noticeService.count(searchType, keyword);
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

    /**
     * 공지사항 상세 정보를 조회합니다.
     * @param {number} noticeId - 공지사항 ID
     * @param {number} commentPage - 댓글 페이지 번호
     */
    async getNoticeDetail(noticeId, commentPage = 1) {
        const notice = await this.noticeService.findById(noticeId);
        await this.noticeService.incrementViews(noticeId);

        const { prevId, nextId } = await this.noticeService.findAdjacentIds(noticeId);
        const comments = await this.commentService.getCommentsByNoticeId(noticeId, commentPage);

        return {
            notice: {
                ...notice,
                prevId,
                nextId
            },
            ...comments
        };
    }

    /**
     * 새 공지사항을 생성합니다.
     * @param {Object} noticeData - 공지사항 데이터
     * @param {number} authorId - 작성자 ID
     */
    async createNotice(noticeData, authorId) {
        this.noticeService.validateNoticeData(noticeData);
        return this.noticeService.create({ ...noticeData, authorId });
    }

    /**
     * 공지사항을 수정합니다.
     * @param {number} noticeId - 공지사항 ID
     * @param {Object} noticeData - 수정할 데이터
     */
    async updateNotice(noticeId, noticeData) {
        await this.noticeService.findById(noticeId);
        this.noticeService.validateNoticeData(noticeData);
        return this.noticeService.update(noticeId, noticeData);
    }

    /**
     * 공지사항을 삭제합니다.
     * @param {number} noticeId - 공지사항 ID
     */
    async deleteNotice(noticeId) {
        await this.noticeService.findById(noticeId);
        await this.commentService.deleteAllByNoticeId(noticeId);
        return this.noticeService.delete(noticeId);
    }
}

export default NoticeUseCase;
