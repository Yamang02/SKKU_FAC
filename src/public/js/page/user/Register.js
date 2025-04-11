/**
 * 회원가입 페이지
 * 회원가입 관련 기능을 처리합니다.
 */
import UserApi from '/js/api/UserApi.js';
import { showErrorMessage, showSuccessMessage } from '/js/common/util/notification.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');
    const roleSelect = document.getElementById('role');
    const skkuFields = document.getElementById('skkuFields');
    const externalFields = document.getElementById('externalFields');
    const passwordToggle = document.querySelectorAll('.toggle-password-user');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    // 역할 선택에 따른 필드 표시/숨김
    roleSelect.addEventListener('change', () => {
        const isSkkuMember = roleSelect.value === 'SKKU_MEMBER';
        const isExternalMember = roleSelect.value === 'EXTERNAL_MEMBER';

        skkuFields.style.display = isSkkuMember ? 'block' : 'none';
        externalFields.style.display = isExternalMember ? 'block' : 'none';

        // 필수 필드 설정
        skkuFields.querySelectorAll('input').forEach(input => {
            input.required = isSkkuMember;
        });
        externalFields.querySelectorAll('input').forEach(input => {
            input.required = isExternalMember;
        });
    });

    // 비밀번호 표시/숨김 토글
    passwordToggle.forEach(toggle => {
        toggle.addEventListener('click', function () {
            const inputField = this.previousElementSibling;
            const type = inputField.type === 'password' ? 'text' : 'password';
            inputField.type = type;
            this.querySelector('i').classList.toggle('fa-eye');
            this.querySelector('i').classList.toggle('fa-eye-slash');
        });
    });

    // 폼 제출 처리
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 비밀번호 확인
        if (passwordInput.value !== confirmPasswordInput.value) {
            showErrorMessage('비밀번호가 일치하지 않습니다.');
            return;
        }

        // 폼 데이터 수집
        const formData = new FormData(form);
        const userData = Object.fromEntries(formData.entries());

        // 불필요한 필드 제거
        const { confirmPassword, ...userDataToSend } = userData;

        // 체크박스 값 변환
        userDataToSend.isClubMember = userDataToSend.isClubMember === 'on';

        // 빈 문자열 처리
        if (userDataToSend.affiliation === '') {
            userDataToSend.affiliation = null;
        }

        // DTO 생성
        const userDto = {
            username: userDataToSend.username,
            name: userDataToSend.name,
            email: userDataToSend.email,
            password: userDataToSend.password,
            department: userDataToSend.department,
            role: userDataToSend.role,
            isClubMember: userDataToSend.isClubMember,
            studentYear: userDataToSend.studentYear,
            affiliation: userDataToSend.affiliation
        };


        try {
            // API 호출
            await UserApi.register(userDto);

            // 성공 메시지 표시
            showSuccessMessage('입력하신 메일로 이메일 인증이 발송되었습니다. 메일을 확인해주세요.');

            // 3초 후 로그인 페이지로 리다이렉트
            setTimeout(() => {
                window.location.href = '/user/login';
            }, 3000);
        } catch (error) {
            console.error('회원가입 처리 중 오류:', error);
            if (error.isApiError) {
                showErrorMessage(error.message);
            } else {
                showErrorMessage('회원가입 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
            }
        }
    });

    // 초기 상태 설정
    roleSelect.dispatchEvent(new Event('change'));
});
