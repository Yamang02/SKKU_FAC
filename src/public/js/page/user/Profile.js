/**
 * 프로필 페이지
 * 프로필 관련 기능을 처리합니다.
 */
import UserAPI from '/js/api/UserAPI.js';
import { showLoading, showErrorMessage, showSuccessMessage, showConfirm } from '/js/common/util/notification.js';

document.addEventListener('DOMContentLoaded', () => {
    // 사용자 정보를 저장할 전역 변수
    let userData = null;

    // 사용자 프로필 정보 가져오기
    fetchUserProfile();

    // 버튼 요소들
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const deleteAccountBtn = document.getElementById('delete-account-btn');

    // 모달 요소들
    const editProfileModal = document.getElementById('editProfileModal');
    const modalCloseButtons = document.querySelectorAll('.modal-close');
    const saveProfileBtn = document.getElementById('save-profile-btn');

    // 모달 닫기 함수
    const closeModal = (modal) => {
        modal.style.display = 'none';
    };

    // 모달 열기 함수
    const openModal = (modal) => {
        modal.style.display = 'flex';
    };

    // 닫기 버튼에 이벤트 리스너 추가
    modalCloseButtons.forEach(button => {
        button.addEventListener('click', () => {
            closeModal(editProfileModal);
        });
    });

    // ESC 키를 눌렀을 때 모달 닫기
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal(editProfileModal);
        }
    });

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

    // 프로필 수정 모달 열기
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => {
            try {
                // userData가 없으면 오류 메시지 표시
                if (!userData) {
                    showErrorMessage('사용자 정보를 불러오는데 실패했습니다.');
                    return;
                }

                // 모달 내 폼 필드에 현재 사용자 정보 채우기
                document.querySelector('#edit-profile-form [name="name"]').value = userData.name || '';

                // 사용자 유형에 따라 필드 표시 여부 결정 및 값 채우기
                if (userData.role === 'SKKU_MEMBER') {
                    document.getElementById('department-group').style.display = 'block';
                    document.getElementById('studentYear-group').style.display = 'block';
                    document.getElementById('affiliation-group').style.display = 'none';

                    document.querySelector('#edit-profile-form [name="department"]').value = userData.department || '';
                    document.querySelector('#edit-profile-form [name="studentYear"]').value = userData.studentYear || '';
                } else if (userData.role === 'EXTERNAL_MEMBER') {
                    document.getElementById('department-group').style.display = 'none';
                    document.getElementById('studentYear-group').style.display = 'none';
                    document.getElementById('affiliation-group').style.display = 'block';

                    document.querySelector('#edit-profile-form [name="affiliation"]').value = userData.affiliation || '';
                }

                // 비밀번호 필드 초기화
                document.querySelector('#edit-profile-form [name="newPassword"]').value = '';
                document.querySelector('#edit-profile-form [name="confirmPassword"]').value = '';

                // 모달 열기
                openModal(editProfileModal);
            } catch (error) {
                showErrorMessage(error.message || '사용자 정보를 불러오는데 실패했습니다.');
            }
        });
    }

    // 프로필 수정 저장 처리
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', async () => {
            try {
                showLoading(true);

                // 폼 데이터 수집
                const formData = {
                    name: document.querySelector('#edit-profile-form [name="name"]').value,
                    department: document.querySelector('#edit-profile-form [name="department"]').value,
                    studentYear: document.querySelector('#edit-profile-form [name="studentYear"]').value,
                    affiliation: document.querySelector('#edit-profile-form [name="affiliation"]').value,
                    newPassword: document.querySelector('#edit-profile-form [name="newPassword"]').value,
                    confirmPassword: document.querySelector('#edit-profile-form [name="confirmPassword"]').value
                };

                // 비밀번호 일치 여부 확인
                if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
                    showErrorMessage('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
                    return;
                }

                // API 호출
                await UserAPI.updateProfile(formData);

                showSuccessMessage('프로필이 성공적으로 수정되었습니다.');
                closeModal(editProfileModal);

                // 프로필 정보 갱신
                fetchUserProfile();
            } catch (error) {
                showErrorMessage(error.message || '프로필 수정에 실패했습니다.');
            } finally {
                showLoading(false);
            }
        });
    }

    // 계정 삭제 처리 - showConfirm 사용
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

    // 사용자 프로필 정보 가져오기
    async function fetchUserProfile() {
        try {
            const response = await UserAPI.getProfile();
            userData = response.data; // 전역 변수에 사용자 데이터 저장
            console.log('user:', userData);

            // 사용자 정보를 DOM에 삽입
            document.getElementById('username').innerText = userData.username;
            document.getElementById('email').innerText = userData.email;
            document.getElementById('name-text').innerText = userData.name;
            document.getElementById('department-text').innerText = userData.department || '학과 정보 없음';
            document.getElementById('studentYear-text').innerText = userData.studentYear ? userData.studentYear + '학번' : '미입력';
            document.getElementById('isClubMember-text').innerText = userData.isClubMember ? '동아리 회원' : '일반 회원';
            document.getElementById('role').innerText = userData.role === 'SKKU_MEMBER' ? '성균관대 재학/졸업생' : '외부 인원';

            // 가입일 처리
            const createdAt = userData.createdAt; // 가입일
            const formattedDate = createdAt.replace(' ', 'T'); // 'YYYY-MM-DD HH:mm:ss' -> 'YYYY-MM-DDTHH:mm:ss' 형식으로 변환
            const date = new Date(formattedDate); // Date 객체로 변환
            document.getElementById('createdAt').innerText = date.toLocaleDateString(); // 'YYYY-MM-DD' 형식으로 변환하여 표시

            // 역할에 따라 추가 정보 표시
            if (userData.role === 'SKKU_MEMBER') {
                document.getElementById('school-info').style.display = 'block';
                document.getElementById('external-info').style.display = 'none';
            } else if (userData.role === 'EXTERNAL_MEMBER') {
                document.getElementById('school-info').style.display = 'none';
                document.getElementById('external-info').style.display = 'block';
                document.getElementById('affiliation-text').innerText = userData.affiliation || '소속 정보 없음';
            }
        } catch (error) {
            showErrorMessage(error.message || '프로필 정보를 불러오는데 실패했습니다.');
        }
    }
});
