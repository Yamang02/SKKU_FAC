import ResponseBuilder from './ResponseBuilder.js';
import Page from './Page.js';

/**
 * 페이지네이션된 응답을 생성하는 클래스
 * Page 클래스와 ResponseBuilder를 통합하여 일관된 페이지네이션 응답을 제공합니다.
 */
export default class PaginatedResponse {
    /**
     * 페이지네이션된 응답을 생성합니다.
     * @param {Array} items - 데이터 배열
     * @param {number} totalItems - 전체 아이템 수
     * @param {object} options - 페이지네이션 옵션
     * @param {number} options.page - 현재 페이지 번호
     * @param {number} options.limit - 페이지당 아이템 수
     * @param {string} options.message - 응답 메시지
     * @param {object} options.metadata - 추가 메타데이터
     * @returns {ResponseBuilder} ResponseBuilder 인스턴스
     */
    static create(items, totalItems, options = {}) {
        const {
            page = 1,
            limit = 10,
            message = null,
            metadata = {}
        } = options;

        // Page 객체 생성
        const pageInfo = new Page(totalItems, { page, limit });

        // 페이지네이션 메타데이터 구성
        const paginationMetadata = {
            currentPage: pageInfo.getCurrentPage(),
            totalPages: pageInfo.getTotalPages(),
            totalItems: pageInfo.getTotalItems(),
            itemsPerPage: pageInfo.getItemsPerPage(),
            hasNext: pageInfo.getHasNext(),
            hasPrev: pageInfo.getHasPrev(),
            // 추가 유용한 정보
            startIndex: (pageInfo.getCurrentPage() - 1) * pageInfo.getItemsPerPage() + 1,
            endIndex: Math.min(pageInfo.getCurrentPage() * pageInfo.getItemsPerPage(), totalItems),
            isEmpty: totalItems === 0,
            isFirstPage: pageInfo.getCurrentPage() === 1,
            isLastPage: pageInfo.getCurrentPage() === pageInfo.getTotalPages()
        };

        // ResponseBuilder를 사용하여 응답 생성
        return ResponseBuilder.success({
            items: items || [],
            pagination: paginationMetadata
        }, message)
            .setMetadata({
                responseType: 'paginated',
                generatedAt: new Date().toISOString(),
                ...metadata
            });
    }

    /**
     * 커서 기반 페이지네이션 응답을 생성합니다.
     * @param {Array} items - 데이터 배열
     * @param {object} cursor - 커서 정보
     * @param {string|number} cursor.next - 다음 페이지 커서
     * @param {string|number} cursor.prev - 이전 페이지 커서
     * @param {boolean} cursor.hasNext - 다음 페이지 존재 여부
     * @param {boolean} cursor.hasPrev - 이전 페이지 존재 여부
     * @param {object} options - 추가 옵션
     * @returns {ResponseBuilder} ResponseBuilder 인스턴스
     */
    static createCursorBased(items, cursor, options = {}) {
        const {
            message = null,
            metadata = {}
        } = options;

        const cursorMetadata = {
            next: cursor.next || null,
            prev: cursor.prev || null,
            hasNext: cursor.hasNext || false,
            hasPrev: cursor.hasPrev || false,
            count: items ? items.length : 0
        };

        return ResponseBuilder.success({
            items: items || [],
            cursor: cursorMetadata
        }, message)
            .setMetadata({
                responseType: 'cursor-paginated',
                generatedAt: new Date().toISOString(),
                ...metadata
            });
    }

    /**
     * 무한 스크롤용 응답을 생성합니다.
     * @param {Array} items - 데이터 배열
     * @param {object} scrollInfo - 스크롤 정보
     * @param {boolean} scrollInfo.hasMore - 더 많은 데이터 존재 여부
     * @param {string|number} scrollInfo.nextToken - 다음 데이터 토큰
     * @param {number} scrollInfo.offset - 현재 오프셋
     * @param {object} options - 추가 옵션
     * @returns {ResponseBuilder} ResponseBuilder 인스턴스
     */
    static createInfiniteScroll(items, scrollInfo, options = {}) {
        const {
            message = null,
            metadata = {}
        } = options;

        const scrollMetadata = {
            hasMore: scrollInfo.hasMore || false,
            nextToken: scrollInfo.nextToken || null,
            offset: scrollInfo.offset || 0,
            count: items ? items.length : 0,
            loadedAt: new Date().toISOString()
        };

        return ResponseBuilder.success({
            items: items || [],
            scroll: scrollMetadata
        }, message)
            .setMetadata({
                responseType: 'infinite-scroll',
                generatedAt: new Date().toISOString(),
                ...metadata
            });
    }

    /**
     * 빈 페이지네이션 응답을 생성합니다.
     * @param {object} options - 페이지네이션 옵션
     * @param {string} options.message - 응답 메시지
     * @param {object} options.metadata - 추가 메타데이터
     * @returns {ResponseBuilder} ResponseBuilder 인스턴스
     */
    static createEmpty(options = {}) {
        const {
            page = 1,
            limit = 10,
            message = 'No items found',
            metadata = {}
        } = options;

        return this.create([], 0, { page, limit, message, metadata });
    }

    /**
     * 검색 결과 페이지네이션 응답을 생성합니다.
     * @param {Array} items - 검색 결과 배열
     * @param {number} totalItems - 전체 검색 결과 수
     * @param {object} searchInfo - 검색 정보
     * @param {string} searchInfo.query - 검색 쿼리
     * @param {number} searchInfo.executionTime - 검색 실행 시간 (ms)
     * @param {Array} searchInfo.filters - 적용된 필터
     * @param {object} paginationOptions - 페이지네이션 옵션
     * @returns {ResponseBuilder} ResponseBuilder 인스턴스
     */
    static createSearchResult(items, totalItems, searchInfo, paginationOptions = {}) {
        const {
            page = 1,
            limit = 10,
            message = null
        } = paginationOptions;

        const searchMetadata = {
            query: searchInfo.query || '',
            executionTime: searchInfo.executionTime || 0,
            filters: searchInfo.filters || [],
            searchedAt: new Date().toISOString()
        };

        return this.create(items, totalItems, { page, limit, message })
            .setMetadata({
                responseType: 'search-result',
                search: searchMetadata
            });
    }

    /**
     * 페이지네이션 파라미터를 검증합니다.
     * @param {object} params - 페이지네이션 파라미터
     * @param {number} params.page - 페이지 번호
     * @param {number} params.limit - 페이지당 아이템 수
     * @param {object} options - 검증 옵션
     * @param {number} options.maxLimit - 최대 limit 값
     * @param {number} options.defaultLimit - 기본 limit 값
     * @returns {object} 검증된 파라미터
     */
    static validatePaginationParams(params, options = {}) {
        const {
            maxLimit = 100,
            defaultLimit = 10
        } = options;

        let { page, limit } = params;

        // 페이지 번호 검증
        page = parseInt(page) || 1;
        if (page < 1) {
            page = 1;
        }

        // limit 검증
        limit = parseInt(limit) || defaultLimit;
        if (limit < 1) {
            limit = defaultLimit;
        }
        if (limit > maxLimit) {
            limit = maxLimit;
        }

        return { page, limit };
    }

    /**
     * 페이지네이션 링크를 생성합니다.
     * @param {object} pageInfo - 페이지 정보
     * @param {string} baseUrl - 기본 URL
     * @param {object} queryParams - 추가 쿼리 파라미터
     * @returns {object} 페이지네이션 링크
     */
    static generatePaginationLinks(pageInfo, baseUrl, queryParams = {}) {
        const links = {};
        const params = new URLSearchParams(queryParams);

        // 첫 페이지 링크
        if (pageInfo.currentPage > 1) {
            params.set('page', '1');
            links.first = `${baseUrl}?${params.toString()}`;
        }

        // 이전 페이지 링크
        if (pageInfo.hasPrev) {
            params.set('page', (pageInfo.currentPage - 1).toString());
            links.prev = `${baseUrl}?${params.toString()}`;
        }

        // 다음 페이지 링크
        if (pageInfo.hasNext) {
            params.set('page', (pageInfo.currentPage + 1).toString());
            links.next = `${baseUrl}?${params.toString()}`;
        }

        // 마지막 페이지 링크
        if (pageInfo.currentPage < pageInfo.totalPages) {
            params.set('page', pageInfo.totalPages.toString());
            links.last = `${baseUrl}?${params.toString()}`;
        }

        return links;
    }
}
