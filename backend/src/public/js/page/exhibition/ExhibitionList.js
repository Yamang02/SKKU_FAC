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
            year: filters.year || '',
            category: filters.category || 'all',
            submission: filters.submission || 'all',
            search: filters.search || ''
        };

        // API 호출 후 결과 바로 반환
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
        year: '',
        category: 'all',
        submission: 'all',
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
    filterSubmission: document.getElementById('filter-submission'),
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
    elements.searchForm?.addEventListener('submit', e => {
        e.preventDefault();

        // 모든 필터 값 설정
        state.searchQuery = elements.searchInput?.value.trim() || '';
        state.filters.type = elements.filterType?.value || 'all';
        state.filters.year = elements.filterYear?.value || '';
        state.filters.category = elements.filterCategory?.value || 'all';
        state.filters.submission = elements.filterSubmission?.value || 'all';
        state.filters.sort = elements.sortOption?.value || 'date-desc';

        // URL 파라미터 업데이트
        urlParams.set('page', 1); // 검색 시 첫 페이지로 이동
        if (state.searchQuery) urlParams.set('search', state.searchQuery);
        else urlParams.delete('search');

        if (state.filters.type !== 'all') urlParams.set('type', state.filters.type);
        else urlParams.delete('type');

        if (state.filters.year) urlParams.set('year', state.filters.year);
        else urlParams.delete('year');

        if (state.filters.category !== 'all') urlParams.set('category', state.filters.category);
        else urlParams.delete('category');

        if (state.filters.submission !== 'all') urlParams.set('submission', state.filters.submission);
        else urlParams.delete('submission');

        urlParams.set('sort', state.filters.sort);

        // URL 히스토리 업데이트
        window.history.pushState({}, '', `${window.location.pathname}?${urlParams.toString()}`);

        // 전시회 목록 로드
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
    // 필터 이벤트 리스너는 값 변경만 처리하고 API 호출은 하지 않음

    // 전시회 유형 필터
    elements.filterType?.addEventListener('change', () => {
        state.filters.type = elements.filterType.value;
    });

    // 연도 필터
    elements.filterYear?.addEventListener('change', () => {
        state.filters.year = elements.filterYear.value;
    });

    // 카테고리 필터
    elements.filterCategory?.addEventListener('change', () => {
        state.filters.category = elements.filterCategory.value;
    });

    // 출품 가능 여부 필터
    elements.filterSubmission?.addEventListener('change', () => {
        state.filters.submission = elements.filterSubmission.value;
    });

    // 정렬 옵션
    elements.sortOption?.addEventListener('change', () => {
        state.filters.sort = elements.sortOption.value;
    });
}

// 필터 초기화
function resetFilters() {
    state.searchQuery = '';
    state.filters = {
        type: 'all',
        year: '',
        category: 'all',
        submission: 'all',
        sort: 'date-desc'
    };

    if (elements.searchInput) elements.searchInput.value = '';
    if (elements.filterType) elements.filterType.value = 'all';
    if (elements.filterYear) elements.filterYear.value = '';
    if (elements.filterCategory) elements.filterCategory.value = 'all';
    if (elements.filterSubmission) elements.filterSubmission.value = 'all';
    if (elements.sortOption) elements.sortOption.value = 'date-desc';

    // URL 파라미터 초기화
    urlParams.delete('search');
    urlParams.delete('type');
    urlParams.delete('year');
    urlParams.delete('category');
    urlParams.delete('submission');
    urlParams.set('sort', 'date-desc');
    urlParams.set('page', 1);

    // URL 히스토리 업데이트
    window.history.pushState({}, '', `${window.location.pathname}?${urlParams.toString()}`);

    // 전시회 목록 로드
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
    const imageUrl = exhibition.imageUrl || exhibition.image || '/images/exhibition-placeholder.svg';
    const date = exhibition.date || `${exhibition.startDate} ~ ${exhibition.endDate}`;

    // 모달 내용 업데이트
    updateModalContent('exhibition-modal', {
        'modal-image': imageUrl,
        'modal-title': exhibition.title || '제목 없음',
        'modal-date': date,
        'modal-location': exhibition.location || '',
        'modal-description': exhibition.description || '',
        'modal-view-link': `/artwork?exhibition=${exhibition.id}&page=1`,
        'modal-submit-link': `/artwork/new?exhibition=${exhibition.id}`
    });

    // 모달에 exhibition 클래스 추가
    const modal = document.getElementById('exhibition-modal');
    if (modal) {
        modal.classList.add('exhibition-modal');
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) modalContent.classList.add('exhibition-modal-content');
        const modalImage = modal.querySelector('.modal-image');
        if (modalImage) {
            modalImage.classList.add('exhibition-modal-image');

            // 이미지 오류 처리
            modalImage.addEventListener('error', function () {
                this.src = '/images/exhibition-placeholder.svg';
            });
        }

        // 출품하기 버튼 활성화/비활성화
        const submitButton = modal.querySelector('#modal-submit-link');
        if (submitButton) {
            if (!exhibition.isSubmissionOpen) {
                submitButton.classList.add('disabled');
                submitButton.setAttribute('aria-disabled', 'true');
                submitButton.innerHTML = '출품 불가';
            } else {
                submitButton.classList.remove('disabled');
                submitButton.removeAttribute('aria-disabled');
                submitButton.innerHTML = '출품하기';
            }
        }
    }

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
    // 페이지네이션 컨테이너 요소 확인
    elements.paginationContainer = document.getElementById('pagination');

    if (!elements.paginationContainer) {
        console.warn('페이지네이션 컨테이너를 찾을 수 없습니다.');
        return;
    }

    // 페이지네이션 이벤트 리스너 제거
    elements.paginationContainer.innerHTML = '';

    // 첫 로드시에는 페이지네이션 UI를 보여주지 않음
    // loadExhibitionList에서 데이터를 로드한 후 페이지네이션 UI를 표시합니다.
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
            submission: urlParams.get('submission') || state.filters.submission,
            sort: urlParams.get('sort') || state.filters.sort,
            search: urlParams.get('search') || state.searchQuery
        };

        const response = await fetchExhibitionList(pagination, filters);

        if (!response) {
            throw new Error('전시회 목록을 불러오는데 실패했습니다.');
        }

        const exhibitions = response.items || [];
        const total = response.total || 0;

        // 결과 카운트 업데이트
        if (elements.exhibitionCount) {
            elements.exhibitionCount.innerHTML = `총 <strong>${total}</strong>개의 전시회가 검색되었습니다.`;
        }

        // 전시회 목록 표시
        if (exhibitions.length > 0) {
            elements.container.innerHTML = '';
            appendExhibitions(exhibitions);
        } else {
            elements.noResults?.style.setProperty('display', 'flex');
            elements.container.innerHTML = '';
        }

        // 페이지네이션 설정
        if (elements.paginationContainer) {
            // 페이지네이션 정보 설정
            pagination.setPageInfo({
                currentPage: response.page || 1,
                totalPages: Math.ceil(total / (response.limit || 12)),
                totalItems: total
            });

            // 페이지네이션 UI 렌더링
            pagination.renderUI(elements.paginationContainer);

            // 페이지 변경 이벤트 리스너
            elements.paginationContainer.addEventListener('pagination:change', async e => {
                const page = e.detail.page;
                // URL 파라미터 업데이트
                urlParams.set('page', page);
                window.history.pushState({}, '', `${window.location.pathname}?${urlParams.toString()}`);

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

    const imageUrl = exhibition.imageUrl || exhibition.image || '/images/default-exhibition.svg';
    const title = exhibition.title || '제목 없음';
    const location = exhibition.location || '장소 미정';

    // 전시회 유형 배지 텍스트 설정
    const typeBadge = exhibition.exhibitionType === 'special' ? '특별' : '정기';
    const typeBadgeClass = exhibition.exhibitionType === 'special' ? 'badge-special' : 'badge-regular';

    // 출품 가능 여부 배지
    const submissionBadge = exhibition.isSubmissionOpen
        ? '<span class="exhibition-badge badge-submission-open">출품가능</span>'
        : '';

    card.innerHTML = `
        <div class="exhibition-card__image-container">
            <img src="${imageUrl}"
                 alt="${title}"
                 class="exhibition-card__image">
            <div class="exhibition-card__badges">
                <span class="exhibition-badge ${typeBadgeClass}">${typeBadge}</span>
                ${submissionBadge}
            </div>
        </div>
        <div class="exhibition-card__content">
            <h3 class="exhibition-card__title">${title}</h3>
            <div class="exhibition-card__meta">
                <span class="exhibition-card__date">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" viewBox="0 0 16 16">
                        <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                    </svg>
                    ${exhibition.startDate} ~ ${exhibition.endDate}
                </span>
                <span class="exhibition-card__location">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" viewBox="0 0 16 16">
                        <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                    </svg>
                    ${location}
                </span>
            </div>
        </div>
    `;

    // 이미지 오류 처리
    const cardImage = card.querySelector('.exhibition-card__image');
    if (cardImage) {
        cardImage.addEventListener('error', function () {
            this.src = '/images/default-exhibition.svg';
        });
    }

    return card;
}

// 전시회 카드 이벤트 바인딩
function initExhibitionCardEvents() {
    document.querySelectorAll('.exhibition-card').forEach(card => {
        card.addEventListener('click', () => {
            const exhibitionData = {
                id: card.dataset.exhibitionId,
                image: card.querySelector('.exhibition-card__image')?.src,
                title: card.querySelector('.exhibition-card__title')?.textContent?.trim(),
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
