/**
 * 작품 목록 페이지 - 필터 모듈
 * 작품 필터링 기능을 처리합니다.
 */
import { updateGallery } from './gallery.js';
import { debounce } from '/js/common/util/index.js';

// 필터 상태
let filterState = {
    department: '',
    year: '',
    search: ''
};

/**
 * 필터 기능 초기화
 */
export function initFilter() {
    const departmentFilter = document.getElementById('department-filter');
    const yearFilter = document.getElementById('year-filter');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');

    if (!departmentFilter || !yearFilter || !searchInput || !searchButton) return;

    // 학과 필터 변경 이벤트
    departmentFilter.addEventListener('change', () => {
        filterState.department = departmentFilter.value;
        updateGallery(filterState);
    });

    // 연도 필터 변경 이벤트
    yearFilter.addEventListener('change', () => {
        filterState.year = yearFilter.value;
        updateGallery(filterState);
    });

    // 검색 입력 이벤트 (디바운스 적용)
    searchInput.addEventListener('input', debounce(() => {
        filterState.search = searchInput.value.trim().toLowerCase();
        updateGallery(filterState);
    }, 300));

    // 검색 버튼 클릭 이벤트
    searchButton.addEventListener('click', () => {
        filterState.search = searchInput.value.trim().toLowerCase();
        updateGallery(filterState);
    });

    // 엔터 키 이벤트
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            filterState.search = searchInput.value.trim().toLowerCase();
            updateGallery(filterState);
        }
    });
}

/**
 * 필터 상태 초기화
 */
export function resetFilters() {
    const departmentFilter = document.getElementById('department-filter');
    const yearFilter = document.getElementById('year-filter');
    const searchInput = document.getElementById('search-input');

    if (departmentFilter) departmentFilter.value = '';
    if (yearFilter) yearFilter.value = '';
    if (searchInput) searchInput.value = '';

    filterState = {
        department: '',
        year: '',
        search: ''
    };

    updateGallery(filterState);
}

/**
 * 현재 필터 상태 반환
 */
export function getFilterState() {
    return { ...filterState };
}
