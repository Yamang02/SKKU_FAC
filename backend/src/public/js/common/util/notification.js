/**
 * 공통 알림 유틸리티 모듈
 * 재사용 가능한 알림 관련 유틸리티 함수들을 제공합니다.
 */

const NOTIFICATION_DURATION = 3000; // 알림이 표시되는 시간 (ms)
const FADE_DURATION = 500; // 페이드 아웃 시간 (ms)

/**
 * 알림 메시지 표시를 위한 컨테이너 생성
 * @returns {HTMLElement} 알림 컨테이너 요소
 */
function getNotificationContainer() {
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.className = 'notification-container';
        document.body.appendChild(container);
    }
    return container;
}

/**
 * 확인 메시지 표시
 * @param {string} message - 확인할 메시지
 * @returns {Promise<boolean>} - 사용자가 확인(true) 또는 취소(false) 선택
 */
export function showConfirm(message) {
    return new Promise(resolve => {
        const container = getNotificationContainer();
        const confirmBox = document.createElement('div');
        confirmBox.className = 'notification notification--confirm';

        const messageElement = document.createElement('p');
        messageElement.textContent = message;
        confirmBox.appendChild(messageElement);

        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container--notification';

        const confirmButton = document.createElement('button');
        confirmButton.textContent = '확인';
        confirmButton.className = 'confirm-button';
        confirmButton.onclick = () => {
            resolve(true);
            container.removeChild(confirmBox);
            if (!container.hasChildNodes()) {
                document.body.removeChild(container);
            }
        };

        const cancelButton = document.createElement('button');
        cancelButton.textContent = '취소';
        cancelButton.className = 'cancel-button';
        cancelButton.onclick = () => {
            resolve(false);
            container.removeChild(confirmBox);
            if (!container.hasChildNodes()) {
                document.body.removeChild(container);
            }
        };

        buttonContainer.appendChild(confirmButton);
        buttonContainer.appendChild(cancelButton);
        confirmBox.appendChild(buttonContainer);
        container.appendChild(confirmBox);
    });
}

/**
 * 알림 메시지 표시
 * @param {string} message - 표시할 메시지
 * @param {string} type - 알림 타입 ('error' | 'success')
 */
function showNotification(message, type) {
    const container = getNotificationContainer();
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.textContent = message;

    container.appendChild(notification);

    // 애니메이션을 위한 강제 리플로우
    notification.offsetHeight;

    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode === container) {
                container.removeChild(notification);
            }
            // 컨테이너가 비어있으면 제거
            if (!container.hasChildNodes()) {
                document.body.removeChild(container);
            }
        }, FADE_DURATION);
    }, NOTIFICATION_DURATION);
}

/**
 * 오류 메시지 표시
 * @param {string} message - 오류 메시지
 */
export function showErrorMessage(message) {
    showNotification(message, 'error');
}

/**
 * 성공 메시지 표시
 * @param {string} message - 성공 메시지
 */
export function showSuccessMessage(message) {
    showNotification(message, 'success');
}

/**
 * 로딩 상태 표시
 * @param {boolean} isLoading - 로딩 상태
 */
export function showLoading(isLoading) {
    const container = getNotificationContainer();
    const loadingClassName = 'notification--loading';

    // 현재 컨테이너 안에서 로딩 요소 있는지 확인
    let loadingElement = container.querySelector(`.notification.${loadingClassName}`);

    if (isLoading) {
        if (!loadingElement) {
            // 없으면 새로 생성
            loadingElement = document.createElement('div');
            loadingElement.className = `notification ${loadingClassName}`;

            // 로딩 아이콘
            const icon = document.createElement('span');
            icon.className = 'loading-icon';
            loadingElement.appendChild(icon);

            // 텍스트
            const text = document.createElement('span');
            text.textContent = '처리 중입니다...';
            loadingElement.appendChild(text);

            container.appendChild(loadingElement);
        }
    } else {
        // 있으면 제거
        if (loadingElement) {
            container.removeChild(loadingElement);
        }
    }
}
