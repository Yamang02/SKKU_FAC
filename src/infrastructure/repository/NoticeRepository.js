import Notice from '../../domain/notice/entity/Notice.js';
import noticesData from '../data/notice.js';

/**
 * 공지사항 리포지토리
 * 공지사항 데이터의 영속성을 관리합니다.
 */
class NoticeRepository {
    constructor() {
        this.notices = noticesData.map(notice => new Notice(notice));
    }

    /**
     * 공지사항 목록을 검색 조건에 따라 가져옵니다.
     * @param {Object} filters 검색 필터
     * @returns {Object} 공지사항 목록과 총 개수
     */
    async searchNotices(filters = {}) {
        const { keyword, isImportant, status, limit = 10, offset = 0 } = filters;

        // 필터링 로직
        let filteredNotices = [...this.notices];

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

        return {
            items: paginatedNotices,
            total
        };
    }

    /**
     * ID로 공지사항을 조회합니다.
     * @param {number} id 공지사항 ID
     * @returns {Notice|null} 공지사항 엔티티
     */
    async findById(id) {
        return this.notices.find(notice => notice.id === parseInt(id)) || null;
    }

    /**
     * 공지사항을 생성합니다.
     * @param {Object} noticeData 공지사항 데이터
     * @returns {Notice} 생성된 공지사항 엔티티
     */
    async create(noticeData) {
        const newNotice = new Notice({
            id: this.notices.length + 1,
            ...noticeData,
            views: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        this.notices.push(newNotice);
        return newNotice;
    }

    /**
     * 공지사항을 수정합니다.
     * @param {number} id 공지사항 ID
     * @param {Object} updateData 수정할 데이터
     * @returns {Notice|null} 수정된 공지사항 엔티티
     */
    async update(id, updateData) {
        const notice = await this.findById(id);
        if (!notice) return null;

        notice.update(updateData);
        return notice;
    }

    /**
     * 공지사항을 삭제합니다.
     * @param {number} id 공지사항 ID
     * @returns {boolean} 삭제 성공 여부
     */
    async delete(id) {
        const index = this.notices.findIndex(notice => notice.id === parseInt(id));
        if (index === -1) return false;

        this.notices.splice(index, 1);
        return true;
    }

    /**
     * 공지사항 조회수를 증가시킵니다.
     * @param {number} id 공지사항 ID
     * @returns {boolean} 증가 성공 여부
     */
    async incrementViews(id) {
        const notice = await this.findById(id);
        if (!notice) return false;

        notice.incrementViews();
        return true;
    }
}

export default NoticeRepository;
