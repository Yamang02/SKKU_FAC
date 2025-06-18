/**
 * 비밀번호 재설정 페이지 JavaScript
 */
import { showErrorMessage, showSuccessMessage } from '../../common/util/notification.js';
import AuthApi from '../../api/AuthApi.js';

document.addEventListener('DOMContentLoaded', () => {
    const resetForm = document.querySelector('#reset-password-form');
    const resendForm = document.querySelector('#resend-token-form');
    const tokenExpiredContainer = document.querySelector('#token-expired-container');

    // URL에서 토큰 가져오기
    const token = new URLSearchParams(window.location.search).get('token');

    // 토큰이 없으면 에러 메시지 표시
    if (!token) {
        showErrorMessage('유효하지 않은 요청입니다. 비밀번호 재설정 링크를 다시 요청해주세요.');
        resetForm.style.display = 'none';
        tokenExpiredContainer.style.display = 'block';
        return;
    }

    // 페이지 로드 시 토큰 유효성 검사
    validateTokenOnLoad();

    async function validateTokenOnLoad() {
        try {
            // 폼 비활성화
            resetForm.querySelectorAll('input, button').forEach(el => (el.disabled = true));

            // 토큰 유효성 검사
            await AuthApi.validateToken(token, 'PASSWORD_RESET');

            // 폼 활성화
            resetForm.querySelectorAll('input, button').forEach(el => (el.disabled = false));
        } catch (error) {
            // 토큰 만료 처리
            const errorResponse = error.response?.data;
            const errorMessage = errorResponse?.message || '유효하지 않은 토큰입니다.';
            showErrorMessage(errorMessage);

            if (errorResponse?.data?.tokenExpired) {
                resetForm.style.display = 'none';
                tokenExpiredContainer.style.display = 'block';
            } else {
                // 기타 오류 처리
                resetForm.style.display = 'none';
                tokenExpiredContainer.style.display = 'block';
            }
        }
    }

    // 비밀번호 재설정 폼 처리
    if (resetForm) {
        resetForm.addEventListener('submit', async e => {
            e.preventDefault();

            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const submitButton = resetForm.querySelector('button[type="submit"]');

            // 비밀번호 확인 로직
            if (newPassword !== confirmPassword) {
                showErrorMessage('비밀번호가 일치하지 않습니다.');
                return;
            }

            // 버튼 비활성화 및 로딩 상태 표시
            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="spinner"></span> 처리 중...';
            submitButton.classList.add('btn-loading');

            try {
                // 비밀번호 재설정 API 호출
                await AuthApi.resetPassword(token, newPassword);

                showSuccessMessage('비밀번호가 성공적으로 재설정되었습니다.');
                setTimeout(() => {
                    window.location.href = '/user/login';
                }, 3000);
            } catch (error) {
                // 에러 객체에서 메시지 추출
                const errorResponse = error.response?.data;
                const errorMessage = errorResponse?.message || '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
                showErrorMessage(errorMessage);

                // 토큰 만료 처리
                if (errorResponse?.data?.tokenExpired) {
                    resetForm.style.display = 'none';
                    tokenExpiredContainer.style.display = 'block';
                }

                // 버튼 상태 복원
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
                submitButton.classList.remove('btn-loading');
            }
        });
    }

    // 토큰 재발송 폼 처리
    if (resendForm) {
        resendForm.addEventListener('submit', async e => {
            e.preventDefault();

            const email = document.getElementById('email-for-resend').value;
            const submitButton = resendForm.querySelector('button[type="submit"]');

            // 버튼 비활성화 및 로딩 상태 표시
            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="spinner"></span> 처리 중...';
            submitButton.classList.add('btn-loading');

            try {
                // 토큰 재발송 API 호출
                await AuthApi.resendToken(email, 'PASSWORD_RESET');

                showSuccessMessage('새로운 비밀번호 재설정 링크가 이메일로 전송되었습니다.');
                setTimeout(() => {
                    window.location.href = '/user/login';
                }, 3000);
            } catch (error) {
                // 에러 객체에서 메시지 추출
                const errorMessage =
                    error.response?.data?.message || '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
                showErrorMessage(errorMessage);

                // 버튼 상태 복원
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
                submitButton.classList.remove('btn-loading');
            }
        });
    }
});
