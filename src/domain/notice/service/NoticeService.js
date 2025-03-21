import NoticeRepositoryImpl from '../../../infrastructure/repository/NoticeRepositoryImpl.js';

/**
 * Notice 서비스
 * 공지사항 관련 도메인 로직을 처리합니다.
 */
class NoticeService {
    constructor() {
        this.noticeRepository = new NoticeRepositoryImpl();
    }

    async findBySearchType(searchType, keyword, offset, limit) {
        return this.noticeRepository.findBySearchType(searchType, keyword, offset, limit);
    }

    async count(searchType, keyword) {
        return this.noticeRepository.count(searchType, keyword);
    }

    async findById(noticeId) {
        const notice = await this.noticeRepository.findById(noticeId);
        if (!notice) {
            throw new Error('공지사항을 찾을 수 없습니다.');
        }
        return notice;
    }

    async incrementViews(noticeId) {
        return this.noticeRepository.incrementViews(noticeId);
    }

    async findAdjacentIds(currentId) {
        return this.noticeRepository.findAdjacentIds(currentId);
    }

    validateNoticeData(noticeData) {
        if (!this.validateTitle(noticeData.title)) {
            throw new Error('제목이 유효하지 않습니다. (2-100자)');
        }
        if (!this.validateContent(noticeData.content)) {
            throw new Error('내용이 유효하지 않습니다. (10-5000자)');
        }
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
        const trimmedTitle = title.trim();
        return trimmedTitle.length >= 2 && trimmedTitle.length <= 100;
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
        const trimmedContent = content.trim();
        return trimmedContent.length >= 10 && trimmedContent.length <= 5000;
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

export default NoticeService;
