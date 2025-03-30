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

document.addEventListener('DOMContentLoaded', function () {
    // 모달 관련 요소
    const editProfileModal = document.getElementById('editProfileModal');
    const deleteAccountModal = document.getElementById('deleteAccountModal');
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const saveProfileBtn = document.getElementById('save-profile-btn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteAccount');
    const logoutBtn = document.getElementById('logout-btn');

    // 모달 열기 함수
    function openModal(modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    // 모달 닫기 함수
    function closeModal(modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }

    // 모달 외부 클릭시 닫기
    window.addEventListener('click', function (event) {
        if (event.target === editProfileModal) {
            closeModal(editProfileModal);
        }
        if (event.target === deleteAccountModal) {
            closeModal(deleteAccountModal);
        }
    });

    // ESC 키로 모달 닫기
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            closeModal(editProfileModal);
            closeModal(deleteAccountModal);
        }
    });

    // 모달 닫기 버튼 이벤트
    document.querySelectorAll('.modal-close').forEach(button => {
        button.addEventListener('click', function () {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });

    // 프로필 수정 버튼 클릭 이벤트
    editProfileBtn.addEventListener('click', function () {
        openModal(editProfileModal);
    });

    // 프로필 저장 버튼 클릭 이벤트
    saveProfileBtn.addEventListener('click', async function () {
        const form = document.getElementById('edit-profile-form');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // 비밀번호 확인
        if (data.newPassword && data.newPassword !== data.confirmPassword) {
            alert('새 비밀번호가 일치하지 않습니다.');
            return;
        }

        try {
            const response = await fetch('/user/profile/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                alert('프로필이 성공적으로 업데이트되었습니다.');
                window.location.reload();
            } else {
                alert(result.message || '프로필 업데이트에 실패했습니다.');
            }
        } catch (error) {
            console.error('프로필 업데이트 중 오류 발생:', error);
            alert('프로필 업데이트 중 오류가 발생했습니다.');
        }
    });

    // 로그아웃 버튼 클릭 이벤트
    logoutBtn.addEventListener('click', function () {
        window.location.href = '/user/logout';
    });

    // 계정 삭제 확인 버튼 클릭 이벤트
    confirmDeleteBtn.addEventListener('click', async function () {
        try {
            const response = await fetch('/user/profile/delete', {
                method: 'POST'
            });

            const result = await response.json();

            if (result.success) {
                alert('계정이 성공적으로 삭제되었습니다.');
                window.location.href = '/';
            } else {
                alert(result.message || '계정 삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('계정 삭제 중 오류 발생:', error);
            alert('계정 삭제 중 오류가 발생했습니다.');
        }
    });
});
