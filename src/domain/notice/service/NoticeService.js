import Notice from '../entity/Notice.js';
import NoticeDto from '../dto/NoticeDto.js';
import * as noticeData from '../../../infrastructure/data/notice.js';

/**
 * Notice 서비스
 * 공지사항 관련 도메인 로직을 처리합니다.
 */
class NoticeService {
    /**
     * NoticeService 생성자
     * @param {NoticeRepository} noticeRepository - 공지사항 리포지토리
     */
    constructor(noticeRepository) {
        this.noticeRepository = noticeRepository;
    }

    /**
     * 공지사항 목록을 조회합니다.
     * @param {Object} params - 검색 파라미터
     */
    async searchNotices(params) {
        return this.noticeRepository.searchNotices(params);
    }

    /**
     * 공지사항 ID로 공지사항을 조회합니다.
     * @param {number} id - 공지사항 ID
     */
    async findById(id) {
        const notice = await noticeData.findById(parseInt(id));
        if (!notice) return null;

        const noticeEntity = new Notice(notice);
        return new NoticeDto(noticeEntity);
    }

    /**
     * 공지사항을 생성합니다.
     * @param {Object} noticeData - 공지사항 데이터
     */
    async create(noticeData) {
        const notice = await this.noticeRepository.create(noticeData);
        return new NoticeDto(notice);
    }

    /**
     * 공지사항을 수정합니다.
     * @param {number} id - 공지사항 ID
     * @param {Object} updateData - 수정할 데이터
     */
    async update(id, updateData) {
        const notice = await this.noticeRepository.update(id, updateData);
        if (!notice) return null;
        return new NoticeDto(notice);
    }

    /**
     * 공지사항을 삭제합니다.
     * @param {number} id - 공지사항 ID
     */
    async delete(id) {
        return await this.noticeRepository.delete(id);
    }

    /**
     * 공지사항 조회수를 증가시킵니다.
     * @param {number} id - 공지사항 ID
     */
    async incrementViews(id) {
        return await this.noticeRepository.incrementViews(id);
    }

    /**
     * 공지사항 목록을 검색 조건에 따라 가져옵니다.
     * @param {Object} filters 검색 필터
     * @returns {Object} 공지사항 목록과 총 개수
     */
    async searchNoticesWithFilters(filters = {}) {
        const { keyword, isImportant, status, limit = 10, offset = 0 } = filters;

        // 필터링 로직
        let filteredNotices = await noticeData.findAll();

        if (keyword) {
            const searchTerm = keyword.toLowerCase();
            filteredNotices = filteredNotices.filter(notice =>
                notice.title.toLowerCase().includes(searchTerm) ||
                notice.content.toLowerCase().includes(searchTerm)
            );
        }

        if (isImportant !== undefined) {
            filteredNotices = filteredNotices.filter(notice =>
                notice.isImportant === isImportant
            );
        }

        if (status) {
            filteredNotices = filteredNotices.filter(notice =>
                notice.status === status
            );
        }

        // 총 개수
        const total = filteredNotices.length;

        // 페이지네이션
        const paginatedNotices = filteredNotices.slice(offset, offset + limit);

        // 엔티티 변환
        const noticeEntities = paginatedNotices.map(n => new Notice(n));

        return {
            items: noticeEntities.map(n => new NoticeDto(n).toListDTO()),
            total
        };
    }

    async findBySearchType(searchType, keyword, offset, limit) {
        return this.noticeRepository.findBySearchType(searchType, keyword, offset, limit);
    }

    async count(searchType, keyword) {
        return this.noticeRepository.count(searchType, keyword);
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
     * 페이지네이션을 위한 페이지 배열을 생성합니다.
     * @param {Object} params - 페이지네이션 파라미터
     * @param {number} params.currentPage - 현재 페이지
     * @param {number} params.totalItems - 전체 아이템 수
     * @param {number} params.itemsPerPage - 페이지당 아이템 수
     * @returns {Object} 페이지네이션 정보
     */
    createPaginationInfo({ currentPage, totalItems, itemsPerPage }) {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const maxPagesDisplayed = 5;
        const startPage = Math.max(1, currentPage - Math.floor(maxPagesDisplayed / 2));
        const endPage = Math.min(totalPages, startPage + maxPagesDisplayed - 1);
        const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

        return {
            totalItems,
            currentPage,
            totalPages,
            itemsPerPage,
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
     * 공지사항 상세 정보와 댓글을 조회합니다.
     * @param {number} noticeId - 공지사항 ID
     * @param {Object} commentParams - 댓글 조회 파라미터
     * @param {number} commentParams.page - 댓글 페이지 번호
     * @param {number} commentParams.limit - 페이지당 댓글 수
     */
    async getNoticeDetail(noticeId, { _page = 1, _limit = 10 } = {}) {
        const notice = await this.findById(noticeId);
        await this.incrementViews(noticeId);

        const { prevId, nextId } = await this.findAdjacentIds(noticeId);
        notice.prevId = prevId;
        notice.nextId = nextId;

        return notice;
    }

    async getNoticeById(id) {
        try {
            const notice = await this.noticeRepository.findById(id);
            if (!notice) {
                throw new Error('공지사항을 찾을 수 없습니다.');
            }
            return notice;
        } catch (error) {
            throw new Error(`공지사항 조회 중 오류가 발생했습니다: ${error.message}`);
        }
    }

    async getRecentNotices(limit) {
        try {
            const notices = await this.noticeRepository.findAll();
            return notices
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, limit);
        } catch (error) {
            console.error('Error in getRecentNotices:', error);
            return [];
        }
    }
}

export default NoticeService;
