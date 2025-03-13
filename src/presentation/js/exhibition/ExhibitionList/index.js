/**
 * 전시 목록 페이지 진입점
 * 각 모듈을 초기화하고 통합합니다.
 */
import { initModal } from './modal.js';
import { initGrid } from './grid.js';
import { fadeIn } from '../common/util.js';
import { initFilters } from './filters.js';
import { initSearch } from './search.js';
import { initLoadMore } from './loadMore.js';

document.addEventListener('DOMContentLoaded', function () {
    // 모듈 초기화
    initModal();
    initGrid();
    initFilters();
    initSearch();
    initLoadMore();

    // 페이지 로딩 애니메이션
    const mainContent = document.querySelector('main');
    if (mainContent) {
        fadeIn(mainContent);
    }

    // 전시회 카드 클릭 이벤트
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

            // 커스텀 이벤트 발생
            const event = new CustomEvent('exhibition:selected', {
                detail: { id: exhibitionId }
            });
            document.dispatchEvent(event);
        });
    });
}

export { initModal, initGrid, initFilters, initSearch, initLoadMore };
