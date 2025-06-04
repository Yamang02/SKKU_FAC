/**
 * 페이지네이션을 위한 클래스
 */
export default class Page {
    constructor(totalItems, options = {}) {
        const { page = 1, limit = 12 } = options;

        this.currentPage = Number(page);
        this.itemsPerPage = Number(limit);
        this.totalItems = Number(totalItems);
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        this.hasPrev = this.currentPage > 1;
        this.hasNext = this.currentPage < this.totalPages;
    }

    /**
     * 현재 페이지 번호를 반환합니다.
     */
    getCurrentPage() {
        return this.currentPage;
    }

    /**
     * 페이지당 아이템 수를 반환합니다.
     */
    getItemsPerPage() {
        return this.itemsPerPage;
    }

    /**
     * 전체 아이템 수를 반환합니다.
     */
    getTotalItems() {
        return this.totalItems;
    }

    /**
     * 전체 페이지 수를 반환합니다.
     */
    getTotalPages() {
        return this.totalPages;
    }

    /**
     * 이전 페이지 존재 여부를 반환합니다.
     */
    getHasPrev() {
        return this.hasPrev;
    }

    /**
     * 다음 페이지 존재 여부를 반환합니다.
     */
    getHasNext() {
        return this.hasNext;
    }
}
