document.addEventListener('DOMContentLoaded', function () {
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');

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
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            const studentId = document.querySelector('#studentId').value;
            const password = passwordInput.value;

            if (!studentId || !password) {
                e.preventDefault();
                showError('모든 필드를 입력해주세요.');
                return;
            }

            if (!/^\d{10}$/.test(studentId)) {
                e.preventDefault();
                showError('올바른 학번 형식이 아닙니다.');
                return;
            }
        });
    }
});

// 에러 메시지 표시 함수
function showError(message) {
    let alert = document.querySelector('.alert-error');

    if (!alert) {
        alert = document.createElement('div');
        alert.classList.add('alert', 'alert-error');
        const form = document.querySelector('.login-form');
        form.insertBefore(alert, form.firstChild);
    }

    alert.textContent = message;
    alert.style.display = 'block';

    // 3초 후 에러 메시지 숨김
    setTimeout(() => {
        alert.style.display = 'none';
    }, 3000);
}
