/**
 * 페이지네이션 처리를 위한 공통 클래스
 */
class Pagination {
    constructor(options = {}) {
        this.page = options.page || 1;
        this.size = options.size || 10;
        this.sort = options.sort || null;
        this.order = options.order || 'asc';
    }

    /**
     * URL 쿼리 파라미터로 변환
     */
    toQueryParams() {
        const params = new URLSearchParams();
        params.set('page', this.page);
        params.set('size', this.size);

        if (this.sort) {
            params.set('sort', this.sort);
            params.set('order', this.order);
        }

        return params.toString();
    }

    /**
     * 현재 설정으로 새로운 페이지네이션 객체 생성
     */
    clone() {
        return new Pagination({
            page: this.page,
            size: this.size,
            sort: this.sort,
            order: this.order
        });
    }

    /**
     * 정렬 설정 변경
     */
    setSort(field) {
        if (this.sort === field) {
            this.order = this.order === 'asc' ? 'desc' : 'asc';
        } else {
            this.sort = field;
            this.order = 'asc';
        }
    }
}

export default Pagination;
