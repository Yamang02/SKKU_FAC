/**
 * 공통 애니메이션 유틸리티 모듈
 * 재사용 가능한 애니메이션 관련 유틸리티 함수들을 제공합니다.
 */

/**
 * 요소를 페이드인 효과로 표시
 * @param {HTMLElement} element - 대상 요소
 * @param {Function} callback - 완료 후 콜백 함수
 */
export function fadeIn(element, callback) {
    if (!element) return;

    // 이미 표시 중이면 무시
    if (element.style.display !== 'none' && element.style.opacity === '1') {
        if (callback) callback();
        return;
    }

    // 초기 상태 설정
    element.style.opacity = '0';
    element.style.display = '';

    // 트랜지션 설정
    element.style.transition = 'opacity 0.3s ease';

    // 다음 프레임에서 opacity 변경 (트랜지션 효과를 위해)
    requestAnimationFrame(() => {
        element.style.opacity = '1';
    });

    // 트랜지션 완료 후 콜백 실행
    if (callback) {
        element.addEventListener('transitionend', function handler() {
            callback();
            element.removeEventListener('transitionend', handler);
        });
    }
}

/**
 * 요소를 페이드아웃 효과로 숨김
 * @param {HTMLElement} element - 대상 요소
 * @param {Function} callback - 완료 후 콜백 함수
 */
export function fadeOut(element, callback) {
    if (!element) return;

    // 이미 숨겨져 있으면 무시
    if (element.style.display === 'none') {
        if (callback) callback();
        return;
    }

    // 트랜지션 설정
    element.style.transition = 'opacity 0.3s ease';

    // opacity 변경
    element.style.opacity = '0';

    // 트랜지션 완료 후 display 변경 및 콜백 실행
    element.addEventListener('transitionend', function handler() {
        element.style.display = 'none';
        if (callback) callback();
        element.removeEventListener('transitionend', handler);
    });
}
