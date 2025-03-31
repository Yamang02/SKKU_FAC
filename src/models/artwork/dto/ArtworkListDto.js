import ArtworkSimpleDTO from './ArtworkSimpleDTO.js';

/**
 * 작품 목록을 위한 DTO
 * 페이지네이션 정보를 포함합니다.
 */
export default class ArtworkListDTO {
    constructor({ items = [], total = 0, page = null } = {}) {
        this.items = items.map(item => new ArtworkSimpleDTO(item));
        this.total = total;
        this.page = page;
    }

    toJSON() {
        return {
            items: this.items,
            total: this.total,
            page: this.page ? {
                currentPage: this.page.currentPage,
                totalPages: this.page.totalPages,
                itemsPerPage: this.page.options.limit,
                hasPrev: this.page.hasPrev,
                hasNext: this.page.hasNext,
                startPage: this.page.startPage,
                endPage: this.page.endPage,
                showFirstPage: this.page.showFirstPage,
                showLastPage: this.page.showLastPage,
                showFirstEllipsis: this.page.showFirstEllipsis,
                showLastEllipsis: this.page.showLastEllipsis,
                getPages: () => this.page.getPages(),
                getPageUrl: (pageNum) => this.page.getPageUrl(pageNum),
                getSortUrl: (field) => this.page.getSortUrl(field)
            } : null
        };
    }
}
