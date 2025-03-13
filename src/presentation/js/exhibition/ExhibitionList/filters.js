/**
 * 전시 목록 페이지 - 필터링 모듈
 * 전시회 필터링 관련 기능을 처리합니다.
 */
import { updateExhibitionCount } from './utils.js';

// 필터 상태
const filterState = {
    status: 'all',
    category: 'all',
    sortBy: 'date-desc'
};

// 활성화된 필터 태그
const activeTags = new Set();

/**
 * 필터링 초기화
 */
export function initFilters() {
    const statusFilter = document.getElementById('filter-status');
    const categoryFilter = document.getElementById('filter-category');
    const sortOption = document.getElementById('sort-option');
    const resetButton = document.getElementById('reset-filters');

    if (!statusFilter || !categoryFilter || !sortOption) return;

    // 상태 필터 변경 이벤트
    statusFilter.addEventListener('change', () => {
        filterState.status = statusFilter.value;
        updateActiveFilterTags('status', statusFilter.options[statusFilter.selectedIndex].text);
        applyFilters();
    });

    // 카테고리 필터 변경 이벤트
    categoryFilter.addEventListener('change', () => {
        filterState.category = categoryFilter.value;
        updateActiveFilterTags('category', categoryFilter.options[categoryFilter.selectedIndex].text);
        applyFilters();
    });

    // 정렬 옵션 변경 이벤트
    sortOption.addEventListener('change', () => {
        filterState.sortBy = sortOption.value;
        sortExhibitions();
    });

    // 필터 초기화 버튼 클릭 이벤트
    if (resetButton) {
        resetButton.addEventListener('click', resetFilters);
    }

    // URL 파라미터에서 초기 필터 상태 설정
    initFilterStateFromUrl();
}

/**
 * URL 파라미터에서 필터 상태 초기화
 */
function initFilterStateFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);

    // 상태 필터
    if (urlParams.has('status')) {
        const status = urlParams.get('status');
        const statusFilter = document.getElementById('filter-status');
        if (statusFilter && statusFilter.querySelector(`option[value="${status}"]`)) {
            statusFilter.value = status;
            filterState.status = status;
            updateActiveFilterTags('status', statusFilter.options[statusFilter.selectedIndex].text);
        }
    }

    // 카테고리 필터
    if (urlParams.has('category')) {
        const category = urlParams.get('category');
        const categoryFilter = document.getElementById('filter-category');
        if (categoryFilter && categoryFilter.querySelector(`option[value="${category}"]`)) {
            categoryFilter.value = category;
            filterState.category = category;
            updateActiveFilterTags('category', categoryFilter.options[categoryFilter.selectedIndex].text);
        }
    }

    // 정렬 옵션
    if (urlParams.has('sort')) {
        const sort = urlParams.get('sort');
        const sortOption = document.getElementById('sort-option');
        if (sortOption && sortOption.querySelector(`option[value="${sort}"]`)) {
            sortOption.value = sort;
            filterState.sortBy = sort;
        }
    }

    // 필터 적용
    applyFilters();
}

/**
 * 활성화된 필터 태그 업데이트
 * @param {string} type 필터 유형
 * @param {string} label 표시할 레이블
 */
function updateActiveFilterTags(type, label) {
    // 기존 같은 유형의 태그 제거
    const existingTag = document.querySelector(`.filter-tag[data-type="${type}"]`);
    if (existingTag) {
        existingTag.remove();
        activeTags.delete(type);
    }

    // 'all'이 아닌 경우에만 태그 추가
    if (label && label !== '전체' && label !== 'All') {
        activeTags.add(type);

        // 태그 컨테이너
        const filterContainer = document.querySelector('.filter-list');
        if (!filterContainer) return;

        // 태그 생성
        const tagElement = document.createElement('div');
        tagElement.className = 'filter-tag';
        tagElement.dataset.type = type;
        tagElement.innerHTML = `
            ${label}
            <span class="filter-tag-remove" data-type="${type}">&times;</span>
        `;

        // 태그 제거 이벤트
        const removeButton = tagElement.querySelector('.filter-tag-remove');
        if (removeButton) {
            removeButton.addEventListener('click', () => {
                // 필터 상태 초기화
                filterState[type] = 'all';

                // 필터 UI 업데이트
                const filterElement = document.getElementById(`filter-${type}`);
                if (filterElement) filterElement.value = 'all';

                // 태그 제거
                tagElement.remove();
                activeTags.delete(type);

                // 필터 적용
                applyFilters();
            });
        }

        // 태그 추가
        filterContainer.appendChild(tagElement);
    }
}

/**
 * 필터 적용
 */
function applyFilters() {
    const exhibitions = document.querySelectorAll('.exhibition-card');
    let visibleCount = 0;

    exhibitions.forEach(exhibition => {
        const isVisible = isExhibitionVisible(exhibition);
        exhibition.style.display = isVisible ? '' : 'none';
        if (isVisible) visibleCount++;
    });

    // 결과 없음 메시지 표시/숨김
    const noResults = document.getElementById('no-results');
    if (noResults) {
        noResults.style.display = visibleCount === 0 ? 'flex' : 'none';
    }

    // 전시회 수 업데이트
    updateExhibitionCount(visibleCount);

    // 정렬 적용
    sortExhibitions();

    // URL 업데이트
    updateUrl();
}

/**
 * 전시회 표시 여부 확인
 * @param {HTMLElement} exhibition - 전시회 요소
 * @returns {boolean} 표시 여부
 */
function isExhibitionVisible(exhibition) {
    // 상태 필터 확인 - 상태 클래스를 기반으로 필터링
    if (filterState.status !== 'all') {
        const statusElement = exhibition.querySelector(`.exhibition-status.${filterState.status}`);
        if (!statusElement) return false;
    }

    // 카테고리 필터 확인
    if (filterState.category !== 'all') {
        const category = exhibition.dataset.category;
        if (category !== filterState.category) return false;
    }

    return true;
}

/**
 * 전시회 정렬
 */
function sortExhibitions() {
    const container = document.getElementById('exhibitions-container');
    if (!container) return;

    const exhibitions = Array.from(container.querySelectorAll('.exhibition-card'));

    // 정렬 기준에 따라 정렬
    exhibitions.sort((a, b) => {
        switch (filterState.sortBy) {
        case 'date-desc':
            return new Date(b.dataset.date) - new Date(a.dataset.date);
        case 'date-asc':
            return new Date(a.dataset.date) - new Date(b.dataset.date);
        case 'title-asc':
            return a.dataset.title.localeCompare(b.dataset.title);
        case 'title-desc':
            return b.dataset.title.localeCompare(a.dataset.title);
        default:
            return 0;
        }
    });

    // DOM 순서 변경
    exhibitions.forEach(exhibition => {
        container.appendChild(exhibition);
    });
}

/**
 * URL 업데이트
 */
function updateUrl() {
    const urlParams = new URLSearchParams();

    // 필터 상태가 'all'이 아닌 경우에만 URL에 추가
    if (filterState.status !== 'all') {
        urlParams.set('status', filterState.status);
    }

    if (filterState.category !== 'all') {
        urlParams.set('category', filterState.category);
    }

    // 정렬 옵션이 기본값이 아닌 경우에만 URL에 추가
    if (filterState.sortBy !== 'date-desc') {
        urlParams.set('sort', filterState.sortBy);
    }

    // URL 업데이트 (페이지 새로고침 없이)
    const newUrl = urlParams.toString()
        ? `${window.location.pathname}?${urlParams.toString()}`
        : window.location.pathname;

    window.history.replaceState({}, '', newUrl);
}

/**
 * 필터 초기화
 */
function resetFilters() {
    // 필터 요소 초기화
    const statusFilter = document.getElementById('filter-status');
    const categoryFilter = document.getElementById('filter-category');
    const sortOption = document.getElementById('sort-option');

    if (statusFilter) statusFilter.value = 'all';
    if (categoryFilter) categoryFilter.value = 'all';
    if (sortOption) sortOption.value = 'date-desc';

    // 필터 상태 초기화
    filterState.status = 'all';
    filterState.category = 'all';
    filterState.sortBy = 'date-desc';

    // 활성 필터 태그 초기화
    const activeFiltersContainer = document.getElementById('active-filters');
    if (activeFiltersContainer) {
        activeFiltersContainer.innerHTML = '';
    }
    activeTags.clear();

    // 필터 적용
    applyFilters();
}
