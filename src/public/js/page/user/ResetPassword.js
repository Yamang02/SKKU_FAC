/**
 * 비밀번호 재설정 페이지 JavaScript
 */
import { showErrorMessage, showSuccessMessage } from '../../common/util/notification.js';
import AuthApi from '../../api/AuthApi.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#reset-password-form');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const submitButton = form.querySelector('button[type="submit"]');

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

            // URL에서 토큰 가져오기
            const token = new URLSearchParams(window.location.search).get('token');

            try {
                // 비밀번호 재설정 API 호출
                await AuthApi.resetPassword(token, newPassword);

                showSuccessMessage('비밀번호가 성공적으로 재설정되었습니다.');
                setTimeout(() => {
                    window.location.href = '/user/login';
                }, 3000);
            } catch (error) {
                // 에러 객체에서 메시지 추출
                const errorMessage = error.message || '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
                showErrorMessage(errorMessage);

                // 버튼 상태 복원
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
                submitButton.classList.remove('btn-loading');
            }
        });
    }
});
