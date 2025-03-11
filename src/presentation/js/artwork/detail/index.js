/**
 * 작품 상세 페이지 진입점
 * 각 모듈을 초기화하고 통합합니다.
 */
import { initRelatedArtworks } from './related.js';
import { initComment } from './comment.js';
import { initImageViewer } from './viewer.js';
import { fadeIn } from '../common/util.js';

document.addEventListener('DOMContentLoaded', function () {
    // 모듈 초기화
    initRelatedArtworks();
    initComment();
    initImageViewer();

    // 페이지 로딩 애니메이션
    const mainContent = document.querySelector('.artwork-detail-container');
    if (mainContent) {
        fadeIn(mainContent);
    }
});

export { initRelatedArtworks, initComment, initImageViewer };
