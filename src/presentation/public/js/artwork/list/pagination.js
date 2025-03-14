/**
 * 작품 목록 페이지 - 페이지네이션 모듈
 * 페이지네이션 기능을 처리합니다.
 */
import { fadeIn, fadeOut } from '/js/common/util/index.js';

// 페이지네이션 상태
let paginationState = {
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 12,
    totalItems: 0
};

/**
 * 페이지네이션 초기화
 */
export function initPagination() {
    const paginationContainer = document.getElementById('pagination');
    const artworkCards = document.querySelectorAll('.artwork-card');

    if (!paginationContainer) return;

    // 총 아이템 수 설정
    paginationState.totalItems = artworkCards.length;

    // 총 페이지 수 계산
    paginationState.totalPages = Math.ceil(paginationState.totalItems / paginationState.itemsPerPage);

    // 페이지네이션 렌더링
    renderPagination();

    // 첫 페이지 표시
    showPage(1);
}

/**
 * 페이지네이션 렌더링
 */
function renderPagination() {
    const paginationContainer = document.getElementById('pagination');
    if (!paginationContainer) return;

    // 페이지네이션 컨테이너 초기화
    paginationContainer.innerHTML = '';

    // 페이지 수가 1 이하면 페이지네이션 표시하지 않음
    if (paginationState.totalPages <= 1) return;

    // 이전 페이지 버튼
    const prevButton = document.createElement('button');
    prevButton.className = 'pagination-button prev';
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevButton.disabled = paginationState.currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (paginationState.currentPage > 1) {
            showPage(paginationState.currentPage - 1);
        }
    });
    paginationContainer.appendChild(prevButton);

    // 페이지 버튼 생성
    const maxVisiblePages = 5;
    let startPage = Math.max(1, paginationState.currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(paginationState.totalPages, startPage + maxVisiblePages - 1);

    // 시작 페이지 조정
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // 첫 페이지 버튼 (필요한 경우)
    if (startPage > 1) {
        const firstPageButton = document.createElement('button');
        firstPageButton.className = 'pagination-button';
        firstPageButton.textContent = '1';
        firstPageButton.addEventListener('click', () => showPage(1));
        paginationContainer.appendChild(firstPageButton);

        // 생략 표시 (필요한 경우)
        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'pagination-ellipsis';
            ellipsis.textContent = '...';
            paginationContainer.appendChild(ellipsis);
        }
    }

    // 페이지 버튼
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = 'pagination-button' + (i === paginationState.currentPage ? ' active' : '');
        pageButton.textContent = i.toString();
        pageButton.addEventListener('click', () => showPage(i));
        paginationContainer.appendChild(pageButton);
    }

    // 마지막 페이지 버튼 (필요한 경우)
    if (endPage < paginationState.totalPages) {
        // 생략 표시 (필요한 경우)
        if (endPage < paginationState.totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'pagination-ellipsis';
            ellipsis.textContent = '...';
            paginationContainer.appendChild(ellipsis);
        }

        const lastPageButton = document.createElement('button');
        lastPageButton.className = 'pagination-button';
        lastPageButton.textContent = paginationState.totalPages.toString();
        lastPageButton.addEventListener('click', () => showPage(paginationState.totalPages));
        paginationContainer.appendChild(lastPageButton);
    }

    // 다음 페이지 버튼
    const nextButton = document.createElement('button');
    nextButton.className = 'pagination-button next';
    nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextButton.disabled = paginationState.currentPage === paginationState.totalPages;
    nextButton.addEventListener('click', () => {
        if (paginationState.currentPage < paginationState.totalPages) {
            showPage(paginationState.currentPage + 1);
        }
    });
    paginationContainer.appendChild(nextButton);
}

/**
 * 특정 페이지 표시
 * @param {number} pageNumber - 페이지 번호
 */
function showPage(pageNumber) {
    const artworkCards = document.querySelectorAll('.artwork-card');
    if (!artworkCards.length) return;

    // 현재 페이지 업데이트
    paginationState.currentPage = pageNumber;

    // 시작 및 끝 인덱스 계산
    const startIndex = (pageNumber - 1) * paginationState.itemsPerPage;
    const endIndex = Math.min(startIndex + paginationState.itemsPerPage - 1, paginationState.totalItems - 1);

    // 모든 카드 숨김
    artworkCards.forEach((card, index) => {
        if (index >= startIndex && index <= endIndex) {
            fadeIn(card);
        } else {
            fadeOut(card);
        }
    });

    // 페이지네이션 업데이트
    renderPagination();

    // 페이지 상단으로 스크롤
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

/**
 * 페이지네이션 상태 업데이트
 * @param {Object} newState - 새 페이지네이션 상태
 */
export function updatePaginationState(newState) {
    paginationState = { ...paginationState, ...newState };
    renderPagination();
    showPage(1); // 첫 페이지로 이동
}
