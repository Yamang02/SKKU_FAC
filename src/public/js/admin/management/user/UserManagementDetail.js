/**
 * @file UserManagementDetail.js
 * @description Handles user detail page functionality including user information updates,
 * password reset, and user deletion with appropriate confirmations and loading states.
 */

document.addEventListener('DOMContentLoaded', function () {
    // 사용자 정보 수정 폼에 로딩 적용
    const userForm = document.querySelector('form[action*="?_method=PUT"]');
    if (userForm) {
        userForm.addEventListener('submit', function () {
            showLoading('회원 정보를 저장하는 중입니다...', '잠시만 기다려주세요');
        });
    }

    // 비밀번호 초기화 폼에 로딩 적용
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', function (e) {
            const confirmed = confirm('해당 사용자의 비밀번호를 초기화하시겠습니까?');
            if (confirmed) {
                showLoading('비밀번호를 초기화하는 중입니다...', '잠시만 기다려주세요');
            } else {
                e.preventDefault();
            }
        });
    }

    // 회원 삭제 폼에 확인 대화상자만 적용 (로딩 표시 제거)
    const deleteUserForm = document.getElementById('deleteUserForm');
    if (deleteUserForm) {
        deleteUserForm.addEventListener('submit', function (e) {
            const confirmed = confirm('정말로 이 회원을 삭제하시겠습니까?\n\n' +
                '⚠️ 경고: 이 작업은 되돌릴 수 없습니다.\n' +
                '• 해당 회원의 모든 정보가 영구적으로 삭제됩니다.\n' +
                '• 회원과 관련된 모든 데이터가 함께 삭제됩니다.\n' +
                '• 이 작업은 되돌릴 수 없으므로 신중하게 결정해주세요.');

            if (!confirmed) {
                e.preventDefault();
            }
            // 로딩 표시 없이 바로 제출하여 beforeunload 방지
        });
    }

    // 목록으로 버튼에 로딩 적용
    const backButton = document.querySelector('a[href="/admin/management/user"]');
    if (backButton) {
        backButton.addEventListener('click', function (e) {
            e.preventDefault();
            navigateWithLoading(this.href, '목록으로 이동하는 중입니다...');
        });
    }
});
