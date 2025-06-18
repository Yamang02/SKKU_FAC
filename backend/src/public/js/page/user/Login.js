/**
 * 로그인 페이지 JavaScript
 */
import UserApi from '../../api/UserApi.js';
import { showErrorMessage, showSuccessMessage } from '../../common/util/notification.js';

document.addEventListener('DOMContentLoaded', function () {
    const togglePassword = document.querySelector('.toggle-password-user');
    const passwordInput = document.getElementById('password');
    const loginForm = document.querySelector('form');

    // 플래시 메시지 처리
    const checkFlashMessage = async () => {
        try {
            const response = await UserApi.getFlashMessage();

            if (response.success && response.data && response.data.flash) {
                const flash = response.data.flash;
                if (flash.type === 'success') {
                    showSuccessMessage(flash.message);
                } else if (flash.type === 'error') {
                    showErrorMessage(flash.message);
                }
            }
        } catch (error) {
            console.error('플래시 메시지 처리 중 오류:', error);
            // 플래시 메시지 처리 실패는 사용자에게 표시하지 않음
        }
    };

    // 페이지 로드 시 플래시 메시지 확인
    checkFlashMessage();

    // 비밀번호 토글 기능
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function (e) {
            e.preventDefault();
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);

            const icon = this.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-eye');
                icon.classList.toggle('fa-eye-slash');
            }
        });
    }

    // 폼 제출 전 유효성 검사
    if (loginForm) {
        loginForm.addEventListener('submit', async e => {
            e.preventDefault(); // 폼 제출의 기본 동작을 먼저 막습니다

            const username = document.querySelector('#username').value;
            const password = passwordInput.value;

            if (!username || !password) {
                showErrorMessage('아이디와 비밀번호를 모두 입력해주세요.');
                return;
            }

            try {
                const response = await UserApi.login({ username, password });
                if (response.success) {
                    window.location.href = '/';
                } else {
                    const errorMessage = response.error || '아이디와 비밀번호를 확인해주세요.';
                    showErrorMessage(errorMessage);
                }
            } catch (error) {
                showErrorMessage(error.message || '로그인 중 오류가 발생했습니다.');
            }
        });
    }
});
