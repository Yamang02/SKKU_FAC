/**
 * 프로필 페이지
 * 프로필 관련 기능을 처리합니다.
 */
import UserAPI from '/js/api/UserAPI.js';
import { showLoading, showErrorMessage, showSuccessMessage, showConfirm } from '/js/common/util/notification.js';

document.addEventListener('DOMContentLoaded', () => {
    // 버튼 요소들
    fetchUserProfile();
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const saveProfileBtn = document.getElementById('save-profile-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const deleteAccountBtn = document.getElementById('delete-account-btn');

    // 로그아웃 처리
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                showLoading(true);
                await UserAPI.logout();
                window.location.href = '/';
            } catch (error) {
                showErrorMessage(error.message || '로그아웃에 실패했습니다.');
            } finally {
                showLoading(false);
            }
        });
    }

    // 계정 삭제 처리
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', async () => {
            const confirmed = await showConfirm('정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.');
            if (!confirmed) {
                return;
            }

            try {
                showLoading(true);
                await UserAPI.deleteAccount();
                showSuccessMessage('계정이 성공적으로 삭제되었습니다. 로그인 페이지로 이동합니다.');
                setTimeout(() => window.location.href = '/user/login', 3000);
            } catch (error) {
                showErrorMessage(error.message || '계정 삭제에 실패했습니다.');
            } finally {
                showLoading(false);
            }
        });
    }

    // 프로필 수정 처리
    if (editProfileBtn && saveProfileBtn && cancelEditBtn) {
        editProfileBtn.addEventListener('click', () => {
            editProfileBtn.style.display = 'none';
            saveProfileBtn.style.display = 'inline-flex';
            cancelEditBtn.style.display = 'inline-flex';
            // 입력 필드 활성화 로직 추가
        });

        cancelEditBtn.addEventListener('click', () => {
            editProfileBtn.style.display = 'inline-flex';
            saveProfileBtn.style.display = 'none';
            cancelEditBtn.style.display = 'none';
            // 입력 필드 비활성화 및 초기값 복원 로직 추가
        });

        saveProfileBtn.addEventListener('click', async () => {
            try {
                showLoading(true);
                // 프로필 데이터 수집 및 저장 로직 추가
                showSuccessMessage('프로필이 성공적으로 수정되었습니다.');
            } catch (error) {
                showErrorMessage(error.message || '프로필 수정에 실패했습니다.');
            } finally {
                showLoading(false);
            }
        });
    }


    async function fetchUserProfile() {
        const response = await UserAPI.getProfile();
        const user = response.data;
        console.log('user:', user);

        // 사용자 정보를 DOM에 삽입
        document.getElementById('username').innerText = user.username;
        document.getElementById('email').innerText = user.email;
        document.getElementById('name-text').innerText = user.name;
        document.getElementById('department-text').innerText = user.department || '학과 정보 없음';
        document.getElementById('studentYear-text').innerText = user.studentYear ? user.studentYear + '학번' : '미입력';
        document.getElementById('isClubMember-text').innerText = user.isClubMember ? '동아리 회원' : '일반 회원';
        document.getElementById('role').innerText = user.role === 'SKKU_MEMBER' ? '성균관대 재학/졸업생' : '외부 인원';
        document.getElementById('createdAt').innerText = new Date(user.createdAt).toLocaleDateString();

        // 역할에 따라 추가 정보 표시
        if (user.role === 'SKKU_MEMBER') {
            document.getElementById('school-info').style.display = 'block';
        } else if (user.role === 'EXTERNAL_MEMBER') {
            document.getElementById('external-info').style.display = 'block';
        }
    }
});
