/**
 * 작품 도메인 - 애니메이션 모듈
 * UI 애니메이션 관련 함수들을 제공합니다.
 */

/**
 * 버튼 클릭 애니메이션
 * @param {HTMLElement} button - 버튼 요소
 */
export function animateButtonClick(button) {
    if (!button) return;

    // 클릭 효과 클래스 추가
    button.classList.add('btn--clicked');

    // 애니메이션 완료 후 클래스 제거
    setTimeout(() => {
        button.classList.remove('btn--clicked');
    }, 300);
}

/**
 * 아이템 클릭 애니메이션
 * @param {HTMLElement} item - 아이템 요소
 */
export function animateItemClick(item) {
    if (!item) return;

    // 클릭 효과 클래스 추가
    item.classList.add('clicked');

    // 애니메이션 완료 후 클래스 제거
    setTimeout(() => {
        item.classList.remove('clicked');
    }, 300);
}

/**
 * 요소 슬라이드 다운 애니메이션
 * @param {HTMLElement} element - 대상 요소
 * @param {Function} callback - 완료 후 콜백 함수
 */
export function slideDown(element, callback) {
    if (!element) return;

    // 초기 상태 설정
    element.style.height = '0';
    element.style.overflow = 'hidden';
    element.style.display = 'block';

    // 요소의 실제 높이 계산
    const height = element.scrollHeight;

    // 트랜지션 설정
    element.style.transition = 'height 0.3s ease';

    // 다음 프레임에서 높이 변경 (트랜지션 효과를 위해)
    requestAnimationFrame(() => {
        element.style.height = `${height}px`;
    });

    // 트랜지션 완료 후 스타일 정리 및 콜백 실행
    element.addEventListener('transitionend', function handler() {
        element.style.height = '';
        element.style.overflow = '';
        if (callback) callback();
        element.removeEventListener('transitionend', handler);
    });
}

/**
 * 요소 슬라이드 업 애니메이션
 * @param {HTMLElement} element - 대상 요소
 * @param {Function} callback - 완료 후 콜백 함수
 */
export function slideUp(element, callback) {
    if (!element) return;

    // 초기 상태 설정
    element.style.height = `${element.scrollHeight}px`;
    element.style.overflow = 'hidden';

    // 트랜지션 설정
    element.style.transition = 'height 0.3s ease';

    // 다음 프레임에서 높이 변경 (트랜지션 효과를 위해)
    requestAnimationFrame(() => {
        element.style.height = '0';
    });

    // 트랜지션 완료 후 스타일 정리 및 콜백 실행
    element.addEventListener('transitionend', function handler() {
        element.style.display = 'none';
        element.style.height = '';
        element.style.overflow = '';
        if (callback) callback();
        element.removeEventListener('transitionend', handler);
    });
}
