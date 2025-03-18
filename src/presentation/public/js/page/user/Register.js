/**
 * 회원가입 페이지 JavaScript
 */
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.register-form');
    const roleSelect = document.getElementById('role');
    const clubMemberField = document.querySelector('.club-member-field');
    const artistField = document.querySelector('.artist-field');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');

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

    // 가입 유형에 따른 필드 표시/숨김
    const updateFields = () => {
        const selectedRole = roleSelect.value;

        // 모든 필드 초기화
        clubMemberField.style.display = 'none';
        artistField.style.display = 'none';

        // 필수 필드 초기화
        document.getElementById('studentId').required = false;
        document.getElementById('artistBio').required = false;

        // 선택된 역할에 따라 필드 표시 및 필수 설정
        if (selectedRole === 'MEMBER') {
            clubMemberField.style.display = 'block';
            document.getElementById('studentId').required = true;
        } else if (selectedRole === 'ARTIST') {
            artistField.style.display = 'block';
            document.getElementById('artistBio').required = true;
        }
    };

    roleSelect.addEventListener('change', updateFields);
    updateFields(); // 초기 상태 설정

    // 폼 유효성 검사
    const validateForm = (e) => {
        let isValid = true;
        let errorMessage = '';

        // 비밀번호 일치 확인
        if (password.value !== confirmPassword.value) {
            isValid = false;
            errorMessage = '비밀번호가 일치하지 않습니다.';
        }

        // 가입 유형별 필수 필드 검사
        const selectedRole = roleSelect.value;
        if (selectedRole === 'MEMBER') {
            const studentId = document.getElementById('studentId').value;
            if (!studentId) {
                isValid = false;
                errorMessage = '학번을 입력해주세요.';
            } else if (!/^\d{10}$/.test(studentId)) {
                isValid = false;
                errorMessage = '학번은 10자리 숫자여야 합니다.';
            }
        } else if (selectedRole === 'ARTIST') {
            const artistBio = document.getElementById('artistBio').value;
            if (!artistBio.trim()) {
                isValid = false;
                errorMessage = '작가 소개를 입력해주세요.';
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
});
