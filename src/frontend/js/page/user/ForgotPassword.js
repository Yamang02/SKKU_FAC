import { showErrorMessage, showSuccessMessage } from '../../common/util/notification.js';
import AuthApi from '../../api/AuthApi.js';
import UserApi from '../../api/UserApi.js';

document.addEventListener('DOMContentLoaded', () => {
    const accountRecoveryForm = document.querySelector('#account-recovery-form');
    const findUsernameBtn = document.querySelector('#find-username-btn');
    const usernameResult = document.querySelector('#username-result');
    const foundUsername = document.querySelector('#found-username');

    // 이메일 입력 필드 참조
    const emailInput = document.getElementById('email');

    // 비밀번호 재설정 링크 요청 처리
    if (accountRecoveryForm) {
        accountRecoveryForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = emailInput.value;
            const submitButton = accountRecoveryForm.querySelector('button[type="submit"]');

            // 버튼 비활성화 및 로딩 상태 표시
            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="spinner"></span> 처리 중...';
            submitButton.classList.add('btn-loading');

            try {
                await AuthApi.requestPasswordReset(email);

                showSuccessMessage('비밀번호 재설정 링크가 이메일로 전송되었습니다.');
                setTimeout(() => {
                    window.location.href = '/user/login';
                }, 3000);
            } catch (error) {
                console.error('비밀번호 재설정 링크 전송 오류:', error);
                // 에러 객체에서 메시지 추출
                const errorMessage = error.message || '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
                showErrorMessage(errorMessage);

                // 버튼 상태 복원
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
                submitButton.classList.remove('btn-loading');
            }
        });
    }

    // 아이디 찾기 버튼 처리
    if (findUsernameBtn) {
        findUsernameBtn.addEventListener('click', async () => {
            const email = emailInput.value;

            if (!email) {
                showErrorMessage('이메일을 입력해주세요.');
                return;
            }

            // 버튼 비활성화 및 로딩 상태 표시
            const originalButtonText = findUsernameBtn.textContent;
            findUsernameBtn.disabled = true;
            findUsernameBtn.innerHTML = '<span class="spinner"></span> 처리 중...';
            findUsernameBtn.classList.add('btn-loading');

            try {
                // 아이디 찾기 API 호출
                const response = await UserApi.findUsername(email);

                // 결과 표시
                if (response && response.username) {
                    // 아이디 표시 (마스킹 없이)
                    foundUsername.textContent = response.username;
                    usernameResult.style.display = 'block';
                } else {
                    showErrorMessage('이메일에 해당하는 계정을 찾을 수 없습니다.');
                }
            } catch (error) {
                console.error('아이디 찾기 오류:', error);
                // 에러 객체에서 메시지 추출
                const errorMessage = error || '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
                showErrorMessage(errorMessage);
            } finally {
                // 버튼 상태 복원
                findUsernameBtn.disabled = false;
                findUsernameBtn.textContent = originalButtonText;
                findUsernameBtn.classList.remove('btn-loading');
            }
        });
    }
});
