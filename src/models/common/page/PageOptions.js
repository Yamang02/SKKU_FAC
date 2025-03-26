/**
 * 페이지 옵션 값 객체
 */
class PageOptions {
    constructor({
        page = 1,
        limit = 10,
        displayPageCount = 5,
        sortField = null,
        sortOrder = 'asc',
        filters = {},
        baseUrl = '',
        previousUrl = null,
        currentUrl = null
    } = {}) {
        this.page = Math.max(1, parseInt(page));
        this.limit = Math.max(1, parseInt(limit));
        this.displayPageCount = Math.max(1, parseInt(displayPageCount));
        this.offset = this.calculateOffset();

        this.sortField = sortField;
        this.sortOrder = sortOrder;
        this.filters = filters;
        this.baseUrl = baseUrl;
        this.previousUrl = previousUrl;
        this.currentUrl = currentUrl;
    }

    calculateOffset() {
        return (this.page - 1) * this.limit;
    }

    toJSON() {
        return {
            page: this.page,
            limit: this.limit,
            offset: this.offset,
            displayPageCount: this.displayPageCount,
            sortField: this.sortField,
            sortOrder: this.sortOrder,
            filters: this.filters,
            baseUrl: this.baseUrl,
            previousUrl: this.previousUrl,
            currentUrl: this.currentUrl
        };
    }
}

export default PageOptions;
