/**
 * 회원가입 페이지 JavaScript
 */
document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('.register-form');
    const roleSelect = document.getElementById('role');
    const clubMemberField = document.querySelector('.club-member-field');
    const artistField = document.querySelector('.artist-field');
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');

    /**
     * 에러 메시지 표시
     */
    function showError(message) {
        // 기존 에러 메시지 제거
        const existingAlert = document.querySelector('.alert-danger');
        if (existingAlert) {
            existingAlert.remove();
        }

        // 새 에러 메시지 생성
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-danger';
        alertDiv.textContent = message;

        // 폼 상단에 에러 메시지 삽입
        const title = document.querySelector('.register-title');
        title.insertAdjacentElement('afterend', alertDiv);

        // 3초 후 에러 메시지 자동 제거
        setTimeout(() => {
            alertDiv.remove();
        }, 3000);
    }

    /**
     * 가입 유형에 따른 필드 표시/숨김 처리
     */
    function updateFields() {
        const selectedRole = roleSelect.value;
        clubMemberField.style.display = selectedRole === 'MEMBER' ? 'block' : 'none';
        artistField.style.display = selectedRole === 'ARTIST' ? 'block' : 'none';

        // 필수 필드 설정 업데이트
        const studentIdInput = document.getElementById('studentId');
        const artistBioInput = document.getElementById('artistBio');
        const artistWebsiteInput = document.getElementById('artistWebsite');

        // 필드 필수 여부 설정
        studentIdInput.required = selectedRole === 'MEMBER';
        artistBioInput.required = selectedRole === 'ARTIST';
        artistWebsiteInput.required = false; // 웹사이트는 선택사항

        // placeholder 업데이트
        studentIdInput.placeholder = selectedRole === 'MEMBER' ? '학번을 입력하세요 (필수)' : '학번을 입력하세요 (선택)';
        artistBioInput.placeholder = selectedRole === 'ARTIST' ? '작가 소개를 입력하세요 (필수)' : '작가 소개를 입력하세요 (선택)';
    }

    /**
     * 비밀번호 표시/숨김 토글
     */
    function setupPasswordToggles() {
        togglePasswordButtons.forEach(button => {
            button.addEventListener('click', function () {
                const input = this.previousElementSibling;
                const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                input.setAttribute('type', type);

                const icon = this.querySelector('i');
                icon.classList.toggle('fa-eye');
                icon.classList.toggle('fa-eye-slash');
            });
        });
    }

    /**
     * 비밀번호 일치 확인
     */
    function validatePassword() {
        if (password.value !== confirmPassword.value) {
            confirmPassword.setCustomValidity('비밀번호가 일치하지 않습니다.');
        } else {
            confirmPassword.setCustomValidity('');
        }
    }

    /**
     * 폼 제출 전 유효성 검사
     */
    function validateForm(event) {
        const selectedRole = roleSelect.value;

        // 기본 필드 검증
        if (!form.checkValidity()) {
            event.preventDefault();
            return false;
        }

        // 비밀번호 일치 확인
        if (password.value !== confirmPassword.value) {
            event.preventDefault();
            showError('비밀번호가 일치하지 않습니다.');
            return false;
        }

        // 역할별 필수 필드 검증
        if (selectedRole === 'MEMBER' && !document.getElementById('studentId').value) {
            event.preventDefault();
            showError('동아리 회원은 학번을 입력해야 합니다.');
            return false;
        }

        if (selectedRole === 'ARTIST' && !document.getElementById('artistBio').value) {
            event.preventDefault();
            showError('작가는 작가 소개를 입력해야 합니다.');
            return false;
        }

        return true;
    }

    // 이벤트 리스너 등록
    roleSelect.addEventListener('change', updateFields);
    password.addEventListener('change', validatePassword);
    confirmPassword.addEventListener('keyup', validatePassword);
    form.addEventListener('submit', validateForm);

    // 초기 설정
    setupPasswordToggles();
    updateFields();
});
