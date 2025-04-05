/**
 * 비밀번호 찾기 페이지 JavaScript
 */
import { showError, showSuccess } from '../../common/util/notification.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.form-user');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value;

            try {
                const response = await fetch('/user/forgot-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email }),
                });

                const data = await response.json();

                if (response.ok) {
                    showSuccess('비밀번호 재설정 링크가 이메일로 전송되었습니다.');
                    setTimeout(() => {
                        window.location.href = '/user/login';
                    }, 3000);
                } else {
                    showError(data.message || '비밀번호 재설정 링크 전송에 실패했습니다.');
                }
            } catch (error) {
                showError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
            }
        });
    }
});
