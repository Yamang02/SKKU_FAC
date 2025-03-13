/**
 * 전시 목록 페이지 - 유틸리티 모듈
 * 공통 유틸리티 함수들을 제공합니다.
 */

/**
 * 전시회 수 업데이트
 * @param {number} count - 표시된 전시회 수
 */
export function updateExhibitionCount(count) {
    const countElement = document.getElementById('exhibition-count');
    if (countElement) {
        countElement.innerHTML = `총 <strong>${count}</strong>개의 전시회가 검색되었습니다.`;
    }
}

/**
 * 요소 페이드인 애니메이션
 * @param {HTMLElement} element - 애니메이션을 적용할 요소
 * @param {number} duration - 애니메이션 지속 시간 (ms)
 */
export function fadeIn(element, duration = 300) {
    if (!element) return;

    element.style.opacity = '0';
    element.style.display = '';

    let start = null;

    function animate(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        const opacity = Math.min(progress / duration, 1);

        element.style.opacity = opacity;

        if (progress < duration) {
            requestAnimationFrame(animate);
        }
    }

    requestAnimationFrame(animate);
}

/**
 * 요소 페이드아웃 애니메이션
 * @param {HTMLElement} element - 애니메이션을 적용할 요소
 * @param {number} duration - 애니메이션 지속 시간 (ms)
 * @param {Function} callback - 애니메이션 완료 후 콜백
 */
export function fadeOut(element, duration = 300, callback) {
    if (!element) return;

    let start = null;
    const initialOpacity = parseFloat(getComputedStyle(element).opacity);

    function animate(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        const opacity = Math.max(initialOpacity - (progress / duration), 0);

        element.style.opacity = opacity;

        if (progress < duration) {
            requestAnimationFrame(animate);
        } else {
            element.style.display = 'none';
            if (typeof callback === 'function') callback();
        }
    }

    requestAnimationFrame(animate);
}

/**
 * 오류 메시지 표시
 * @param {string} message - 표시할 메시지
 * @param {number} duration - 표시 지속 시간 (ms)
 */
export function showErrorMessage(message, duration = 3000) {
    // 기존 오류 메시지 제거
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        document.body.removeChild(existingError);
    }

    // 새 오류 메시지 생성
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.position = 'fixed';
    errorDiv.style.top = '20px';
    errorDiv.style.left = '50%';
    errorDiv.style.transform = 'translateX(-50%)';
    errorDiv.style.backgroundColor = 'rgba(220, 53, 69, 0.9)';
    errorDiv.style.color = 'white';
    errorDiv.style.padding = '10px 20px';
    errorDiv.style.borderRadius = '4px';
    errorDiv.style.zIndex = '2000';
    errorDiv.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';

    // 문서에 추가
    document.body.appendChild(errorDiv);

    // 일정 시간 후 제거
    setTimeout(() => {
        fadeOut(errorDiv, 500, () => {
            if (document.body.contains(errorDiv)) {
                document.body.removeChild(errorDiv);
            }
        });
    }, duration);
}

/**
 * 성공 메시지 표시
 * @param {string} message - 표시할 메시지
 * @param {number} duration - 표시 지속 시간 (ms)
 */
export function showSuccessMessage(message, duration = 3000) {
    // 기존 메시지 제거
    const existingMessage = document.querySelector('.success-message');
    if (existingMessage) {
        document.body.removeChild(existingMessage);
    }

    // 새 메시지 생성
    const messageDiv = document.createElement('div');
    messageDiv.className = 'success-message';
    messageDiv.textContent = message;
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '20px';
    messageDiv.style.left = '50%';
    messageDiv.style.transform = 'translateX(-50%)';
    messageDiv.style.backgroundColor = 'rgba(40, 167, 69, 0.9)';
    messageDiv.style.color = 'white';
    messageDiv.style.padding = '10px 20px';
    messageDiv.style.borderRadius = '4px';
    messageDiv.style.zIndex = '2000';
    messageDiv.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';

    // 문서에 추가
    document.body.appendChild(messageDiv);

    // 일정 시간 후 제거
    setTimeout(() => {
        fadeOut(messageDiv, 500, () => {
            if (document.body.contains(messageDiv)) {
                document.body.removeChild(messageDiv);
            }
        });
    }, duration);
}
