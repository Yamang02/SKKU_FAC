/**
 * 전시회 목록 페이지 - 통합 스크립트
 */

import ExhibitionApi from '../../api/ExhibitionApi.js';
import { modalTemplate, exhibitionModalContent } from '../../templates/modalTemplate.js';
import { initModal, showModal, updateModalContent } from '../../common/modal.js';
import Pagination from '../../common/pagination.js';
import { showErrorMessage } from '../../common/util/notification.js';

// 전역 URL 파라미터
const urlParams = new URLSearchParams(window.location.search);

// API 함수 - 서버에서 가져오기
async function fetchExhibitionList(pagination, filters = {}) {
    try {
        const params = {
            page: pagination.page,
            limit: pagination.limit,
            sort: filters.sort || 'date-desc',
            type: filters.type || 'all',
            year: filters.year || 'all',
            category: filters.category || 'all',
            search: filters.searchQuery || ''
        };

        return await ExhibitionApi.getExhibitionList(params);
    } catch (error) {
        console.error('전시회 목록을 가져오는 중 오류 발생:', error);
        showErrorMessage('전시회 목록을 불러오는데 실패했습니다.');
        throw error;
    }
}

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
    exhibitionCount: document.getElementById('exhibition-count'),
    paginationContainer: document.getElementById('pagination')
};

// 초기화
document.addEventListener('DOMContentLoaded', async () => {
    try {
        initSearch();
        initFilters();
        initExhibitionModal();
        initPagination();

        // 초기 전시회 목록 로드
        await loadExhibitionList();
    } catch (error) {
        console.error('페이지 초기화 중 오류가 발생했습니다.', error);
        showErrorMessage('페이지 초기화 중 오류가 발생했습니다.');
    }
});

// 검색 기능
function initSearch() {
    elements.searchForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        state.searchQuery = elements.searchInput?.value.trim() || '';
        loadExhibitionList();
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
        loadExhibitionList();
    });

    // 연도 필터
    elements.filterYear?.addEventListener('change', () => {
        state.filters.year = elements.filterYear.value;
        loadExhibitionList();
    });

    // 카테고리 필터
    elements.filterCategory?.addEventListener('change', () => {
        state.filters.category = elements.filterCategory.value;
        loadExhibitionList();
    });

    // 정렬 옵션
    elements.sortOption?.addEventListener('change', () => {
        state.filters.sort = elements.sortOption.value;
        loadExhibitionList();
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

    loadExhibitionList();
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
    // 뱃지 생성
    let badges = '';

    // 출품 가능 뱃지
    if (exhibition.isSubmissionOpen) {
        badges += '<span class="exhibition-badge badge-submission-open">출품 가능</span>';
    }

    // 전시회 유형 뱃지
    const isSpecial = exhibition.exhibitionType === 'special';
    badges += `<span class="exhibition-badge badge-${isSpecial ? 'special' : 'regular'}">${isSpecial ? '특별 전시' : '정기 전시'}</span>`;

    // 모달 내용 업데이트
    updateModalContent('exhibition-modal', {
        'modal-image': exhibition.image || '/images/exhibition-placeholder.svg',
        'modal-title': exhibition.title || '제목 없음',
        'modal-badges': badges,
        'modal-description': exhibition.description || '',
        'modal-date': exhibition.date || '',
        'modal-location': exhibition.location || '',
        'modal-view-link': `/exhibition/${exhibition.id}/artworks`,
        'modal-submit-link': `/artwork/new?exhibition=${exhibition.id}`
    });

    // 모달 표시
    showModal('exhibition-modal');
}

// 애니메이션 관련 함수
function animateButtonClick(button) {
    if (!button) return;
    button.classList.add('clicked');
    setTimeout(() => {
        button.classList.remove('clicked');
    }, 200);
}

// 페이지네이션 초기화
function initPagination() {
    const prevBtn = document.querySelector('.pagination-prev');
    const nextBtn = document.querySelector('.pagination-next');
    const scrollContainer = document.querySelector('.exhibition-grid');

    if (!prevBtn || !nextBtn || !scrollContainer) return;

    // 페이지네이션 스크롤 버튼 상태 업데이트 및 이벤트 처리
    const updatePaginationButtons = () => {
        const isAtStart = scrollContainer.scrollLeft <= 10;
        const isAtEnd = scrollContainer.scrollLeft + scrollContainer.offsetWidth >= scrollContainer.scrollWidth - 10;

        prevBtn.style.opacity = isAtStart ? '0.5' : '1';
        prevBtn.disabled = isAtStart;
        nextBtn.style.opacity = isAtEnd ? '0.5' : '1';
        nextBtn.disabled = isAtEnd;
    };

    prevBtn.addEventListener('click', () => {
        scrollContainer.scrollBy({ left: -340, behavior: 'smooth' });
        updatePaginationButtons();
        animateButtonClick(prevBtn);
    });

    nextBtn.addEventListener('click', () => {
        scrollContainer.scrollBy({ left: 340, behavior: 'smooth' });
        updatePaginationButtons();
        animateButtonClick(nextBtn);
    });

    scrollContainer.addEventListener('scroll', updatePaginationButtons);
    updatePaginationButtons();
}

/**
 * 전시회 목록을 로드하고 표시합니다.
 */
async function loadExhibitionList() {
    if (!elements.container) return;

    elements.loadingIndicator?.style.setProperty('display', 'flex');
    elements.noResults?.style.setProperty('display', 'none');

    try {
        const pagination = new Pagination({
            page: parseInt(urlParams.get('page')) || 1,
            limit: parseInt(urlParams.get('limit')) || 12,
            sortField: urlParams.get('sortField') || 'createdAt',
            sortOrder: urlParams.get('sortOrder') || 'desc'
        });

        const filters = {
            type: urlParams.get('type') || state.filters.type,
            year: urlParams.get('year') || state.filters.year,
            category: urlParams.get('category') || state.filters.category,
            sort: urlParams.get('sort') || state.filters.sort,
            searchQuery: urlParams.get('search') || state.searchQuery
        };

        const response = await fetchExhibitionList(pagination, filters);

        if (!response) {
            throw new Error('전시회 목록을 불러오는데 실패했습니다.');
        }

        const exhibitions = response.exhibitions || [];
        const total = response.total || exhibitions.length;

        // 결과 카운트 업데이트
        if (elements.exhibitionCount) {
            elements.exhibitionCount.innerHTML = `총 <strong>${total}</strong>개의 전시회가 검색되었습니다.`;
        }

        // 페이지네이션 정보 설정
        if (response.pageInfo) {
            pagination.setPageInfo(response.pageInfo);
        }

        // 전시회 목록 표시
        if (exhibitions.length > 0) {
            elements.container.innerHTML = '';
            appendExhibitions(exhibitions);
        } else {
            elements.noResults?.style.setProperty('display', 'flex');
            elements.container.innerHTML = '<div class="no-exhibitions">검색 결과가 없습니다.</div>';
        }

        // 페이지네이션 UI 렌더링
        if (elements.paginationContainer) {
            pagination.renderUI(elements.paginationContainer);

            // 페이지 변경 이벤트 리스너
            elements.paginationContainer.addEventListener('pagination:change', async (e) => {
                const page = e.detail.page;
                // URL 파라미터 업데이트
                urlParams.set('page', page);

                // 전시회 목록 다시 로드
                await loadExhibitionList();
            });
        }

    } catch (error) {
        console.error('전시회 목록을 로드하는 중 오류 발생:', error);
        showErrorMessage(error.message || '전시회 목록을 불러오는 중 오류가 발생했습니다.');
        elements.noResults?.style.setProperty('display', 'flex');
    } finally {
        elements.loadingIndicator?.style.setProperty('display', 'none');
    }
}

// 전시회 목록 추가
function appendExhibitions(exhibitions) {
    if (!elements.container) return;

    exhibitions.forEach(exhibition => {
        const card = createExhibitionCard(exhibition);
        elements.container.appendChild(card);
    });

    // 카드에 이벤트 바인딩
    initExhibitionCardEvents();
}

// 전시회 카드 생성
function createExhibitionCard(exhibition) {
    const card = document.createElement('div');
    card.className = 'exhibition-card';
    card.dataset.exhibitionId = exhibition.id;
    card.dataset.startDate = exhibition.startDate;
    card.dataset.endDate = exhibition.endDate;
    card.dataset.location = exhibition.location;
    card.dataset.description = exhibition.description;
    card.dataset.artists = exhibition.artists ? exhibition.artists.join(',') : '';
    card.dataset.viewingHours = exhibition.viewingHours || '10:00 - 18:00';
    card.dataset.admission = exhibition.admission || '무료';
    card.dataset.category = exhibition.category;
    card.dataset.exhibitionType = exhibition.exhibitionType || 'regular';
    card.dataset.isSubmissionOpen = exhibition.isSubmissionOpen ? 'true' : 'false';

    const imageUrl = exhibition.image || '/images/default-exhibition.svg';
    const title = exhibition.title || '제목 없음';
    const description = exhibition.description || '설명 없음';

    // 뱃지 생성
    let badges = '<div class="exhibition-badges">';

    // 출품 가능 뱃지
    if (exhibition.isSubmissionOpen) {
        badges += '<span class="exhibition-badge badge-submission-open">출품 가능</span>';
    }

    // 전시회 유형 뱃지
    const isSpecial = exhibition.exhibitionType === 'special';
    badges += `<span class="exhibition-badge badge-${isSpecial ? 'special' : 'regular'}">${isSpecial ? '특별 전시' : '정기 전시'}</span>`;

    badges += '</div>';

    card.innerHTML = `
        <div class="exhibition-card__image">
            <img src="${imageUrl}"
                 alt="${title}"
                 class="exhibition-image"
                 onerror="this.onerror=null; this.src='/images/default-exhibition.svg'">
        </div>
        <div class="exhibition-card__content">
            ${badges}
            <h3 class="exhibition-title">${title}</h3>
            <p class="exhibition-description">${description}</p>
            <div class="exhibition-meta">
                <span class="exhibition-date">${exhibition.startDate} ~ ${exhibition.endDate}</span>
            </div>
        </div>
    `;

    return card;
}

// 전시회 카드 이벤트 바인딩
function initExhibitionCardEvents() {
    document.querySelectorAll('.exhibition-card').forEach(card => {
        card.addEventListener('click', () => {
            const exhibitionData = {
                id: card.dataset.exhibitionId,
                image: card.querySelector('.exhibition-image')?.src,
                title: card.querySelector('.exhibition-title')?.textContent?.trim(),
                startDate: card.dataset.startDate,
                endDate: card.dataset.endDate,
                date: `${card.dataset.startDate} ~ ${card.dataset.endDate}`,
                location: card.dataset.location,
                description: card.dataset.description,
                exhibitionType: card.dataset.exhibitionType || 'regular',
                isSubmissionOpen: card.dataset.isSubmissionOpen === 'true',
                artists: (card.dataset.artists || '').split(','),
                viewingHours: card.dataset.viewingHours || '10:00 - 18:00',
                admission: card.dataset.admission || '무료',
                category: card.dataset.category
            };

            showExhibitionModal(exhibitionData);
            animateButtonClick(card);
        });
    });
}
