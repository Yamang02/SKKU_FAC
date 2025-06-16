/**
 * React Native Web 알림 시스템
 * 브라우저와 React Native Web 환경에서 사용 가능한 알림 유틸리티
 */
import { Alert } from 'react-native';

// React Native Web의 Alert가 웹에서 사용 가능한지 확인
const isWeb = typeof window !== 'undefined' && window.document;

/**
 * 확인 대화상자 표시
 * @param {string} title - 제목
 * @param {string} message - 메시지
 * @returns {Promise<boolean>} - 사용자가 확인(true) 또는 취소(false) 선택
 */
export function showConfirm(title, message = '') {
    return new Promise((resolve) => {
        if (isWeb) {
            // 웹 환경에서는 브라우저 confirm 사용
            const result = window.confirm(`${title}\n${message}`);
            resolve(result);
        } else {
            // React Native 환경에서는 Alert 사용
            Alert.alert(
                title,
                message,
                [
                    {
                        text: '취소',
                        style: 'cancel',
                        onPress: () => resolve(false)
                    },
                    {
                        text: '확인',
                        onPress: () => resolve(true)
                    }
                ]
            );
        }
    });
}

/**
 * 간단한 알림 표시
 * @param {string} title - 제목
 * @param {string} message - 메시지
 */
export function showAlert(title, message = '') {
    if (isWeb) {
        // 웹 환경에서는 브라우저 alert 사용
        window.alert(`${title}\n${message}`);
    } else {
        // React Native 환경에서는 Alert 사용
        Alert.alert(title, message);
    }
}

/**
 * 오류 메시지 표시
 * @param {string} message - 오류 메시지
 */
export function showErrorMessage(message) {
    console.error('Error:', message);

    if (isWeb) {
        // 웹에서는 console.error와 alert 조합
        window.alert(`오류: ${message}`);
    } else {
        Alert.alert('오류', message);
    }
}

/**
 * 성공 메시지 표시
 * @param {string} message - 성공 메시지
 */
export function showSuccessMessage(message) {
    console.log('Success:', message);

    if (isWeb) {
        // 웹에서는 console.log와 alert 조합
        window.alert(`성공: ${message}`);
    } else {
        Alert.alert('성공', message);
    }
}

/**
 * 로딩 상태 표시/숨기기
 * 현재는 콘솔 로그만 제공 (나중에 React Native Web의 ActivityIndicator로 확장 가능)
 * @param {boolean} isLoading - 로딩 상태
 * @param {string} message - 로딩 메시지 (선택사항)
 */
export function showLoading(isLoading, message = '처리 중입니다...') {
    if (isLoading) {
        console.log('Loading:', message);
    } else {
        console.log('Loading completed');
    }
}

/**
 * API 에러 처리용 헬퍼 함수
 * @param {Error} error - 에러 객체
 * @param {string} defaultMessage - 기본 에러 메시지
 */
export function handleApiError(error, defaultMessage = '요청 처리 중 오류가 발생했습니다.') {
    let errorMessage = defaultMessage;

    if (error.isApiError && error.apiResponse && error.apiResponse.error) {
        errorMessage = error.apiResponse.error;
    } else if (error.message) {
        errorMessage = error.message;
    }

    showErrorMessage(errorMessage);
    return errorMessage;
}
