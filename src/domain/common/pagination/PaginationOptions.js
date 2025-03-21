/**
 * 페이지네이션 옵션 값 객체
 */
class PaginationOptions {
    constructor({
        page = 1,
        limit = 10,
        displayPageCount = 5
    } = {}) {
        this.page = Math.max(1, parseInt(page));
        this.limit = Math.max(1, parseInt(limit));
        this.displayPageCount = Math.max(1, parseInt(displayPageCount));
        this.offset = this.calculateOffset();
    }

    calculateOffset() {
        return (this.page - 1) * this.limit;
    }

    toJSON() {
        return {
            page: this.page,
            limit: this.limit,
            offset: this.offset,
            displayPageCount: this.displayPageCount
        };
    }
}

export default PaginationOptions;
