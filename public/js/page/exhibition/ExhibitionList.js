/**
 * 전시회 목록 페이지 - 통합 스크립트
 */

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

// 전시회 모달
function showExhibitionModal(data) {
    const modal = document.getElementById('exhibition-modal');
    if (!modal) return;

    // 모달 내용 업데이트
    const modalImage = modal.querySelector('#modal-image');
    const modalTitle = modal.querySelector('#modal-title');
    const modalPeriod = modal.querySelector('#modal-period');
    const modalLocation = modal.querySelector('#modal-location');
    const modalDescription = modal.querySelector('#modal-description');
    const modalType = modal.querySelector('#modal-type');
    const modalHours = modal.querySelector('#modal-hours');
    const modalAdmission = modal.querySelector('#modal-admission');
    const modalCategory = modal.querySelector('#modal-category');

    if (modalImage) {
        modalImage.src = data.imageUrl || '/images/exhibition-placeholder.svg';
        modalImage.alt = data.title;
    }
    if (modalTitle) modalTitle.textContent = data.title;
    if (modalPeriod) modalPeriod.textContent = `${data.startDate} - ${data.endDate}`;
    if (modalLocation) modalLocation.textContent = data.location;
    if (modalDescription) modalDescription.textContent = data.description;
    if (modalType) modalType.textContent = data.exhibitionType === 'special' ? '특별 전시회' : '정기 전시회';
    if (modalHours) modalHours.textContent = data.viewingHours;
    if (modalAdmission) modalAdmission.textContent = data.admission;
    if (modalCategory) modalCategory.textContent = data.category;

    // 모달 표시
    document.body.style.overflow = 'hidden'; // 배경 스크롤 방지
    modal.style.display = 'flex';
    modal.style.opacity = '0';
    setTimeout(() => {
        modal.style.opacity = '1';
    }, 10);

    // 닫기 버튼 이벤트
    const closeButton = modal.querySelector('#close-modal');
    if (closeButton) {
        closeButton.onclick = () => closeModal(modal);
    }

    // 모달 외부 클릭 시 닫기
    modal.onclick = (event) => {
        if (event.target === modal) {
            closeModal(modal);
        }
    };

    // ESC 키 누를 때 모달 닫기
    const escHandler = (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeModal(modal);
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);

    // 공유하기 버튼 이벤트
    const shareButton = modal.querySelector('#modal-share');
    if (shareButton) {
        shareButton.onclick = async () => {
            try {
                await navigator.share({
                    title: data.title,
                    text: data.description,
                    url: window.location.href
                });
            } catch (err) {
                console.warn('공유하기가 지원되지 않는 환경입니다:', err);
                alert('이 브라우저에서는 공유하기 기능을 지원하지 않습니다.');
            }
        };
    }

    // 출품하기 버튼 이벤트
    const submitButton = modal.querySelector('#modal-submit-link');
    if (submitButton) {
        submitButton.href = `/artwork/new?exhibition=${data.id}`;
        submitButton.onclick = () => {
            closeModal(modal);
        };
    }

    // 작품 조회 버튼 이벤트
    const viewButton = modal.querySelector('#modal-view-link');
    if (viewButton) {
        viewButton.href = `/exhibition/${data.id}/artworks`;
    }
}

// 모달 닫기 함수
function closeModal(modal) {
    modal.style.opacity = '0';
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = ''; // 배경 스크롤 복원
    }, 200);
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

        const response = await fetch(`/api/exhibitions?${queryParams}`);
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
