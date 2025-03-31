/**
 * 로그인 페이지 JavaScript
 */
import userApi from '../../api/user';

document.addEventListener('DOMContentLoaded', function () {
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');
    const loginForm = document.querySelector('form');

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
        loginForm.addEventListener('submit', async (e) => {
            const username = document.querySelector('#username').value;
            const password = passwordInput.value;

            if (!username || !password) {
                e.preventDefault();
                showError('아이디와 비밀번호를 모두 입력해주세요.');
                return;
            }

            try {
                await userApi.login({ username, password });
                window.location.href = '/';
            } catch (error) {
                e.preventDefault();
                showError(error.message || '로그인 중 오류가 발생했습니다.');
            }
        });
    }
});

// 에러 메시지 표시 함수
function showError(message) {
    let alert = document.querySelector('.alert');

    if (!alert) {
        alert = document.createElement('div');
        alert.classList.add('alert', 'alert-danger');
        const form = document.querySelector('form');
        form.insertBefore(alert, form.firstChild);
    }

    alert.textContent = message;
    alert.style.display = 'block';

    // 3초 후 에러 메시지 숨김
    setTimeout(() => {
        alert.style.display = 'none';
    }, 3000);
}
