/**
 * 프로필 페이지 JavaScript
 */
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.profile-form');
    const newPassword = document.getElementById('newPassword');
    const confirmNewPassword = document.getElementById('confirmNewPassword');

    // 비밀번호 토글 기능
    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const input = button.previousElementSibling;
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);

            const icon = button.querySelector('i');
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });
    });

    // 폼 유효성 검사
    const validateForm = (e) => {
        let isValid = true;
        let errorMessage = '';

        // 새 비밀번호 입력시 확인
        if (newPassword.value || confirmNewPassword.value) {
            if (newPassword.value !== confirmNewPassword.value) {
                isValid = false;
                errorMessage = '새 비밀번호가 일치하지 않습니다.';
            }
        }

        if (!isValid) {
            e.preventDefault();
            showError(errorMessage);
        }
    };

    form.addEventListener('submit', validateForm);

    // 에러 메시지 표시
    const showError = (message) => {
        const alertContainer = document.querySelector('.alert-danger') || (() => {
            const alert = document.createElement('div');
            alert.classList.add('alert', 'alert-danger');
            form.insertBefore(alert, form.firstChild);
            return alert;
        })();

        alertContainer.textContent = message;
        alertContainer.style.display = 'block';

        setTimeout(() => {
            alertContainer.style.display = 'none';
        }, 3000);
    };

    // 성공 메시지 자동 숨김
    const successAlert = document.querySelector('.alert-success');
    if (successAlert) {
        setTimeout(() => {
            successAlert.style.display = 'none';
        }, 3000);
    }
});
