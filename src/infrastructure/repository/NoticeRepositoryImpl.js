import NoticeRepository from '../../domain/notice/repository/NoticeRepository.js';
import * as noticeData from '../data/notice.js';

/**
 * Notice 리포지토리 구현체
 * 실제 데이터 저장소와의 상호작용을 담당합니다.
 */
class NoticeRepositoryImpl extends NoticeRepository {
    /**
     * 모든 공지사항을 검색 조건에 따라 조회합니다.
     * @param {string} searchType - 검색 유형 (all, title, content)
     * @param {string} keyword - 검색어
     * @param {number} offset - 시작 위치
     * @param {number} limit - 조회할 항목 수
     * @returns {Promise<Array>} 공지사항 목록
     */
    async findBySearchType(searchType, keyword, offset, limit) {
        const notices = noticeData.findBySearchType(searchType, keyword);
        return notices.slice(offset, offset + limit);
    }

    /**
     * 공지사항의 총 개수를 조회합니다.
     * @param {string} searchType - 검색 유형
     * @param {string} keyword - 검색어
     * @returns {Promise<number>} 총 공지사항 수
     */
    async count(searchType, keyword) {
        const notices = noticeData.findBySearchType(searchType, keyword);
        return notices.length;
    }

    /**
     * ID로 공지사항을 조회합니다.
     * @param {number} id - 공지사항 ID
     * @returns {Promise<Object>} 공지사항 객체
     */
    async findById(id) {
        return noticeData.findById(id);
    }

    /**
     * 공지사항의 조회수를 증가시킵니다.
     * @param {number} id - 공지사항 ID
     * @returns {Promise<void>}
     */
    async incrementViews(id) {
        return noticeData.incrementViews(id);
    }

    /**
     * 이전/다음 공지사항 ID를 조회합니다.
     * @param {number} currentId - 현재 공지사항 ID
     * @returns {Promise<Object>} 이전/다음 공지사항 ID
     */
    async findAdjacentIds(currentId) {
        const notices = noticeData.findBySearchType('all', '');
        const currentIndex = notices.findIndex(notice => notice.id === currentId);

        return {
            prevId: currentIndex > 0 ? notices[currentIndex - 1].id : null,
            nextId: currentIndex < notices.length - 1 ? notices[currentIndex + 1].id : null
        };
    }

    /**
     * 모든 공지사항을 조회합니다.
     * @returns {Promise<Array>} 공지사항 목록
     */
    async findAll() {
        return noticeData.findAll();
    }
}

export default NoticeRepositoryImpl;
