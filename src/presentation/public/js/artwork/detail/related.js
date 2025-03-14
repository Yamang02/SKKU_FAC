/**
 * 작품 상세 페이지 - 관련 작품 모듈
 * 관련 작품 스크롤 기능을 처리합니다.
 */
import { animateButtonClick } from '../common/animation.js';

/**
 * 관련 작품 기능 초기화
 */
export function initRelatedArtworks() {
    const scrollContainer = document.querySelector('.related_artworks_list');
    const prevBtn = document.querySelector('.prev_btn');
    const nextBtn = document.querySelector('.next_btn');

    if (!scrollContainer || !prevBtn || !nextBtn) return;

    // 이전 버튼 클릭 이벤트
    prevBtn.addEventListener('click', () => {
        scrollContainer.scrollBy({ left: -340, behavior: 'smooth' });
        animateButtonClick(prevBtn);
        updateScrollButtons();
    });

    // 다음 버튼 클릭 이벤트
    nextBtn.addEventListener('click', () => {
        scrollContainer.scrollBy({ left: 340, behavior: 'smooth' });
        animateButtonClick(nextBtn);
        updateScrollButtons();
    });

    // 스크롤 이벤트
    scrollContainer.addEventListener('scroll', () => {
        updateScrollButtons();
    });

    // 초기 버튼 상태 업데이트
    updateScrollButtons();

    // 관련 작품 클릭 이벤트
    initRelatedArtworkItems();
}

/**
 * 스크롤 버튼 상태 업데이트
 */
function updateScrollButtons() {
    const scrollContainer = document.querySelector('.related_artworks_list');
    const prevBtn = document.querySelector('.prev_btn');
    const nextBtn = document.querySelector('.next_btn');

    if (!scrollContainer || !prevBtn || !nextBtn) return;

    // 왼쪽 끝에 도달했는지 확인
    const isAtStart = scrollContainer.scrollLeft <= 10;
    // 오른쪽 끝에 도달했는지 확인
    const isAtEnd = scrollContainer.scrollLeft + scrollContainer.offsetWidth >= scrollContainer.scrollWidth - 10;

    // 버튼 상태 업데이트
    prevBtn.style.opacity = isAtStart ? '0.5' : '1';
    prevBtn.disabled = isAtStart;
    nextBtn.style.opacity = isAtEnd ? '0.5' : '1';
    nextBtn.disabled = isAtEnd;
}

/**
 * 관련 작품 아이템 클릭 이벤트 초기화
 */
function initRelatedArtworkItems() {
    const relatedArtworks = document.querySelectorAll('.related_artwork_item');

    if (!relatedArtworks.length) return;

    relatedArtworks.forEach(item => {
        item.addEventListener('click', () => {
            const artworkId = item.dataset.artworkId;
            if (artworkId) {
                window.location.href = `/artwork/${artworkId}`;
            }
        });
    });
}
