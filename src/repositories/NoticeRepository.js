import {
    findNotices,
    findNoticeById,
    createNotice,
    updateNotice,
    deleteNotice,
    findImportantNotices
} from '../config/data/notice.js';

export default class NoticeRepository {
    /**
     * 모든 공지사항을 반환합니다.
     * @returns {Promise<Array<import('../models/notice/Notice').Notice>>} 공지사항 목록
     */
    async findNotices(params) {
        return findNotices(params);
    }

    /**
     * ID로 공지사항을 찾습니다.
     * @param {number} id - 공지사항 ID
     * @returns {Promise<import('../models/notice/Notice').Notice|null>} 찾은 공지사항 또는 null
     */
    async findNoticeById(id) {
        return findNoticeById(id);
    }

    /**
     * 새로운 공지사항을 생성합니다.
     * @param {Object} data - 공지사항 데이터
     * @returns {Promise<import('../models/notice/Notice').Notice>} 생성된 공지사항
     */
    async createNotice(data) {
        return createNotice(data);
    }

    /**
     * 공지사항을 수정합니다.
     * @param {number} id - 공지사항 ID
     * @param {Object} data - 수정할 데이터
     * @returns {Promise<import('../models/notice/Notice').Notice|null>} 수정된 공지사항 또는 null
     */
    async updateNotice(id, data) {
        return updateNotice(id, data);
    }

    /**
     * 공지사항을 삭제합니다.
     * @param {number} id - 공지사항 ID
     * @returns {Promise<boolean>} 성공 여부
     */
    async deleteNotice(id) {
        return deleteNotice(id);
    }

    /**
     * 중요 공지사항을 조회합니다.
     * @returns {Promise<Array<import('../models/notice/Notice').Notice>>} 중요 공지사항 목록
     */
    async findImportantNotices() {
        return findImportantNotices();
    }

    // /**
    //  * 공지사항의 댓글을 조회합니다.
    //  * @param {number} noticeId - 공지사항 ID
    //  * @param {Object} options - 페이지네이션 옵션
    //  * @returns {Promise<Object>} 댓글 목록과 페이지네이션 정보
    //  */
    // async findComments(noticeId, options) {
    //     return findComments(noticeId, options);
    // }
}
