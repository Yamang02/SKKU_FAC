/**
 * 작품 도메인 - 공통 유틸리티 모듈
 * 재사용 가능한 유틸리티 함수들을 제공합니다.
 */

// 공통 유틸리티 함수 가져오기
import { fadeIn, fadeOut, debounce, showErrorMessage } from '../../../common/util/index.js';

// 재내보내기
export { fadeIn, fadeOut, debounce, showErrorMessage };

/**
 * 로딩 표시 함수
 * @param {boolean} show - 로딩 표시 여부
 */
export function showLoading(show) {
    const loadingElement = document.querySelector('.loading');

    if (!loadingElement) return;

    if (show) {
        fadeIn(loadingElement);
    } else {
        fadeOut(loadingElement);
    }
}
