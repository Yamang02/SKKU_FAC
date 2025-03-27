import { findAll } from '../config/data/notice.js';

export default class NoticeRepository {
    constructor() {
        this.notices = findAll();
    }

    /**
     * 모든 공지사항을 조회합니다.
     */
    async findNotices({ page = 1, limit = 10, search, status, isImportant } = {}) {
        let filteredNotices = [...this.notices];

        if (search) {
            filteredNotices = filteredNotices.filter(notice =>
                notice.title.includes(search) ||
                notice.content.includes(search)
            );
        }

        if (status) {
            filteredNotices = filteredNotices.filter(notice =>
                notice.status === status
            );
        }

        if (isImportant !== undefined) {
            filteredNotices = filteredNotices.filter(notice =>
                notice.is_important === (isImportant === 'true')
            );
        }

        const start = (page - 1) * limit;
        const end = start + limit;
        const total = filteredNotices.length;

        return {
            items: filteredNotices.slice(start, end),
            total,
            page: Number(page),
            totalPages: Math.ceil(total / limit)
        };
    }

    /**
     * ID로 공지사항을 조회합니다.
     */
    async findNoticeById(id) {
        return this.notices.find(notice => notice.id === Number(id));
    }

    /**
     * 새로운 공지사항을 생성합니다.
     */
    async createNotice(noticeData) {
        const newNotice = {
            id: (Math.max(...this.notices.map(n => n.id)) + 1).toString(),
            ...noticeData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        this.notices.push(newNotice);
        return newNotice;
    }

    /**
     * 공지사항을 수정합니다.
     */
    async updateNotice(id, noticeData) {
        const index = this.notices.findIndex(notice => notice.id === id);
        if (index === -1) return null;

        this.notices[index] = {
            ...this.notices[index],
            ...noticeData,
            updated_at: new Date().toISOString()
        };
        return this.notices[index];
    }

    /**
     * 공지사항을 삭제합니다.
     */
    async deleteNotice(id) {
        const index = this.notices.findIndex(notice => notice.id === id);
        if (index === -1) return false;

        this.notices.splice(index, 1);
        return true;
    }

    /**
     * 중요 공지사항을 조회합니다.
     */
    async findImportantNotices() {
        return this.notices.filter(notice => notice.is_important);
    }

    /**
     * 공지사항의 댓글을 조회합니다.
     */
    async findComments(noticeId, { page = 1, limit = 10 } = {}) {
        // 임시로 더미 댓글 데이터 반환
        const dummyComments = [
            {
                id: 1,
                content: '좋은 공지사항 감사합니다.',
                author: '홍길동',
                created_at: new Date().toISOString()
            },
            {
                id: 2,
                content: '잘 읽었습니다.',
                author: '김철수',
                created_at: new Date().toISOString()
            }
        ];

        return {
            items: dummyComments,
            total: dummyComments.length,
            page: Number(page),
            totalPages: Math.ceil(dummyComments.length / limit)
        };
    }
}
