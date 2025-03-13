/**
 * 작품 목록 페이지 - 갤러리 모듈
 * 작품 갤러리 표시 및 필터링 기능을 처리합니다.
 */
import { fadeIn, fadeOut } from '/js/common/util/index.js';

/**
 * 갤러리 기능 초기화
 */
export function initGallery() {
    const artworkGrid = document.getElementById('artwork-grid');
    const artworkCards = document.querySelectorAll('.artwork-card');
    const artworkCount = document.getElementById('artwork-count');

    if (!artworkGrid || !artworkCards.length) return;

    // 작품 카드 클릭 이벤트
    artworkCards.forEach(card => {
        card.addEventListener('click', () => {
            const artworkId = card.dataset.artworkId;
            showArtworkDetail(artworkId);
        });
    });

    // 초기 작품 수 표시
    if (artworkCount) {
        artworkCount.textContent = artworkCards.length;
    }
}

/**
 * 갤러리 업데이트
 * @param {Object} filters - 필터 조건
 */
export function updateGallery(filters = {}) {
    const artworkGrid = document.getElementById('artwork-grid');
    const artworkCards = document.querySelectorAll('.artwork-card');
    const artworkCount = document.getElementById('artwork-count');

    if (!artworkGrid || !artworkCards.length) return;

    let visibleCount = 0;

    // 각 작품 카드에 필터 적용
    artworkCards.forEach(card => {
        const department = card.dataset.department || '';
        const year = card.dataset.year || '';
        const title = card.querySelector('.artwork-title')?.textContent.toLowerCase() || '';
        const artist = card.querySelector('.artwork-artist')?.textContent.toLowerCase() || '';

        // 필터 조건 확인
        const matchesDepartment = !filters.department || department === filters.department;
        const matchesYear = !filters.year || year === filters.year;
        const matchesSearch = !filters.search ||
            title.includes(filters.search) ||
            artist.includes(filters.search);

        // 모든 조건을 만족하는지 확인
        const isVisible = matchesDepartment && matchesYear && matchesSearch;

        // 카드 표시/숨김 처리
        if (isVisible) {
            fadeIn(card);
            visibleCount++;
        } else {
            fadeOut(card);
        }
    });

    // 작품 수 업데이트
    if (artworkCount) {
        artworkCount.textContent = visibleCount;
    }

    // 결과가 없을 때 메시지 표시
    const noResultsElement = document.querySelector('.no-results');
    if (noResultsElement) {
        if (visibleCount === 0) {
            fadeIn(noResultsElement);
        } else {
            fadeOut(noResultsElement);
        }
    }
}

/**
 * 전시회별 작품 필터링
 * @param {string} exhibitionId - 전시회 ID
 */
export function filterArtworksByExhibition(exhibitionId) {
    const artworkCards = document.querySelectorAll('.card.card--list');
    const resultCount = document.getElementById('resultCount');

    if (!artworkCards.length) return;

    let visibleCount = 0;

    // 모든 작품 표시 (전체 선택 시)
    if (!exhibitionId || exhibitionId === 'all') {
        artworkCards.forEach(card => {
            card.style.display = 'block';
            visibleCount++;
        });
    }
    // 선택한 전시회의 작품만 표시
    else {
        artworkCards.forEach(card => {
            // 카드 내부의 전시회 정보 확인
            const exhibitionInfo = card.querySelector('.card__meta')?.textContent.trim() || '';

            // 전시회 정보가 선택한 전시회와 일치하는지 확인
            if (exhibitionInfo.includes(exhibitionId)) {
                card.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });
    }

    // 결과 수 업데이트
    if (resultCount) {
        resultCount.innerHTML = `총 <strong>${visibleCount}</strong>개의 작품이 검색되었습니다.`;
    }

    // 결과가 없을 때 메시지 표시
    const noResults = document.querySelector('.no-results');
    if (noResults) {
        if (visibleCount === 0) {
            noResults.style.display = 'block';
        } else {
            noResults.style.display = 'none';
        }
    }
}

/**
 * 작품 상세 정보 표시
 * @param {string} artworkId - 작품 ID
 */
function showArtworkDetail(artworkId) {
    // 모달 표시 또는 상세 페이지로 이동
    if (typeof window.showArtworkModal === 'function') {
        window.showArtworkModal(artworkId);
    } else {
        window.location.href = `/artwork/${artworkId}`;
    }
}
