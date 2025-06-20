/**
 * 알림 유틸리티 - TypeScript 버전
 */

// 알림 타입 정의
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

// 알림 옵션 타입
export interface NotificationOptions {
    duration?: number;
    position?: 'top' | 'bottom' | 'center';
    showClose?: boolean;
}

// 기본 알림 옵션
const DEFAULT_OPTIONS: NotificationOptions = {
    duration: 3000,
    position: 'top',
    showClose: true
};

/**
 * 브라우저 알림 표시 (임시 구현)
 * 추후 Toast 라이브러리나 커스텀 컴포넌트로 대체 예정
 */
const showNotification = (
    message: string,
    type: NotificationType,
    options: NotificationOptions = {}
): void => {
    // 개발 환경에서는 콘솔에 출력
    if (process.env.NODE_ENV === 'development') {
        const emoji = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        console.log(`${emoji[type]} ${type.toUpperCase()}: ${message}`);
    }

    // 브라우저 alert (임시)
    // TODO: 실제 Toast 컴포넌트로 교체
    if (type === 'error') {
        alert(`오류: ${message}`);
    } else if (type === 'success') {
        // 성공 메시지는 조용히 처리 (콘솔에만 출력)
        console.log(`성공: ${message}`);
    } else {
        alert(`${type}: ${message}`);
    }
};

/**
 * 성공 메시지 표시
 */
export const showSuccessMessage = (
    message: string,
    options?: NotificationOptions
): void => {
    showNotification(message, 'success', options);
};

/**
 * 에러 메시지 표시
 */
export const showErrorMessage = (
    message: string,
    options?: NotificationOptions
): void => {
    showNotification(message, 'error', options);
};

/**
 * 경고 메시지 표시
 */
export const showWarningMessage = (
    message: string,
    options?: NotificationOptions
): void => {
    showNotification(message, 'warning', options);
};

/**
 * 정보 메시지 표시
 */
export const showInfoMessage = (
    message: string,
    options?: NotificationOptions
): void => {
    showNotification(message, 'info', options);
};

/**
 * API 에러 메시지 파싱 및 표시
 */
export const showApiErrorMessage = (error: unknown): void => {
    let message = '알 수 없는 오류가 발생했습니다.';

    if (error instanceof Error) {
        message = error.message;
    } else if (typeof error === 'string') {
        message = error;
    } else if (error && typeof error === 'object') {
        const errorObj = error as Record<string, unknown>;
        if (errorObj.message && typeof errorObj.message === 'string') {
            message = errorObj.message;
        } else if (errorObj.error && typeof errorObj.error === 'string') {
            message = errorObj.error;
        }
    }

    showErrorMessage(message);
};

/**
 * 유효성 검사 에러 메시지 표시
 */
export const showValidationErrors = (errors: Record<string, string[]>): void => {
    const errorMessages = Object.values(errors).flat();
    const message = errorMessages.join('\n');
    showErrorMessage(`입력 오류:\n${message}`);
};

export default {
    showSuccessMessage,
    showErrorMessage,
    showWarningMessage,
    showInfoMessage,
    showApiErrorMessage,
    showValidationErrors
};
