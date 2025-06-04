/**
 * 회원가입 페이지
 * 회원가입 관련 기능을 처리합니다.
 */
import UserApi from '/js/api/UserApi.js';
import { showErrorMessage, showLoading } from '/js/common/util/notification.js';

// 페이지 이탈 방지 관련 변수
let isProcessing = false;
let originalBeforeUnload = null;

/**
 * 페이지 이탈 방지 설정
 */
function preventPageUnload() {
    isProcessing = true;
    originalBeforeUnload = window.onbeforeunload;
    window.onbeforeunload = function (e) {
        if (!isProcessing) return undefined;
        const message = '회원가입 처리 중입니다. 페이지를 떠나시겠습니까?';
        e.returnValue = message;
        return message;
    };

    // 키보드 이벤트 차단
    document.addEventListener('keydown', handleKeyboardEvents, true);
}

/**
 * 페이지 이탈 방지 해제
 */
function allowPageUnload() {
    isProcessing = false;
    window.onbeforeunload = originalBeforeUnload;
    document.removeEventListener('keydown', handleKeyboardEvents, true);
}

/**
 * 키보드 이벤트 처리 (새로고침, 뒤로가기 등 차단)
 */
function handleKeyboardEvents(e) {
    if (!isProcessing) return;

    // F5, Ctrl+R (새로고침) 차단
    if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
        e.preventDefault();
        e.stopPropagation();
        showErrorMessage('회원가입 처리 중에는 새로고침할 수 없습니다.');
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
        !['INPUT', 'TEXTAREA'].includes(e.target.tagName) &&
        !e.target.isContentEditable) {
        e.preventDefault();
        e.stopPropagation();
        showErrorMessage('회원가입 처리 중에는 뒤로갈 수 없습니다.');
        return false;
    }
}

/**
 * 성공 후 모든 사용자 상호작용 차단
 */
function blockAllInteractions() {
    // 미리 정의된 오버레이 표시
    const overlay = document.getElementById('success-overlay');
    if (overlay) {
        overlay.classList.remove('hidden');

        // 모든 클릭 이벤트 차단
        overlay.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
    }

    // 모든 키보드 이벤트 차단 (기존 것보다 더 강력)
    const blockAllKeys = (e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
    };

    document.addEventListener('keydown', blockAllKeys, true);
    document.addEventListener('keyup', blockAllKeys, true);
    document.addEventListener('keypress', blockAllKeys, true);

    // 폼 요소들 비활성화
    const allInputs = document.querySelectorAll('input, button, select, textarea');
    allInputs.forEach(element => {
        element.disabled = true;
        element.style.pointerEvents = 'none';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');
    const roleSelect = document.getElementById('role');
    const skkuFields = document.getElementById('skkuFields');
    const externalFields = document.getElementById('externalFields');
    const passwordToggle = document.querySelectorAll('.toggle-password-user');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const submitButton = form.querySelector('button[type="submit"]');

    // 초기 버튼 상태 설정
    submitButton.disabled = true;
    submitButton.classList.add('btn-disabled');

    /**
     * 폼 유효성 검사 및 버튼 활성화 상태 업데이트
     */
    function validateFormAndUpdateButton() {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // 기본 필수 필드 검사
        const requiredFields = ['username', 'email', 'password', 'name', 'role'];
        const basicFieldsValid = requiredFields.every(field => data[field] && data[field].trim() !== '');

        // 비밀번호 확인 검사
        const passwordsMatch = passwordInput.value === confirmPasswordInput.value && passwordInput.value.length > 0;

        // 역할별 추가 필드 검사
        let roleSpecificFieldsValid = true;
        const selectedRole = roleSelect.value;

        if (selectedRole === 'SKKU_MEMBER') {
            // SKKU 멤버는 학과, 학번이 필수
            roleSpecificFieldsValid = data.department && data.department.trim() !== '' &&
                data.studentYear && data.studentYear.trim() !== '';
        } else if (selectedRole === 'EXTERNAL_MEMBER') {
            // 외부 멤버는 소속이 필수
            roleSpecificFieldsValid = data.affiliation && data.affiliation.trim() !== '';
        }

        // 전체 유효성 검사 결과
        const isFormValid = basicFieldsValid && passwordsMatch && roleSpecificFieldsValid;

        // 버튼 상태 업데이트
        if (isFormValid) {
            submitButton.disabled = false;
            submitButton.classList.remove('btn-disabled');
        } else {
            submitButton.disabled = true;
            submitButton.classList.add('btn-disabled');
        }

        // 비밀번호 불일치 시각적 피드백
        if (confirmPasswordInput.value.length > 0) {
            if (passwordsMatch) {
                confirmPasswordInput.classList.remove('is-invalid');
                confirmPasswordInput.classList.add('is-valid');
            } else {
                confirmPasswordInput.classList.remove('is-valid');
                confirmPasswordInput.classList.add('is-invalid');
            }
        } else {
            confirmPasswordInput.classList.remove('is-valid', 'is-invalid');
        }
    }

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
            input.classList.remove('is-invalid', 'is-valid');
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

        // 역할 변경 후 폼 유효성 재검사
        validateFormAndUpdateButton();
    }

    // 모든 입력 필드에 실시간 검증 이벤트 리스너 추가
    const allInputs = form.querySelectorAll('input, select');
    allInputs.forEach(input => {
        input.addEventListener('input', validateFormAndUpdateButton);
        input.addEventListener('change', validateFormAndUpdateButton);
        input.addEventListener('blur', validateFormAndUpdateButton);
    });

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

        // 제출 버튼 참조
        const originalButtonText = submitButton.textContent;

        // 중복 클릭 방지: 버튼이 이미 비활성화되어 있으면 무시
        if (submitButton.disabled) {
            return;
        }

        // 최종 검증 (이중 안전장치)
        const formData = new FormData(form);
        const userData = Object.fromEntries(formData.entries());

        // 비밀번호 확인 (이중 안전장치)
        if (passwordInput.value !== confirmPasswordInput.value) {
            showErrorMessage('비밀번호가 일치하지 않습니다.');
            return;
        }

        // 버튼 상태 변경
        submitButton.disabled = true;
        submitButton.textContent = '처리 중...';
        submitButton.classList.add('btn-loading');

        // 역할에 따른 데이터 정리
        const selectedRole = roleSelect.value;
        if (selectedRole === 'EXTERNAL_MEMBER') {
            // 외부 사용자는 SKKU 관련 필드 제거
            delete userData.department;
            delete userData.studentYear;
            delete userData.isClubMember;
        } else if (selectedRole === 'SKKU_MEMBER') {
            // SKKU 사용자는 외부 관련 필드 제거 (affiliation은 선택적이므로 유지)
            if (!userData.affiliation) {
                delete userData.affiliation;
            }
        }

        // 체크박스 값 변환 (SKKU 멤버인 경우에만)
        if (selectedRole === 'SKKU_MEMBER' || selectedRole === 'ADMIN') {
            userData.isClubMember = userData.isClubMember === 'on';
        }

        // 빈 문자열을 null로 변환
        Object.keys(userData).forEach(key => {
            if (userData[key] === '') {
                userData[key] = null;
            }
        });

        // DTO 생성 - 역할에 따라 필요한 필드만 포함
        const userDto = {
            username: userData.username,
            name: userData.name,
            email: userData.email,
            password: userData.password,
            confirmPassword: userData.confirmPassword,
            role: userData.role
        };

        // 역할별 추가 필드
        if (selectedRole === 'SKKU_MEMBER' || selectedRole === 'ADMIN') {
            if (userData.department) userDto.department = userData.department;
            if (userData.studentYear) userDto.studentYear = userData.studentYear;
            if (userData.isClubMember !== undefined) userDto.isClubMember = userData.isClubMember;
            if (userData.affiliation) userDto.affiliation = userData.affiliation;
        } else if (selectedRole === 'EXTERNAL_MEMBER') {
            if (userData.affiliation) userDto.affiliation = userData.affiliation;
        }

        showLoading(true);
        // 페이지 이탈 방지 활성화
        preventPageUnload();

        try {
            // API 호출
            await UserApi.register(userDto);

            showLoading(false);
            // 성공 후 완전한 페이지 차단
            blockAllInteractions();

            // 3초 후 로그인 페이지로 리다이렉트
            setTimeout(() => {
                // 페이지 이동 전에 이탈 방지 해제
                allowPageUnload();
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

            // 에러 발생 시 상태 복원
            allowPageUnload();
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
            submitButton.classList.remove('btn-loading');

            // 폼 유효성 재검사로 버튼 상태 복원
            validateFormAndUpdateButton();
        }
    });

    // 초기 상태 설정
    handleRoleChange(roleSelect.value || '');

    // 초기 폼 유효성 검사
    validateFormAndUpdateButton();
});
