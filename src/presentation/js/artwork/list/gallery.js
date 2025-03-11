/**
 * 작품 목록 페이지 - 갤러리 모듈
 * 작품 갤러리 표시 및 필터링 기능을 처리합니다.
 */
import { fadeIn, fadeOut } from '../common/util.js';

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
    const artworkCards = document.querySelectorAll('.artwork-card');
    const artworkCount = document.getElementById('artwork-count');

    if (!artworkCards.length) return;

    let visibleCount = 0;

    // 모든 작품 표시 (전체 선택 시)
    if (!exhibitionId || exhibitionId === 'all') {
        artworkCards.forEach(card => {
            fadeIn(card);
            visibleCount++;
        });
    }
    // 선택한 전시회의 작품만 표시
    else {
        artworkCards.forEach(card => {
            const cardExhibitionId = card.dataset.exhibitionId;

            if (cardExhibitionId === exhibitionId) {
                fadeIn(card);
                visibleCount++;
            } else {
                fadeOut(card);
            }
        });
    }

    // 작품 수 업데이트
    if (artworkCount) {
        artworkCount.textContent = visibleCount;
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
