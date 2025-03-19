import NoticeDomainService from '../../../domain/notice/service/NoticeDomainService.js';

/**
 * Notice 애플리케이션 서비스
 * 공지사항 관련 유스케이스를 구현합니다.
 */
class NoticeApplicationService {
    constructor(noticeRepository, noticeDomainService) {
        this.noticeRepository = noticeRepository;
        this.noticeDomainService = noticeDomainService || new NoticeDomainService();
    }

    /**
     * 공지사항 목록을 조회합니다.
     * @param {Object} params - 조회 파라미터
     * @returns {Promise<Object>} 공지사항 목록과 페이지네이션 정보
     */
    async getNoticeList({ searchType = 'all', keyword = '', page = 1, limit = 10 } = {}) {
        // 입력값 검증
        if (!this.noticeDomainService.validateSearchType(searchType)) {
            throw new Error('유효하지 않은 검색 유형입니다.');
        }
        if (!this.noticeDomainService.validatePagination(page, limit)) {
            throw new Error('유효하지 않은 페이지네이션 파라미터입니다.');
        }

        // 데이터 조회
        const offset = (page - 1) * limit;
        const [notices, totalCount] = await Promise.all([
            this.noticeRepository.findBySearchType(searchType, keyword, offset, limit),
            this.noticeRepository.count(searchType, keyword)
        ]);

        // 페이지네이션 정보 계산
        const totalPages = Math.ceil(totalCount / limit);
        const startPage = Math.max(1, page - 2);
        const endPage = Math.min(totalPages, startPage + 4);

        return {
            notices,
            pagination: {
                currentPage: page,
                totalPages,
                totalCount,
                hasNext: page < totalPages,
                hasPrev: page > 1,
                startPage,
                endPage,
                showFirstPage: startPage > 1,
                showLastPage: endPage < totalPages,
                showFirstEllipsis: startPage > 2,
                showLastEllipsis: endPage < totalPages - 1,
                pages: Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)
            }
        };
    }

    /**
     * 공지사항 상세 정보를 조회합니다.
     * @param {number} noticeId - 공지사항 ID
     * @returns {Promise<Object>} 공지사항 상세 정보
     */
    async getNoticeDetail(noticeId) {
        const notice = await this.noticeRepository.findById(noticeId);
        if (!notice) {
            throw new Error('공지사항을 찾을 수 없습니다.');
        }

        // 조회수 증가
        await this.noticeRepository.incrementViews(noticeId);

        // 이전/다음 글 ID 조회
        const adjacentIds = await this.noticeRepository.findAdjacentIds(noticeId);

        return {
            ...notice,
            prevId: adjacentIds.prevId,
            nextId: adjacentIds.nextId
        };
    }
}

export default NoticeApplicationService;
