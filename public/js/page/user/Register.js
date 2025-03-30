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
    form.addEventListener('submit', async function (e) {
        e.preventDefault(); // 기본 제출 동작 방지

        // 에러 메시지 초기화
        showError(''); // 에러 메시지 숨김

        // 비밀번호 확인
        if (password.value !== confirmPassword.value) {
            showError('비밀번호가 일치하지 않습니다.');
            return;
        }

        // 성균관대 재학/졸업생인 경우 학번 형식 검사
        if (roleSelect.value === 'SKKU_MEMBER') {
            const studentYear = document.getElementById('studentYear').value;
            if (!/^\d{2}$/.test(studentYear)) {
                showError('학번은 2자리 숫자여야 합니다.');
                return;
            }
        }

        try {
            // 폼 데이터를 객체로 변환
            const formData = {
                username: document.getElementById('username').value,
                email: document.getElementById('email').value,
                password: password.value,
                confirmPassword: confirmPassword.value,
                name: document.getElementById('name').value,
                role: roleSelect.value,
                department: document.getElementById('department')?.value || '',
                studentYear: document.getElementById('studentYear')?.value || '',
                isClubMember: document.getElementById('isClubMember')?.checked || false,
                affiliation: document.getElementById('affiliation')?.value || ''
            };

            const response = await fetch('/user/registration', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                // 성공 시 로그인 페이지로 즉시 이동
                window.location.href = '/user/login';
            } else {
                showError(data.message || '회원가입 중 오류가 발생했습니다.');
            }
        } catch (error) {
            console.error('Registration error:', error);
            showError('서버 오류가 발생했습니다. 다시 시도해주세요.');
        }
    });

    // 에러 메시지 표시
    const showError = (message) => {
        const alertContainer = document.querySelector('.alert-danger-user');
        if (!alertContainer) return; // 요소가 없으면 함수 종료

        if (!message) {
            alertContainer.style.display = 'none';
            return;
        }

        alertContainer.textContent = message;
        alertContainer.style.display = 'block';

        // 3초 후 에러 메시지 숨김
        setTimeout(() => {
            alertContainer.style.display = 'none';
        }, 3000);
    };
});
