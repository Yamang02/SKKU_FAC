/**
 * 회원가입 페이지 JavaScript
 */
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.form-user');
    const roleSelect = document.getElementById('role');
    const clubMemberGroup = document.getElementById('clubMemberGroup');
    const skkuFields = document.getElementById('skkuFields');
    const affiliationGroup = document.getElementById('affiliationGroup');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');

    // 비밀번호 토글 기능
    document.querySelectorAll('.toggle-password-user').forEach(button => {
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

    // 회원 유형 선택에 따른 필드 표시/숨김
    const updateFields = () => {
        const selectedRole = roleSelect.value;

        // 모든 필드 초기화
        clubMemberGroup.style.display = 'none';
        skkuFields.style.display = 'none';
        affiliationGroup.style.display = 'none';

        // 필수 필드 초기화
        document.getElementById('department').required = false;
        document.getElementById('studentYear').required = false;
        document.getElementById('affiliation').required = false;

        // 선택된 역할에 따라 필드 표시 및 필수 설정
        if (selectedRole === 'SKKU_MEMBER') {
            clubMemberGroup.style.display = 'block';
            skkuFields.style.display = 'block';
            document.getElementById('department').required = true;
            document.getElementById('studentYear').required = true;
        } else if (selectedRole === 'EXTERNAL_MEMBER') {
            affiliationGroup.style.display = 'block';
            document.getElementById('affiliation').required = true;
        }
    };

    roleSelect.addEventListener('change', updateFields);
    updateFields(); // 초기 상태 설정

    // 폼 유효성 검사
    form.addEventListener('submit', function (e) {
        const errorDiv = document.querySelector('.alert-danger-user');
        errorDiv.textContent = '';

        // 비밀번호 확인
        if (password.value !== confirmPassword.value) {
            e.preventDefault();
            errorDiv.textContent = '비밀번호가 일치하지 않습니다.';
            return;
        }

        // 성균관대 재학/졸업생인 경우 학번 형식 검사
        if (roleSelect.value === 'SKKU_MEMBER') {
            const studentYear = document.getElementById('studentYear').value;
            if (!/^\d{2}$/.test(studentYear)) {
                e.preventDefault();
                errorDiv.textContent = '학번은 2자리 숫자여야 합니다.';
                return;
            }
        }

        // 유효성 검사 통과 시 폼 제출 진행
        // e.preventDefault() 호출하지 않음
    });

    // 에러 메시지 표시
    const showError = (message) => {
        const alertContainer = document.querySelector('.alert-danger-user') || (() => {
            const alert = document.createElement('div');
            alert.classList.add('alert-danger-user');
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
