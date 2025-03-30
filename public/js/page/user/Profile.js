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
    // 요소 선택
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const saveProfileBtn = document.getElementById('save-profile-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const deleteAccountBtn = document.getElementById('delete-account-btn');
    const profileContent = document.querySelector('.profile-content');

    // 비밀번호 필드 요소들
    const passwordFields = document.getElementById('password-fields');
    const newPasswordFields = document.getElementById('new-password-fields');
    const confirmPasswordFields = document.getElementById('confirm-password-fields');

    // 초기 버튼 상태 설정
    saveProfileBtn.style.display = 'none';
    cancelEditBtn.style.display = 'none';
    editProfileBtn.style.display = 'inline-flex';
    logoutBtn.style.display = 'inline-flex';
    deleteAccountBtn.style.display = 'inline-flex';

    // 수정 모드로 전환
    editProfileBtn.addEventListener('click', () => {
        // 모든 텍스트를 입력 필드로 변경
        document.querySelectorAll('.profile-info__text').forEach(text => {
            text.style.display = 'none';
        });
        document.querySelectorAll('.profile-info__input, .profile-info__checkbox').forEach(input => {
            input.style.display = 'block';
        });

        // 비밀번호 필드 표시
        passwordFields.style.display = 'grid';
        newPasswordFields.style.display = 'grid';
        confirmPasswordFields.style.display = 'grid';

        // 버튼 상태 변경
        editProfileBtn.style.display = 'none';
        saveProfileBtn.style.display = 'inline-flex';
        cancelEditBtn.style.display = 'inline-flex';
        logoutBtn.style.display = 'none';
        deleteAccountBtn.style.display = 'none';

        // 수정 모드 클래스 추가
        profileContent.classList.add('edit-mode');
    });

    // 수정 취소
    cancelEditBtn.addEventListener('click', () => {
        // 모든 입력 필드를 텍스트로 변경
        document.querySelectorAll('.profile-info__text').forEach(text => {
            text.style.display = 'inline-block';
        });
        document.querySelectorAll('.profile-info__input, .profile-info__checkbox').forEach(input => {
            input.style.display = 'none';
        });

        // 비밀번호 필드 숨김
        passwordFields.style.display = 'none';
        newPasswordFields.style.display = 'none';
        confirmPasswordFields.style.display = 'none';

        // 비밀번호 입력값 초기화
        document.getElementById('current-password-input').value = '';
        document.getElementById('new-password-input').value = '';
        document.getElementById('confirm-password-input').value = '';

        // 버튼 상태 변경
        editProfileBtn.style.display = 'inline-flex';
        saveProfileBtn.style.display = 'none';
        cancelEditBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-flex';
        deleteAccountBtn.style.display = 'inline-flex';

        // 수정 모드 클래스 제거
        profileContent.classList.remove('edit-mode');
    });

    // 로그아웃
    logoutBtn.addEventListener('click', () => {
        if (confirm('로그아웃 하시겠습니까?')) {
            window.location.href = '/user/logout';
        }
    });

    // 계정 삭제
    deleteAccountBtn.addEventListener('click', () => {
        if (confirm('정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            fetch('/user/profile', {
                method: 'DELETE'
            })
                .then(response => {
                    if (response.ok) {
                        window.location.href = '/';
                    } else {
                        return response.json();
                    }
                })
                .then(error => {
                    if (error) {
                        alert(error.message || '계정 삭제 중 오류가 발생했습니다.');
                    }
                })
                .catch(error => {
                    console.error('계정 삭제 중 오류:', error);
                    alert('계정 삭제 중 오류가 발생했습니다.');
                });
        }
    });

    // 프로필 저장
    saveProfileBtn.addEventListener('click', async () => {
        const formData = {
            name: document.getElementById('name-input').value,
            department: document.getElementById('department-input')?.value || '',
            studentYear: document.getElementById('studentYear-input')?.value || '',
            isClubMember: document.getElementById('isClubMember-input')?.checked || false,
            affiliation: document.getElementById('affiliation-input')?.value || ''
        };

        // 비밀번호 변경 시에만 비밀번호 관련 데이터 추가
        const currentPassword = document.getElementById('current-password-input').value;
        const newPassword = document.getElementById('new-password-input').value;
        const confirmPassword = document.getElementById('confirm-password-input').value;

        if (newPassword || confirmPassword || currentPassword) {
            if (!currentPassword) {
                alert('현재 비밀번호를 입력해주세요.');
                return;
            }
            if (!newPassword) {
                alert('새 비밀번호를 입력해주세요.');
                return;
            }
            if (newPassword !== confirmPassword) {
                alert('새 비밀번호가 일치하지 않습니다.');
                return;
            }

            Object.assign(formData, {
                currentPassword,
                newPassword
            });
        }

        try {
            const response = await fetch('/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                alert(result.message || '프로필이 성공적으로 수정되었습니다.');
                window.location.reload();
            } else {
                alert(result.message || '프로필 수정 중 오류가 발생했습니다.');
            }
        } catch (error) {
            console.error('프로필 수정 중 오류:', error);
            alert('프로필 수정 중 오류가 발생했습니다.');
        }
    });
});
