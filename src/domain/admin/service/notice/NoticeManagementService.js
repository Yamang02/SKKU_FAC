import NoticeService from '../../../notice/service/NoticeService.js';

export default class NoticeManagementService {
    constructor() {
        this.noticeService = new NoticeService();
    }

    /**
     * 공지사항 목록을 조회합니다.
     * @param {Object} options - 페이지네이션 옵션
     * @returns {Promise<Object>} 공지사항 목록 데이터
     */
    async getNoticeList(options) {
        try {
            return await this.noticeService.getNoticeList(options);
        } catch (error) {
            console.error('공지사항 목록 조회 서비스 오류:', error);
            throw error;
        }
    }

    /**
     * 공지사항 상세 정보를 조회합니다.
     * @param {number} noticeId - 공지사항 ID
     * @returns {Promise<Object>} 공지사항 상세 데이터
     */
    async getNoticeDetail(noticeId) {
        try {
            return await this.noticeService.getNoticeDetail(noticeId);
        } catch (error) {
            console.error('공지사항 상세 조회 서비스 오류:', error);
            throw error;
        }
    }

    /**
     * 새 공지사항을 생성합니다.
     * @param {Object} noticeData - 공지사항 데이터
     * @returns {Promise<number>} 생성된 공지사항 ID
     */
    async createNotice(noticeData) {
        try {
            return await this.noticeService.createNotice(noticeData);
        } catch (error) {
            console.error('공지사항 생성 서비스 오류:', error);
            throw error;
        }
    }

    /**
     * 공지사항을 수정합니다.
     * @param {number} noticeId - 공지사항 ID
     * @param {Object} noticeData - 수정할 공지사항 데이터
     * @returns {Promise<boolean>} 성공 여부
     */
    async updateNotice(noticeId, noticeData) {
        try {
            return await this.noticeService.updateNotice(noticeId, noticeData);
        } catch (error) {
            console.error('공지사항 수정 서비스 오류:', error);
            throw error;
        }
    }

    /**
     * 공지사항을 삭제합니다.
     * @param {number} noticeId - 공지사항 ID
     * @returns {Promise<boolean>} 성공 여부
     */
    async deleteNotice(noticeId) {
        try {
            return await this.noticeService.deleteNotice(noticeId);
        } catch (error) {
            console.error('공지사항 삭제 서비스 오류:', error);
            throw error;
        }
    }
}
