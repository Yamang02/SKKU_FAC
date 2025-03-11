/**
 * 공통 유틸리티 모듈 진입점
 * 모든 공통 유틸리티 함수들을 내보냅니다.
 */

// DOM 유틸리티
export { domUtils } from './dom.js';

// 애니메이션 유틸리티
export { fadeIn, fadeOut } from './animation.js';

// 알림 유틸리티
export { showErrorMessage, showSuccessMessage } from './notification.js';

// 모달 유틸리티
export { initModal, showModal, closeModal } from './modal.js';

/**
 * 디바운스 함수
 * @param {Function} func - 실행할 함수
 * @param {number} wait - 대기 시간 (밀리초)
 * @returns {Function} 디바운스된 함수
 */
export function debounce(func, wait) {
    let timeout;

    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
