/**
 * 작품 목록 페이지 진입점
 * 각 모듈을 초기화하고 통합합니다.
 */
import { initFilter } from './filter.js';
import { initGallery } from './gallery.js';
import { initSearch } from './search.js';
import { initPagination } from './pagination.js';
import { initCarousel } from './carousel.js';
import { fadeIn } from '../common/util.js';

document.addEventListener('DOMContentLoaded', function () {
    // 모듈 초기화
    initCarousel();
    initFilter();
    initGallery();
    initSearch();
    initPagination();

    // 페이지 로딩 애니메이션
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        fadeIn(mainContent);
    }
});

export { initCarousel, initFilter, initGallery, initSearch, initPagination };
