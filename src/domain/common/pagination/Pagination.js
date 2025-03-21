import PaginationOptions from './PaginationOptions.js';

/**
 * 페이지네이션 값 객체
 */
class Pagination {
    constructor(totalItems, options = {}) {
        this.options = new PaginationOptions(options);
        this.totalItems = Math.max(0, parseInt(totalItems));

        this.totalPages = Math.ceil(this.totalItems / this.options.limit);
        this.startPage = this.calculateStartPage();
        this.endPage = this.calculateEndPage();

        this.hasPrevPage = this.options.page > 1;
        this.hasNextPage = this.options.page < this.totalPages;
        this.showStartEllipsis = this.startPage > 1;
        this.showEndEllipsis = this.endPage < this.totalPages;
    }

    calculateStartPage() {
        const half = Math.floor(this.options.displayPageCount / 2);
        const start = this.options.page - half;
        return Math.max(1, Math.min(start, this.totalPages - this.options.displayPageCount + 1));
    }

    calculateEndPage() {
        return Math.min(
            this.startPage + this.options.displayPageCount - 1,
            this.totalPages
        );
    }

    getPageNumbers() {
        return Array.from(
            { length: this.endPage - this.startPage + 1 },
            (_, i) => this.startPage + i
        );
    }

    toJSON() {
        return {
            currentPage: this.options.page,
            totalItems: this.totalItems,
            totalCount: this.totalItems,
            itemsPerPage: this.options.limit,
            totalPages: this.totalPages,
            offset: this.options.offset,
            hasPrev: this.hasPrevPage,
            hasNext: this.hasNextPage,
            showFirstPage: this.startPage > 1,
            showLastPage: this.endPage < this.totalPages,
            showFirstEllipsis: this.startPage > 2,
            showLastEllipsis: this.endPage < this.totalPages - 1,
            pages: this.getPageNumbers()
        };
    }
}

export default Pagination;
