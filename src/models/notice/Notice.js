/**
 * @typedef {Object} Notice
 * @property {number} id - 공지사항 ID
 * @property {string} title - 제목
 * @property {string} content - 내용
 * @property {string} author - 작성자 ID
 * @property {string} authorName - 작성자 이름
 * @property {string} createdAt - 생성일시
 * @property {string} updatedAt - 수정일시
 * @property {boolean} isImportant - 중요 공지 여부
 * @property {number} views - 조회수
 * @property {'active'|'inactive'} status - 상태
 */

/**
 * 새로운 공지사항 객체를 생성합니다.
 * @param {Object} data - 공지사항 데이터
 * @returns {Notice} 생성된 공지사항 객체
 */
export function createNotice(data) {
    return {
        id: data.id,
        title: data.title,
        content: data.content,
        author: data.author,
        authorName: data.authorName,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
        isImportant: data.isImportant || false,
        views: data.views || 0,
        status: data.status || 'active'
    };
}

/**
 * 공지사항 객체를 검증합니다.
 * @param {Notice} notice - 검증할 공지사항 객체
 * @returns {boolean} 유효성 여부
 */
export function validateNotice(notice) {
    return !!(
        notice.title &&
        notice.content &&
        notice.author &&
        notice.authorName &&
        ['active', 'inactive'].includes(notice.status)
    );
}
