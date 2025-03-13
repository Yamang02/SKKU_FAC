/**
 * 전시 목록 페이지 - 검색 모듈
 * 전시회 검색 관련 기능을 처리합니다.
 */
import { updateExhibitionCount } from './utils.js';
import { resetPagination } from './loadMore.js';

// 검색 상태
const searchState = {
    query: '',
    category: 'all',
    type: 'all',
    year: 'all',
    sort: 'date-desc'
};

/**
 * 검색 기능 초기화
 */
export function initSearch() {
    // 검색 폼
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            updateSearchState();
            performSearch();
        });
    }

    // 필터 변경 이벤트
    const filterType = document.getElementById('filter-type');
    const filterYear = document.getElementById('filter-year');
    const filterCategory = document.getElementById('filter-category');
    const sortOption = document.getElementById('sort-option');

    // 필터 이벤트 리스너
    if (filterType) {
        filterType.addEventListener('change', () => {
            updateSearchState();
            performSearch();
        });
    }

    if (filterYear) {
        filterYear.addEventListener('change', () => {
            updateSearchState();
            performSearch();
        });
    }

    if (filterCategory) {
        filterCategory.addEventListener('change', () => {
            updateSearchState();
            performSearch();
        });
    }

    if (sortOption) {
        sortOption.addEventListener('change', () => {
            updateSearchState();
            performSearch();
        });
    }

    // 초기화 버튼
    const resetButton = document.querySelector('button[type="reset"]');
    if (resetButton) {
        resetButton.addEventListener('click', () => {
            resetSearch();
        });
    }

    // 검색 결과 없음 메시지의 초기화 버튼
    const resetSearchButton = document.getElementById('reset-search');
    if (resetSearchButton) {
        resetSearchButton.addEventListener('click', () => {
            resetSearch();
        });
    }

    // URL 파라미터에서 검색 상태 초기화
    initSearchFromUrl();
}

/**
 * URL 파라미터에서 검색 상태 초기화
 */
function initSearchFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);

    // 검색어
    const keyword = urlParams.get('keyword');
    if (keyword) {
        searchState.query = keyword.toLowerCase();
        const keywordInput = document.getElementById('keyword');
        if (keywordInput) keywordInput.value = keyword;
    }

    // 전시 유형
    const type = urlParams.get('type');
    if (type && ['all', 'regular', 'special'].includes(type)) {
        searchState.type = type;
        const typeSelect = document.getElementById('filter-type');
        if (typeSelect) typeSelect.value = type;
    }

    // 연도
    const year = urlParams.get('year');
    if (year) {
        searchState.year = year;
        const yearSelect = document.getElementById('filter-year');
        if (yearSelect) yearSelect.value = year;
    }

    // 카테고리
    const category = urlParams.get('category');
    if (category) {
        searchState.category = category;
        const categorySelect = document.getElementById('filter-category');
        if (categorySelect) categorySelect.value = category;
    }

    // 정렬
    const sort = urlParams.get('sort');
    if (sort) {
        searchState.sort = sort;
        const sortSelect = document.getElementById('sort-option');
        if (sortSelect) sortSelect.value = sort;
    }

    // 검색 실행
    if (keyword || type !== 'all' || year !== 'all' || category !== 'all' || sort !== 'date-desc') {
        performSearch();
    }
}

/**
 * 검색 상태 업데이트
 */
function updateSearchState() {
    // 검색어
    const keywordInput = document.getElementById('keyword');
    if (keywordInput) {
        searchState.query = keywordInput.value.toLowerCase().trim();
    }

    // 전시 유형
    const typeSelect = document.getElementById('filter-type');
    if (typeSelect) {
        searchState.type = typeSelect.value;
    }

    // 연도
    const yearSelect = document.getElementById('filter-year');
    if (yearSelect) {
        searchState.year = yearSelect.value;
    }

    // 카테고리
    const categorySelect = document.getElementById('filter-category');
    if (categorySelect) {
        searchState.category = categorySelect.value;
    }

    // 정렬
    const sortSelect = document.getElementById('sort-option');
    if (sortSelect) {
        searchState.sort = sortSelect.value;
    }
}

/**
 * 검색 실행
 */
function performSearch() {
    // 로딩 표시
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) loadingIndicator.style.display = 'flex';

    // 검색 결과 없음 메시지 숨기기
    const noResultElement = document.getElementById('no-results');
    if (noResultElement) noResultElement.style.display = 'none';

    // 활성 필터 태그 업데이트
    updateActiveFilterTags();

    // URL 업데이트
    updateSearchUrl();

    // 페이지네이션 초기화
    resetPagination();

    // 검색 실행 (약간의 지연으로 UI 업데이트 시간 확보)
    setTimeout(() => {
        // 모든 전시회 요소
        const exhibitionContainer = document.getElementById('exhibitions-container');
        const exhibitions = Array.from(exhibitionContainer.querySelectorAll('.exhibition-card'));

        // 검색 조건에 맞는 전시회만 표시
        let visibleCount = 0;
        exhibitions.forEach(exhibition => {
            const isMatch = isExhibitionMatchingSearch(exhibition);
            exhibition.style.display = isMatch ? '' : 'none';
            if (isMatch) visibleCount++;
        });

        // 검색 결과 카운트 업데이트
        updateExhibitionCount(visibleCount);

        // 검색 결과가 없는 경우
        if (visibleCount === 0 && noResultElement) {
            noResultElement.style.display = 'flex';
        }

        // 로딩 표시 숨기기
        if (loadingIndicator) loadingIndicator.style.display = 'none';
    }, 300);
}

/**
 * 전시회가 검색어와 일치하는지 확인
 * @param {HTMLElement} exhibition - 전시회 요소
 * @returns {boolean} 일치 여부
 */
function isExhibitionMatchingSearch(exhibition) {
    // 제목 검색
    const title = exhibition.dataset.title.toLowerCase();
    if (searchState.query && !title.includes(searchState.query)) return false;

    // 전시 유형 검색
    const exhibitionType = exhibition.dataset.exhibitionType;
    if (searchState.type !== 'all' && exhibitionType !== searchState.type) return false;

    // 연도 검색
    if (searchState.year !== 'all') {
        const date = exhibition.dataset.date;
        if (!date || !date.includes(searchState.year)) return false;
    }

    // 카테고리 검색
    if (searchState.category !== 'all') {
        const category = exhibition.dataset.category;
        if (!category || category !== searchState.category) return false;
    }

    // 정렬 적용 (정렬은 여기서 처리하지 않고 별도 함수로 처리하는 것이 좋지만,
    // 현재 구현에서는 간단히 처리)
    if (searchState.sort !== 'date-desc') {
        // 정렬 로직은 실제 구현 시 추가
    }

    return true;
}

/**
 * 활성화된 필터 태그 업데이트
 */
function updateActiveFilterTags() {
    // 필터 태그 컨테이너
    const filterContainer = document.querySelector('.filter-list');
    if (!filterContainer) return;

    // 기존 태그 모두 제거
    filterContainer.innerHTML = '';

    // 검색어 태그
    if (searchState.query) {
        addFilterTag(
            filterContainer,
            `검색어: ${searchState.query}`,
            'query',
            () => {
                const keywordInput = document.getElementById('keyword');
                if (keywordInput) keywordInput.value = '';
                searchState.query = '';
                performSearch();
            }
        );
    }

    // 전시 유형 태그
    if (searchState.type !== 'all') {
        const typeLabel = searchState.type === 'regular' ? '정기 전시회' : '특별 전시회';
        addFilterTag(
            filterContainer,
            `유형: ${typeLabel}`,
            'type',
            () => {
                const typeSelect = document.getElementById('filter-type');
                if (typeSelect) typeSelect.value = 'all';
                searchState.type = 'all';
                performSearch();
            }
        );
    }

    // 연도 태그
    if (searchState.year !== 'all') {
        addFilterTag(
            filterContainer,
            `연도: ${searchState.year}`,
            'year',
            () => {
                const yearSelect = document.getElementById('filter-year');
                if (yearSelect) yearSelect.value = 'all';
                searchState.year = 'all';
                performSearch();
            }
        );
    }

    // 카테고리 태그
    if (searchState.category !== 'all') {
        const categoryLabels = {
            'painting': '회화',
            'sculpture': '조각',
            'photography': '사진',
            'digital': '디지털 아트'
        };
        const categoryLabel = categoryLabels[searchState.category] || searchState.category;

        addFilterTag(
            filterContainer,
            `카테고리: ${categoryLabel}`,
            'category',
            () => {
                const categorySelect = document.getElementById('filter-category');
                if (categorySelect) categorySelect.value = 'all';
                searchState.category = 'all';
                performSearch();
            }
        );
    }
}

/**
 * 필터 태그 추가
 * @param {HTMLElement} container 태그를 추가할 컨테이너
 * @param {string} label 태그 레이블
 * @param {string} value 태그 값
 * @param {Function} removeCallback 태그 제거 시 콜백
 */
function addFilterTag(container, label, value, removeCallback) {
    const tag = document.createElement('div');
    tag.className = 'filter-tag';
    tag.dataset.value = value;

    tag.innerHTML = `
        ${label}
        <span class="filter-tag-remove">&times;</span>
    `;

    const removeButton = tag.querySelector('.filter-tag-remove');
    if (removeButton) {
        removeButton.addEventListener('click', () => {
            container.removeChild(tag);
            if (removeCallback) removeCallback();
        });
    }

    container.appendChild(tag);
}

/**
 * 검색 URL 업데이트
 */
function updateSearchUrl() {
    const urlParams = new URLSearchParams();

    if (searchState.query) {
        urlParams.set('keyword', searchState.query);
    }

    if (searchState.type !== 'all') {
        urlParams.set('type', searchState.type);
    }

    if (searchState.year !== 'all') {
        urlParams.set('year', searchState.year);
    }

    if (searchState.category !== 'all') {
        urlParams.set('category', searchState.category);
    }

    if (searchState.sort !== 'date-desc') {
        urlParams.set('sort', searchState.sort);
    }

    const newUrl = `${window.location.pathname}${urlParams.toString() ? '?' + urlParams.toString() : ''}`;
    window.history.replaceState({}, '', newUrl);
}

/**
 * 검색 초기화
 */
function resetSearch() {
    // 폼 초기화
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.reset();
    }

    // 검색 상태 초기화
    searchState.query = '';
    searchState.type = 'all';
    searchState.year = 'all';
    searchState.category = 'all';
    searchState.sort = 'date-desc';

    // 필터 초기화
    const categorySelect = document.getElementById('filter-category');
    if (categorySelect) categorySelect.value = 'all';

    const sortSelect = document.getElementById('sort-option');
    if (sortSelect) sortSelect.value = 'date-desc';

    // 검색 실행
    performSearch();

    // 결과 없음 메시지 숨김
    const noResults = document.getElementById('no-results');
    if (noResults) {
        noResults.style.display = 'none';
    }
}
