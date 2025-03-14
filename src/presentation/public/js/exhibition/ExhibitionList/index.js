/**
 * 전시회 목록 페이지 - 메인 스크립트
 * 전시회 목록 페이지의 기능을 초기화합니다.
 */
import { showExhibitionModal } from './modal.js';
import { initGrid } from './grid.js';
import { initFilters } from './filters.js';
import { initSearch } from './search.js';
import { initLoadMore } from './loadMore.js';

// DOM이 로드되면 실행
document.addEventListener('DOMContentLoaded', () => {
    // 그리드 초기화
    initGrid();

    // 필터 초기화
    initFilters();

    // 검색 초기화
    initSearch();

    // 무한 스크롤 초기화
    initLoadMore();

    // 전시회 카드 클릭 이벤트 초기화
    initExhibitionCardEvents();
});

/**
 * 전시회 카드 클릭 이벤트 초기화
 */
function initExhibitionCardEvents() {
    const exhibitionCards = document.querySelectorAll('.exhibition-card');

    exhibitionCards.forEach(card => {
        card.addEventListener('click', () => {
            const exhibitionId = card.dataset.exhibitionId;

            // 전시회 상세 정보 이벤트 발생
            const event = new CustomEvent('exhibition:selected', {
                detail: { exhibitionId }
            });
            document.dispatchEvent(event);

            // 모달 열기
            const exhibitionData = {
                imageUrl: card.querySelector('.exhibition-image').src,
                title: card.querySelector('.exhibition-title').textContent.trim(),
                startDate: card.dataset.startDate,
                endDate: card.dataset.endDate,
                location: card.dataset.location,
                description: card.dataset.description,
                type: card.querySelector('.exhibition-type')?.textContent || '일반 전시',
                artists: (card.dataset.artists || '').split(','),
                viewingHours: card.dataset.viewingHours || '10:00 - 18:00',
                admission: card.dataset.admission || '무료'
            };
            showExhibitionModal(exhibitionData);
        });
    });
}
