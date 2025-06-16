/**
 * 페이지네이션 처리를 위한 공통 클래스
 */
class Pagination {
    constructor(options = {}) {
        this.page = options.page || 1;
        this.limit = options.limit || 10;
        this.sort = options.sort || null;
        this.order = options.order || 'asc';

        // 서버에서 받아온 Page 객체 정보
        this.pageInfo = options.pageInfo || null;
    }

    /**
     * URL 쿼리 파라미터로 변환
     */
    toQueryParams() {
        const params = new URLSearchParams();
        params.set('page', this.page);
        params.set('limit', this.limit);

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
            limit: this.limit,
            sort: this.sort,
            order: this.order,
            pageInfo: this.pageInfo
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

    /**
     * 페이지 정보 설정
     * @param {Object} pageInfo - 서버에서 받아온 Page 객체 정보
     */
    setPageInfo(pageInfo) {
        this.pageInfo = pageInfo;
    }

    /**
     * 페이지 URL 생성
     * @param {number} page - 페이지 번호
     * @returns {string} - URL 쿼리 문자열
     */
    getPageUrl(page) {
        const params = new URLSearchParams(window.location.search);
        params.set('page', page);
        return `?${params.toString()}`;
    }

    /**
     * 현재 페이지 주변 페이지 번호 배열 반환
     * @param {number} range - 현재 페이지 주변에 표시할 페이지 수
     * @returns {number[]} - 페이지 번호 배열
     */
    getPageNumbers(range = 2) {
        if (!this.pageInfo) return [1];

        const currentPage = this.pageInfo.currentPage || this.page;
        const totalPages = this.pageInfo.totalPages || 1;

        // 최소 1페이지는 표시
        if (totalPages <= 1) return [1];

        // 표시할 시작 페이지와 끝 페이지 계산
        let startPage = Math.max(1, currentPage - range);
        let endPage = Math.min(totalPages, currentPage + range);

        // 표시할 페이지 수 보정
        if (endPage - startPage < range * 2) {
            if (startPage === 1) {
                endPage = Math.min(totalPages, 1 + range * 2);
            } else if (endPage === totalPages) {
                startPage = Math.max(1, totalPages - range * 2);
            }
        }

        // 페이지 번호 배열 생성
        const pages = [];
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return pages;
    }

    /**
     * 페이지네이션 UI 생성 및 업데이트
     * @param {HTMLElement} container - 페이지네이션을 렌더링할 컨테이너 요소
     */
    renderUI(container) {
        if (!container) return;

        const pageInfo = this.pageInfo || {};
        const currentPage = pageInfo.currentPage || this.page;
        const totalPages = pageInfo.totalPages || 1;
        const hasPrev = pageInfo.hasPrev || false;
        const hasNext = pageInfo.hasNext || false;

        let paginationHTML = '';

        // 이전 페이지 버튼
        if (hasPrev) {
            paginationHTML += `
                <a href="${this.getPageUrl(currentPage - 1)}" class="pagination__btn pagination__btn--prev">
                    <i class="fas fa-chevron-left"></i>
                </a>
            `;
        } else {
            paginationHTML += `
                <span class="pagination__btn pagination__btn--prev pagination__btn--disabled">
                    <i class="fas fa-chevron-left"></i>
                </span>
            `;
        }

        // 페이지 번호
        const pageNumbers = this.getPageNumbers();

        // 첫 페이지 버튼 (첫 페이지가 페이지 배열에 없는 경우)
        if (pageNumbers[0] > 1) {
            paginationHTML += `<a href="${this.getPageUrl(1)}" class="pagination__btn">1</a>`;
            if (pageNumbers[0] > 2) {
                paginationHTML += '<span class="pagination__ellipsis">...</span>';
            }
        }

        // 페이지 번호 버튼
        pageNumbers.forEach(page => {
            const isActive = page === currentPage;
            paginationHTML += `
                <a href="${this.getPageUrl(page)}" class="pagination__btn ${isActive ? 'pagination__btn--active' : ''}">
                    ${page}
                </a>
            `;
        });

        // 마지막 페이지 버튼 (마지막 페이지가 페이지 배열에 없는 경우)
        if (pageNumbers[pageNumbers.length - 1] < totalPages) {
            if (pageNumbers[pageNumbers.length - 1] < totalPages - 1) {
                paginationHTML += '<span class="pagination__ellipsis">...</span>';
            }
            paginationHTML += `<a href="${this.getPageUrl(totalPages)}" class="pagination__btn">${totalPages}</a>`;
        }

        // 다음 페이지 버튼
        if (hasNext) {
            paginationHTML += `
                <a href="${this.getPageUrl(currentPage + 1)}" class="pagination__btn pagination__btn--next">
                    <i class="fas fa-chevron-right"></i>
                </a>
            `;
        } else {
            paginationHTML += `
                <span class="pagination__btn pagination__btn--next pagination__btn--disabled">
                    <i class="fas fa-chevron-right"></i>
                </span>
            `;
        }

        // 페이지네이션 UI 업데이트
        container.innerHTML = paginationHTML;

        // 페이지네이션 버튼에 클릭 이벤트 추가
        this.attachEventHandlers(container);
    }

    /**
     * 페이지네이션 버튼에 이벤트 핸들러 추가
     * @param {HTMLElement} container - 페이지네이션 컨테이너 요소
     */
    attachEventHandlers(container) {
        const pageButtons = container.querySelectorAll('a.pagination__btn');
        pageButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const url = new URL(button.href);
                const page = url.searchParams.get('page');
                if (page) {
                    // 현재 페이지 업데이트
                    this.page = Number(page);

                    // 커스텀 이벤트 발생
                    const event = new CustomEvent('pagination:change', {
                        detail: { page: this.page }
                    });
                    container.dispatchEvent(event);

                    // URL 업데이트 (선택적으로 사용)
                    if (this.updateUrl !== false) {
                        const currentUrl = new URL(window.location.href);
                        currentUrl.searchParams.set('page', page);
                        window.history.pushState({}, '', currentUrl.toString());
                    }
                }
            });
        });
    }
}

export default Pagination;
