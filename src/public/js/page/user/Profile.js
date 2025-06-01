/**
 * 프로필 페이지
 * 프로필 관련 기능을 처리합니다.
 */
import UserApi from '../../api/UserApi.js';
import { showLoading, showErrorMessage, showSuccessMessage, showConfirm } from '../../common/util/notification.js';

// 계정 삭제 처리 상태 관리
let isDeletingAccount = false;
let originalBeforeUnload = null;

// 사용자 정보를 저장할 전역 변수
let userData = null;

/**
 * 계정 삭제 처리 중 페이지 이탈 방지
 */
function preventAccountDeletionPageUnload() {
    isDeletingAccount = true;
    originalBeforeUnload = window.onbeforeunload;
    window.onbeforeunload = function (e) {
        if (!isDeletingAccount) return undefined;
        const message = '계정 삭제 처리 중입니다. 페이지를 떠나시겠습니까?';
        e.returnValue = message;
        return message;
    };

    // 키보드 이벤트 차단
    document.addEventListener('keydown', handleAccountDeletionKeyboardEvents, true);

    // 페이지 전체 비활성화
    const body = document.body;
    if (body) {
        body.classList.add('account-deletion-processing');
    }
}

/**
 * 계정 삭제 처리 완료 후 페이지 이탈 방지 해제
 */
function allowAccountDeletionPageUnload() {
    isDeletingAccount = false;
    window.onbeforeunload = originalBeforeUnload;
    document.removeEventListener('keydown', handleAccountDeletionKeyboardEvents, true);

    // 페이지 활성화
    const body = document.body;
    if (body) {
        body.classList.remove('account-deletion-processing');
    }
}

/**
 * 계정 삭제 처리 중 키보드 이벤트 차단
 */
function handleAccountDeletionKeyboardEvents(e) {
    if (!isDeletingAccount) return;

    // F5, Ctrl+R (새로고침) 차단
    if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
        e.preventDefault();
        e.stopPropagation();
        showErrorMessage('계정 삭제 처리 중에는 새로고침할 수 없습니다.');
        return false;
    }

    // Ctrl+W (탭 닫기) 차단
    if (e.ctrlKey && e.key === 'w') {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }

    // Backspace (뒤로가기) 차단 (입력 필드가 아닌 경우)
    if (e.key === 'Backspace' &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) &&
        !e.target.isContentEditable) {
        e.preventDefault();
        e.stopPropagation();
        showErrorMessage('계정 삭제 처리 중에는 뒤로갈 수 없습니다.');
        return false;
    }
}

/**
 * 계정 삭제 확인 프로세스
 */
async function performAccountDeletionWithConfirmation() {
    // 1단계: 최종 확인
    const confirmed = await showConfirm(
        '⚠️ 계정 삭제 경고\n\n' +
        '계정을 삭제하면 다음 데이터가 삭제됩니다.\n\n' +
        '• 프로필 정보\n' +
        '• 등록한 모든 작품\n' +
        '• 출품 기록\n' +
        '• 기타 모든 활동 내역\n\n' +
        '이 작업은 되돌릴 수 없습니다.\n' +
        '정말로 계정을 삭제하시겠습니까?'
    );

    return confirmed;
}

document.addEventListener('DOMContentLoaded', () => {
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
                await UserApi.logout();
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
                await UserApi.updateProfile(formData);

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

    // 계정 삭제 처리 - 강화된 보안 로직 적용
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', async () => {
            // 중복 클릭 방지
            if (isDeletingAccount) {
                showErrorMessage('이미 계정 삭제 처리 중입니다. 잠시만 기다려주세요.');
                return;
            }

            // 사용자 데이터가 로드되지 않은 경우
            if (!userData) {
                showErrorMessage('사용자 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
                return;
            }

            // 다단계 확인 프로세스 실행
            const confirmed = await performAccountDeletionWithConfirmation();
            if (!confirmed) {
                return;
            }

            // 페이지 이탈 방지 활성화
            preventAccountDeletionPageUnload();

            // 버튼 상태 변경
            const originalText = deleteAccountBtn.textContent;
            deleteAccountBtn.disabled = true;
            deleteAccountBtn.textContent = '계정 삭제 중...';
            deleteAccountBtn.classList.add('btn-loading');

            try {
                showLoading(true);
                await UserApi.deleteAccount();

                showLoading(false);

                // 성공 후 페이지 이탈 방지 완전 해제
                allowAccountDeletionPageUnload();

                // 성공 오버레이 표시
                const overlay = document.getElementById('account-deletion-overlay');
                if (overlay) {
                    overlay.classList.remove('hidden');
                }

                // 3초 후 로그인 페이지로 리다이렉트 (beforeunload 없이)
                setTimeout(() => {
                    // 리다이렉트 직전에 모든 이벤트 리스너 완전 제거
                    window.onbeforeunload = null;
                    window.location.href = '/user/login';
                }, 3000);
            } catch (error) {
                showErrorMessage(error.message || '계정 삭제에 실패했습니다.');

                // 에러 발생 시 페이지 이탈 방지 해제
                allowAccountDeletionPageUnload();

                // 버튼 상태 복원
                deleteAccountBtn.disabled = false;
                deleteAccountBtn.textContent = originalText;
                deleteAccountBtn.classList.remove('btn-loading');
            }
        });
    }

    // 사용자 프로필 정보 가져오기
    async function fetchUserProfile() {
        try {
            const response = await UserApi.getProfile();
            userData = response.data; // 전역 변수에 사용자 데이터 저장

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
