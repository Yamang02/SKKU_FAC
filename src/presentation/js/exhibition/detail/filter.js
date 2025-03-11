/**
 * 전시 상세 페이지 - 필터 모듈
 * 작품 필터링 기능을 처리합니다.
 */
import { fadeIn, fadeOut } from '../common/util.js';

/**
 * 필터 초기화
 */
export function initFilter() {
    const filterButtons = document.querySelectorAll('.filter-button');
    const artworkCards = document.querySelectorAll('.artwork-card');

    if (!filterButtons.length || !artworkCards.length) return;

    // 필터 버튼 클릭 이벤트
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 활성 버튼 스타일 변경
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const category = button.dataset.category;

            // 작품 필터링
            filterArtworks(artworkCards, category);
        });
    });

    // 작품 카드 호버 효과
    initCardHoverEffects(artworkCards);
}

/**
 * 작품 필터링
 * @param {NodeList} artworkCards - 작품 카드 요소 목록
 * @param {string} category - 필터링할 카테고리
 */
function filterArtworks(artworkCards, category) {
    // 필터링 결과 카운트
    let visibleCount = 0;

    // 모든 작품 표시 또는 필터링
    if (category === 'all') {
        artworkCards.forEach(card => {
            fadeIn(card);
            visibleCount++;
        });
    } else {
        artworkCards.forEach(card => {
            if (card.dataset.category === category) {
                fadeIn(card);
                visibleCount++;
            } else {
                fadeOut(card);
            }
        });
    }

    // 결과 없음 메시지 표시/숨김
    const noResultsMessage = document.querySelector('.no-results');
    if (noResultsMessage) {
        if (visibleCount === 0) {
            fadeIn(noResultsMessage);
        } else {
            fadeOut(noResultsMessage);
        }
    }

    // 결과 카운트 업데이트
    updateResultCount(visibleCount);
}

/**
 * 결과 카운트 업데이트
 * @param {number} count - 표시된 작품 수
 */
function updateResultCount(count) {
    const countElement = document.querySelector('.result-count');
    if (countElement) {
        countElement.textContent = count;
    }
}

/**
 * 카드 호버 효과 초기화
 * @param {NodeList} cards - 카드 요소 목록
 */
function initCardHoverEffects(cards) {
    cards.forEach(card => {
        // 호버 효과
        card.addEventListener('mouseenter', () => {
            card.classList.add('hover');
        });

        card.addEventListener('mouseleave', () => {
            card.classList.remove('hover');
        });
    });
}
