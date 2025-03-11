/**
 * 전시 상세 페이지 진입점
 * 각 모듈을 초기화하고 통합합니다.
 */
import { initImageLoader } from './image.js';
import { initFilter } from './filter.js';
import { fadeIn } from '../common/util.js';

document.addEventListener('DOMContentLoaded', function () {
    // 모듈 초기화
    initImageLoader();
    initFilter();

    // 페이지 로딩 애니메이션
    const mainContent = document.querySelector('main');
    if (mainContent) {
        fadeIn(mainContent);
    }
});

export { initImageLoader, initFilter };
