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

    // 검색 실행
    if (keyword || type !== 'all' || year !== 'all') {
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
}

/**
 * 검색 실행
 */
function performSearch() {
    const exhibitions = document.querySelectorAll('.exhibition-card');
    let visibleCount = 0;

    // 활성 필터 태그 업데이트
    updateActiveFilterTags();

    exhibitions.forEach(exhibition => {
        const isVisible = isExhibitionMatchingSearch(exhibition);

        // 검색 결과에 따라 표시/숨김 처리
        if (isVisible) {
            exhibition.style.display = '';
            visibleCount++;
        } else {
            exhibition.style.display = 'none';
        }
    });

    // 결과 없음 메시지 표시/숨김
    const noResults = document.getElementById('no-results');
    if (noResults) {
        noResults.style.display = visibleCount === 0 ? 'flex' : 'none';
    }

    // 전시회 수 업데이트
    updateExhibitionCount(visibleCount);

    // URL 업데이트
    updateSearchUrl();

    // 페이지네이션 초기화
    resetPagination();
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

    return true;
}

/**
 * 활성 필터 태그 업데이트
 */
function updateActiveFilterTags() {
    const activeFilters = document.getElementById('active-filters');
    if (!activeFilters) return;

    // 기존 태그 제거
    activeFilters.innerHTML = '';

    // 키워드 태그
    if (searchState.query) {
        addFilterTag(activeFilters, '키워드', searchState.query, () => {
            const keywordInput = document.getElementById('keyword');
            if (keywordInput) keywordInput.value = '';
            searchState.query = '';
            performSearch();
        });
    }

    // 전시 유형 태그
    if (searchState.type !== 'all') {
        const typeSelect = document.getElementById('filter-type');
        const typeText = typeSelect?.options[typeSelect.selectedIndex].text ||
            (searchState.type === 'regular' ? '정기' : '특별');

        addFilterTag(activeFilters, '전시 유형', typeText, () => {
            if (typeSelect) typeSelect.value = 'all';
            searchState.type = 'all';
            performSearch();
        });
    }

    // 연도 태그
    if (searchState.year !== 'all') {
        addFilterTag(activeFilters, '개최 연도', searchState.year, () => {
            const yearSelect = document.getElementById('filter-year');
            if (yearSelect) yearSelect.value = 'all';
            searchState.year = 'all';
            performSearch();
        });
    }
}

/**
 * 필터 태그 추가
 * @param {HTMLElement} container - 태그 컨테이너
 * @param {string} label - 태그 레이블
 * @param {string} value - 태그 값
 * @param {Function} removeCallback - 제거 콜백
 */
function addFilterTag(container, label, value, removeCallback) {
    const tag = document.createElement('div');
    tag.className = 'filter-tag';
    tag.innerHTML = `
        <span>${label}: ${value}</span>
        <span class="filter-tag-remove">×</span>
    `;

    // 제거 버튼 이벤트
    const removeButton = tag.querySelector('.filter-tag-remove');
    if (removeButton && removeCallback) {
        removeButton.addEventListener('click', removeCallback);
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

    // 검색 실행
    performSearch();

    // 결과 없음 메시지 숨김
    const noResults = document.getElementById('no-results');
    if (noResults) {
        noResults.style.display = 'none';
    }
}
