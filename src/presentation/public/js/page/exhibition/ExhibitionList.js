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
    const modal = document.getElementById('exhibitionDetailModal');
    if (!modal) return;

    // 모달 내용 업데이트
    modal.querySelector('#exhibitionModalImage').src = data.imageUrl;
    modal.querySelector('#exhibitionModalImage').alt = data.title;
    modal.querySelector('#exhibitionModalTitle').textContent = data.title;
    modal.querySelector('#exhibitionModalPeriod').textContent = `${data.startDate} - ${data.endDate}`;
    modal.querySelector('#exhibitionModalDescription').textContent = data.description;
    modal.querySelector('#exhibitionModalType').textContent = data.type;
    modal.querySelector('#exhibitionModalViewingHours').textContent = data.viewingHours;

    // 전시 장소 정보 업데이트
    const locationList = modal.querySelector('#exhibitionModalLocations');
    locationList.innerHTML = `
        <div class="location-item">
            <span class="location-name">${data.location}</span>
        </div>
    `;

    // 작품 목록 버튼 링크 설정
    const artworksButton = modal.querySelector('#exhibitionModalArtworksButton');
    if (artworksButton) {
        artworksButton.href = `/exhibitions/${data.id}/artworks`;
    }

    // 모달 표시
    document.body.style.overflow = 'hidden'; // 배경 스크롤 방지
    modal.style.display = 'flex';
    modal.style.opacity = '0';
    setTimeout(() => {
        modal.style.opacity = '1';
    }, 10);

    // 닫기 버튼 이벤트
    const closeButton = modal.querySelector('#closeExhibitionModal');
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
    card.dataset.exhibitionId = exhibition.id;
    card.dataset.startDate = exhibition.startDate;
    card.dataset.endDate = exhibition.endDate;
    card.dataset.location = exhibition.location;
    card.dataset.description = exhibition.description;
    card.dataset.artists = exhibition.artists.join(',');
    card.dataset.viewingHours = exhibition.viewingHours;
    card.dataset.admission = exhibition.admission;
    card.dataset.category = exhibition.category;
    card.dataset.exhibitionType = exhibition.exhibitionType;

    card.innerHTML = `
        <div class="card-image-container">
            <img src="${exhibition.image || '/assets/image/exhibition/placeholder-exhibition.svg'}"
                alt="${exhibition.title}"
                class="exhibition-image"
                onerror="this.src='/assets/image/exhibition/placeholder-exhibition.svg'">
            <span class="exhibition-type ${exhibition.exhibitionType || 'regular'}">
                ${exhibition.exhibitionType === 'special' ? '특별' : '정기'}
            </span>
        </div>
        <div class="exhibition-info">
            <h2 class="exhibition-title">${exhibition.title}</h2>
            ${exhibition.subtitle ? `<p class="exhibition-subtitle">${exhibition.subtitle}</p>` : ''}
            <p class="exhibition-date">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                </svg>
                ${exhibition.startDate} ~ ${exhibition.endDate}
            </p>
            ${exhibition.category ? `<span class="exhibition-category">${exhibition.category}</span>` : ''}
        </div>
    `;

    return card;
}
