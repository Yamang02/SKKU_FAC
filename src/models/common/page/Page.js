import PageOptions from './PageOptions.js';

/**
 * 페이지 처리를 위한 값 객체
 */
class Page {
    constructor(totalItems, options = {}) {
        this.options = new PageOptions(options);
        this.totalItems = Math.max(0, parseInt(totalItems));
        this.initialize();
    }

    initialize() {
        // 기본 페이지네이션 계산
        this.totalPages = Math.ceil(this.totalItems / this.options.limit);
        this.currentPage = this.options.page;
        this.startPage = this.calculateStartPage();
        this.endPage = this.calculateEndPage();

        // 페이지 상태
        this.hasPrev = this.currentPage > 1;
        this.hasNext = this.currentPage < this.totalPages;
        this.showFirstPage = this.startPage > 1;
        this.showLastPage = this.endPage < this.totalPages;
        this.showFirstEllipsis = this.startPage > 2;
        this.showLastEllipsis = this.endPage < this.totalPages - 1;

        // 정렬 및 필터링 상태
        this.sortField = this.options.sortField;
        this.sortOrder = this.options.sortOrder;
        this.filters = this.options.filters;

        // URL 관련
        this.baseUrl = this.options.baseUrl;
        this.previousUrl = this.options.previousUrl;
        this.currentUrl = this.options.currentUrl;
    }

    calculateStartPage() {
        const half = Math.floor(this.options.displayPageCount / 2);
        const start = this.currentPage - half;
        return Math.max(1, Math.min(start, this.totalPages - this.options.displayPageCount + 1));
    }

    calculateEndPage() {
        return Math.min(
            this.startPage + this.options.displayPageCount - 1,
            this.totalPages
        );
    }

    getPages() {
        return Array.from(
            { length: this.endPage - this.startPage + 1 },
            (_, i) => this.startPage + i
        );
    }

    buildQueryParams(overrides = {}) {
        const params = new URLSearchParams();

        // 기본 페이지네이션 파라미터
        if (overrides.page) {
            params.set('page', overrides.page);
        }

        // 정렬 파라미터
        if (this.sortField && !overrides.skipSort) {
            params.set('sort', this.sortField);
            params.set('order', this.sortOrder);
        }

        // 필터 파라미터
        if (this.filters && !overrides.skipFilters) {
            Object.entries(this.filters).forEach(([key, value]) => {
                if (value) params.set(key, value);
            });
        }

        return params;
    }

    getPageUrl(pageNum) {
        const params = this.buildQueryParams({ page: pageNum });
        return `${this.baseUrl}?${params.toString()}`;
    }

    getSortUrl(field) {
        const newOrder = field === this.sortField && this.sortOrder === 'asc' ? 'desc' : 'asc';
        const params = this.buildQueryParams({
            sort: field,
            order: newOrder
        });
        return `${this.baseUrl}?${params.toString()}`;
    }

    getSafeReturnUrl() {
        if (this.previousUrl && !this.previousUrl.includes('/error')) {
            return this.previousUrl;
        }
        if (this.currentUrl && this.currentUrl.includes('/admin')) {
            return '/admin';
        }
        return '/';
    }

    static getCurrentPageUrl(req) {
        return `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    }

    static getPreviousPageUrl(req) {
        return req.headers.referer || '/';
    }

    toJSON() {
        return {
            currentPage: this.currentPage,
            totalItems: this.totalItems,
            totalPages: this.totalPages,
            itemsPerPage: this.options.limit,
            hasPrev: this.hasPrev,
            hasNext: this.hasNext,
            showFirstPage: this.showFirstPage,
            showLastPage: this.showLastPage,
            showFirstEllipsis: this.showFirstEllipsis,
            showLastEllipsis: this.showLastEllipsis,
            pages: this.getPages(),
            sortField: this.sortField,
            sortOrder: this.sortOrder,
            filters: this.filters,
            baseUrl: this.baseUrl,
            previousUrl: this.previousUrl,
            currentUrl: this.currentUrl,
            getPageUrl: this.getPageUrl.bind(this),
            getSortUrl: this.getSortUrl.bind(this),
            getSafeReturnUrl: this.getSafeReturnUrl.bind(this)
        };
    }
}

export default Page;
