/**
 * 홈 메인 페이지 진입점
 * 각 모듈을 초기화하고 통합합니다.
 */
import { initHero } from './hero.js';
import { initFeatured } from './featured.js';
import { initModal } from './modal.js';
import { fadeIn } from '../common/util.js';

document.addEventListener('DOMContentLoaded', function () {
    // 모듈 초기화
    initHero();
    initFeatured();
    initModal();

    // 페이지 로딩 애니메이션
    const mainContent = document.querySelector('main');
    if (mainContent) {
        fadeIn(mainContent);
    }
});

export { initHero, initFeatured, initModal };
