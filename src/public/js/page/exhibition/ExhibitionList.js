/**
 * 전시회 목록 페이지 - 통합 스크립트
 */

import { modalTemplate, exhibitionModalContent } from '../../templates/modalTemplate.js';
import { initModal, showModal, updateModalContent } from '../../common/modal.js';

// 상태 관리
const state = {
    currentPage: 1,
    isLoading: false,
    filters: {
        type: 'all',
        year: 'all',
        category: 'all',
        sort: 'date-desc'
    },
    searchQuery: ''
};

// DOM 요소 캐싱
const elements = {
    container: document.getElementById('exhibitions-container'),
    searchForm: document.getElementById('searchForm'),
    searchInput: document.getElementById('keyword'),
    filterType: document.getElementById('filter-type'),
    filterYear: document.getElementById('filter-year'),
    filterCategory: document.getElementById('filter-category'),
    sortOption: document.getElementById('sort-option'),
    resetButton: document.querySelector('.btn-reset'),
    loadingIndicator: document.getElementById('loading-indicator'),
    noResults: document.getElementById('no-results'),
    resetSearch: document.getElementById('reset-search'),
    exhibitionCount: document.getElementById('exhibition-count')
};

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    initSearch();
    initFilters();
    initExhibitionCards();
    initExhibitionModal();
});

// 검색 기능
function initSearch() {
    elements.searchForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        state.searchQuery = elements.searchInput?.value.trim() || '';
        refreshExhibitions();
    });

    elements.resetButton?.addEventListener('click', () => {
        resetFilters();
    });

    elements.resetSearch?.addEventListener('click', () => {
        resetFilters();
    });
}

// 필터 기능
function initFilters() {
    // 전시회 유형 필터
    elements.filterType?.addEventListener('change', () => {
        state.filters.type = elements.filterType.value;
        refreshExhibitions();
    });

    // 연도 필터
    elements.filterYear?.addEventListener('change', () => {
        state.filters.year = elements.filterYear.value;
        refreshExhibitions();
    });

    // 카테고리 필터
    elements.filterCategory?.addEventListener('change', () => {
        state.filters.category = elements.filterCategory.value;
        refreshExhibitions();
    });

    // 정렬 옵션
    elements.sortOption?.addEventListener('change', () => {
        state.filters.sort = elements.sortOption.value;
        refreshExhibitions();
    });
}

// 필터 초기화
function resetFilters() {
    state.searchQuery = '';
    state.filters = {
        type: 'all',
        year: 'all',
        category: 'all',
        sort: 'date-desc'
    };

    if (elements.searchInput) elements.searchInput.value = '';
    if (elements.filterType) elements.filterType.value = 'all';
    if (elements.filterYear) elements.filterYear.value = 'all';
    if (elements.filterCategory) elements.filterCategory.value = 'all';
    if (elements.sortOption) elements.sortOption.value = 'date-desc';

    refreshExhibitions();
}

// 전시회 카드 이벤트
function initExhibitionCards() {
    document.querySelectorAll('.exhibition-card').forEach(card => {
        card.addEventListener('click', () => {
            const exhibitionData = {
                id: card.dataset.exhibitionId,
                imageUrl: card.querySelector('.exhibition-image')?.src,
                title: card.querySelector('.exhibition-title')?.textContent?.trim(),
                startDate: card.dataset.startDate,
                endDate: card.dataset.endDate,
                location: card.dataset.location,
                description: card.dataset.description,
                type: card.querySelector('.exhibition-type')?.textContent?.trim(),
                artists: (card.dataset.artists || '').split(','),
                viewingHours: card.dataset.viewingHours || '10:00 - 18:00',
                admission: card.dataset.admission || '무료',
                category: card.dataset.category
            };

            showExhibitionModal(exhibitionData);
        });
    });
}

// 모달 초기화
function initExhibitionModal() {
    // 모달 HTML 추가
    const modalHTML = modalTemplate('exhibition-modal', exhibitionModalContent);
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // 모달 초기화
    initModal('exhibition-modal');
}

// 전시회 모달 표시
function showExhibitionModal(exhibition) {
    // 모달 내용 업데이트
    updateModalContent('exhibition-modal', {
        'modal-image': exhibition.image || '/images/exhibition-placeholder.svg',
        'modal-title': exhibition.title || '제목 없음',
        'modal-description': exhibition.description || '',
        'modal-date': exhibition.date || '',
        'modal-location': exhibition.location || '',
        'modal-artworks-link': `/exhibition/${exhibition.id}/artworks`,
        'modal-submit-link': `/artwork/new?exhibition=${exhibition.id}`
    });

    // 모달 표시
    showModal('exhibition-modal');
}

// 전시회 목록 새로고침
async function refreshExhibitions() {
    state.currentPage = 1;
    state.isLoading = true;
    elements.loadingIndicator?.style.setProperty('display', 'flex');
    elements.noResults?.style.setProperty('display', 'none');

    try {
        const queryParams = new URLSearchParams({
            page: '1',
            type: state.filters.type,
            year: state.filters.year,
            category: state.filters.category,
            sort: state.filters.sort,
            search: state.searchQuery
        });

        const response = await fetch(`/exhibition/api/list?${queryParams}`);
        const data = await response.json();

        if (data.exhibitions.length === 0) {
            elements.noResults?.style.setProperty('display', 'flex');
            elements.container.innerHTML = '';
            if (elements.exhibitionCount) {
                elements.exhibitionCount.innerHTML = '총 <strong>0</strong>개의 전시회가 검색되었습니다.';
            }
        } else {
            elements.container.innerHTML = '';
            appendExhibitions(data.exhibitions);
            if (elements.exhibitionCount) {
                elements.exhibitionCount.innerHTML = `총 <strong>${data.exhibitions.length}</strong>개의 전시회가 검색되었습니다.`;
            }
        }
    } catch (error) {
        console.error('Failed to refresh exhibitions:', error);
        elements.noResults?.style.setProperty('display', 'flex');
    } finally {
        state.isLoading = false;
        elements.loadingIndicator?.style.setProperty('display', 'none');
    }
}

// 전시회 목록 추가
function appendExhibitions(exhibitions) {
    exhibitions.forEach(exhibition => {
        const card = createExhibitionCard(exhibition);
        elements.container?.appendChild(card);
    });
    initExhibitionCards();
}

// 전시회 카드 생성
function createExhibitionCard(exhibition) {
    const card = document.createElement('div');
    card.className = 'exhibition-card';

    const imageUrl = exhibition.image || '/images/default-exhibition.svg';
    const title = exhibition.title || '제목 없음';
    const description = exhibition.description || '설명 없음';

    card.innerHTML = `
        <div class="exhibition-card__image">
            <img src="${imageUrl}"
                 alt="${title}"
                 onerror="this.onerror=null; this.src='/images/default-exhibition.svg'">
        </div>
        <div class="exhibition-card__content">
            <h3 class="exhibition-card__title">${title}</h3>
            <p class="exhibition-card__description">${description}</p>
        </div>
    `;

    return card;
}
