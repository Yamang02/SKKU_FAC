/**
 * 알림 유틸리티 - TypeScript 버전
 */

// 알림 타입 정의
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

/**
 * 브라우저 알림 표시
 */
const showNotification = (
    message: string,
    type: NotificationType
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

    // 간단한 브라우저 알림
    if (type === 'error') {
        alert(`오류: ${message}`);
    } else if (type === 'success') {
        console.log(`성공: ${message}`);
    } else {
        alert(`${type}: ${message}`);
    }
};

/**
 * 성공 메시지 표시
 */
export const showSuccessMessage = (message: string): void => {
    showNotification(message, 'success');
};

/**
 * 에러 메시지 표시
 */
export const showErrorMessage = (message: string): void => {
    showNotification(message, 'error');
};

/**
 * 경고 메시지 표시
 */
export const showWarningMessage = (message: string): void => {
    showNotification(message, 'warning');
};

/**
 * 정보 메시지 표시
 */
export const showInfoMessage = (message: string): void => {
    showNotification(message, 'info');
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
