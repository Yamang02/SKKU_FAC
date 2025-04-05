/**
 * 회원가입 페이지
 * 회원가입 관련 기능을 처리합니다.
 */
import UserAPI from '../../api/UserAPI';
import { showError, showSuccess } from '../../common/util/notification.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');
    const roleSelect = document.getElementById('role');
    const skkuFields = document.getElementById('skkuFields');
    const externalFields = document.getElementById('externalFields');
    const passwordToggle = document.getElementById('passwordToggle');
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
    passwordToggle.addEventListener('click', () => {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        confirmPasswordInput.type = type;
        passwordToggle.classList.toggle('show-password');
    });

    // 폼 제출 처리
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 폼 데이터 수집
        const formData = new FormData(form);
        const userData = Object.fromEntries(formData.entries());

        try {
            // API 호출
            await UserAPI.register(userData);

            // 성공 메시지 표시
            showSuccess('회원가입이 완료되었습니다. 3초 후 로그인 페이지로 이동합니다.');

            // 3초 후 로그인 페이지로 리다이렉트
            setTimeout(() => {
                window.location.href = '/user/login';
            }, 3000);
        } catch (error) {
            // 에러 메시지 표시
            showError(error.message || '회원가입에 실패했습니다.');
        }
    });

    // 초기 상태 설정
    roleSelect.dispatchEvent(new Event('change'));
});
