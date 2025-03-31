/**
 * 공지사항 검색 데이터를 위한 DTO
 */
export default class NoticeSearchDTO {
    constructor(data = {}) {
        this.page = parseInt(data.page) || 1;
        this.limit = parseInt(data.limit) || 10;
        this.searchType = data.searchType || 'all';
        this.keyword = data.keyword || '';
        this.status = data.status;
        this.isImportant = data.isImportant;
    }

    /**
     * 데이터 유효성을 검증합니다.
     * @throws {Error} 유효성 검증 실패시 에러를 던집니다.
     */
    validate() {
        if (this.page < 1) {
            throw new Error('페이지 번호는 1 이상이어야 합니다.');
        }
        if (this.limit < 1) {
            throw new Error('페이지당 항목 수는 1 이상이어야 합니다.');
        }
        if (!['all', 'title', 'content', 'author'].includes(this.searchType)) {
            throw new Error('유효하지 않은 검색 유형입니다.');
        }
    }

    /**
     * DTO를 일반 객체로 변환합니다.
     */
    toJSON() {
        const result = {
            page: this.page,
            limit: this.limit,
            searchType: this.searchType,
            keyword: this.keyword
        };

        if (this.status) {
            result.status = this.status;
        }
        if (typeof this.isImportant === 'boolean') {
            result.isImportant = this.isImportant;
        }

        return result;
    }
}
