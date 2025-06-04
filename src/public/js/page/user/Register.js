/**
 * 회원가입 페이지
 * 회원가입 관련 기능을 처리합니다.
 */
import UserApi from '/js/api/UserApi.js';
import { showErrorMessage, showSuccessMessage, showLoading } from '/js/common/util/notification.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');
    const roleSelect = document.getElementById('role');
    const skkuFields = document.getElementById('skkuFields');
    const externalFields = document.getElementById('externalFields');
    const passwordToggle = document.querySelectorAll('.toggle-password-user');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    /**
     * 폼 필드 초기화 함수
     * @param {HTMLElement} container - 초기화할 필드들이 포함된 컨테이너
     */
    function clearFormFields(container) {
        const inputs = container.querySelectorAll('input');
        inputs.forEach(input => {
            if (input.type === 'checkbox') {
                input.checked = false;
            } else {
                input.value = '';
            }
            // 에러 상태 제거
            input.classList.remove('is-invalid');
        });
    }

    /**
     * 역할별 필드 표시/숨김 처리 함수
     * @param {string} selectedRole - 선택된 역할
     */
    function handleRoleChange(selectedRole) {
        const isSkkuMember = selectedRole === 'SKKU_MEMBER';
        const isExternalMember = selectedRole === 'EXTERNAL_MEMBER';

        // 필드 표시/숨김 - WebKit 호환성을 위해 더 명확한 방법 사용
        if (isSkkuMember) {
            skkuFields.style.display = 'block';
            skkuFields.style.visibility = 'visible';
            externalFields.style.display = 'none';
            externalFields.style.visibility = 'hidden';
        } else if (isExternalMember) {
            externalFields.style.display = 'block';
            externalFields.style.visibility = 'visible';
            skkuFields.style.display = 'none';
            skkuFields.style.visibility = 'hidden';
        } else {
            // 기본 상태 (역할 미선택)
            skkuFields.style.display = 'none';
            skkuFields.style.visibility = 'hidden';
            externalFields.style.display = 'none';
            externalFields.style.visibility = 'hidden';
        }

        // 역할 변경 시 관련 필드 데이터 초기화
        if (!isSkkuMember) {
            clearFormFields(skkuFields);
        }
        if (!isExternalMember) {
            clearFormFields(externalFields);
        }

        // 필수 필드 설정
        skkuFields.querySelectorAll('input').forEach(input => {
            input.required = isSkkuMember;
        });
        externalFields.querySelectorAll('input').forEach(input => {
            input.required = isExternalMember;
        });

        // 기존 에러 메시지 제거
        const errorAlerts = document.querySelectorAll('.alert-danger-user');
        errorAlerts.forEach(alert => {
            alert.style.display = 'none';
            alert.textContent = '';
        });

        // WebKit에서 레이아웃 강제 업데이트
        if (isSkkuMember) {
            skkuFields.offsetHeight; // 강제 리플로우
        } else if (isExternalMember) {
            externalFields.offsetHeight; // 강제 리플로우
        }
    }

    // 역할 선택에 따른 필드 표시/숨김 및 데이터 초기화
    roleSelect.addEventListener('change', e => {
        const selectedRole = e.target.value;
        handleRoleChange(selectedRole);
    });

    // WebKit 호환성을 위한 추가 이벤트 리스너
    roleSelect.addEventListener('input', e => {
        const selectedRole = e.target.value;
        handleRoleChange(selectedRole);
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
    form.addEventListener('submit', async e => {
        e.preventDefault();

        // 비밀번호 확인
        if (passwordInput.value !== confirmPasswordInput.value) {
            showErrorMessage('비밀번호가 일치하지 않습니다.');
            return;
        }

        // 폼 데이터 수집
        const formData = new FormData(form);
        const userData = Object.fromEntries(formData.entries());

        // confirmPassword는 서버 검증을 위해 유지
        // const { confirmPassword, ...userDataToSend } = userData;
        const userDataToSend = userData;

        // 불필요한 필드 제거
        // const { confirmPassword, ...userDataToSend } = userData;

        // 역할에 따른 데이터 정리
        const selectedRole = roleSelect.value;
        if (selectedRole === 'EXTERNAL_MEMBER') {
            // 외부 사용자는 SKKU 관련 필드 제거
            delete userDataToSend.department;
            delete userDataToSend.studentYear;
            delete userDataToSend.isClubMember;
        } else if (selectedRole === 'SKKU_MEMBER') {
            // SKKU 사용자는 외부 관련 필드 제거 (affiliation은 선택적이므로 유지)
            if (!userDataToSend.affiliation) {
                delete userDataToSend.affiliation;
            }
        }

        // 체크박스 값 변환 (SKKU 멤버인 경우에만)
        if (selectedRole === 'SKKU_MEMBER' || selectedRole === 'ADMIN') {
            userDataToSend.isClubMember = userDataToSend.isClubMember === 'on';
        }

        // 빈 문자열을 null로 변환
        Object.keys(userDataToSend).forEach(key => {
            if (userDataToSend[key] === '') {
                userDataToSend[key] = null;
            }
        });

        // DTO 생성 - 역할에 따라 필요한 필드만 포함
        const userDto = {
            username: userDataToSend.username,
            name: userDataToSend.name,
            email: userDataToSend.email,
            password: userDataToSend.password,
            confirmPassword: userDataToSend.confirmPassword,
            role: userDataToSend.role
        };

        // 역할별 추가 필드
        if (selectedRole === 'SKKU_MEMBER' || selectedRole === 'ADMIN') {
            if (userDataToSend.department) userDto.department = userDataToSend.department;
            if (userDataToSend.studentYear) userDto.studentYear = userDataToSend.studentYear;
            if (userDataToSend.isClubMember !== undefined) userDto.isClubMember = userDataToSend.isClubMember;
            if (userDataToSend.affiliation) userDto.affiliation = userDataToSend.affiliation;
        } else if (selectedRole === 'EXTERNAL_MEMBER') {
            if (userDataToSend.affiliation) userDto.affiliation = userDataToSend.affiliation;
        }

        showLoading(true);
        try {
            // API 호출
            await UserApi.register(userDto);

            showLoading(false);
            // 성공 메시지 표시
            showSuccessMessage('입력하신 메일로 이메일 인증이 발송되었습니다. 메일을 확인해주세요.');

            // 3초 후 로그인 페이지로 리다이렉트
            setTimeout(() => {
                window.location.href = '/user/login';
            }, 3000);
        } catch (error) {
            showLoading(false);
            console.error('회원가입 처리 중 오류:', error);
            if (error.isApiError) {
                showErrorMessage(error.message);
            } else {
                showErrorMessage('회원가입 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
            }
        } finally {
            showLoading(false);
        }
    });

    // 초기 상태 설정
    handleRoleChange(roleSelect.value || '');
});
