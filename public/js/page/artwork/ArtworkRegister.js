import UserAPI from '/js/api/userAPI.js';
import ExhibitionAPI from '/js/api/exhibitionAPI.js';

// 전역 변수로 user 선언
let user;

(async () => {
    try {
        // 1. 사용자 정보 가져오기
        user = await UserAPI.getProfile();
        console.log('사용자 정보:', user);

        // 작가 정보 필드 찾기
        const artistNameSpan = document.getElementById('artist-name');
        const artistAffiliationSpan = document.getElementById('artist-affiliation');
        const departmentInput = document.getElementById('department-input');

        // 작가 이름 설정
        if (artistNameSpan) {
            artistNameSpan.textContent = user.name;
        }

        // 소속 정보 설정
        let affiliation = '';
        if (user.role === 'ADMIN' || user.role === 'SKKU_MEMBER') {
            // 학교 구성원인 경우 학과와 학년 조합
            affiliation = user.department && user.studentYear ?
                `${user.department} ${user.studentYear}` :
                (user.department || '');
        } else {
            // 외부 구성원인 경우 소속 정보
            affiliation = user.affiliation || '';
        }

        if (artistAffiliationSpan) {
            artistAffiliationSpan.textContent = affiliation;
        }

        if (departmentInput) {
            departmentInput.value = affiliation;
        }

        // 2. 출품 가능한 전시회 목록 가져오기
        const response = await ExhibitionAPI.getSubmittableList();
        console.log('출품 가능한 전시회 목록 응답:', response);
        const exhibitions = response.data;
        const exhibitionSelect = document.getElementById('exhibition');

        if (exhibitionSelect && exhibitions && Array.isArray(exhibitions)) {
            // 기존 옵션 제거
            exhibitionSelect.innerHTML = '';

            // 기본 옵션 추가
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = '전시회를 선택해주세요';
            exhibitionSelect.appendChild(defaultOption);

            // 전시회 옵션 추가
            exhibitions.forEach(exhibition => {
                const option = document.createElement('option');
                option.value = exhibition.id;
                option.textContent = exhibition.title;
                exhibitionSelect.appendChild(option);
            });
        } else {
            console.error('전시회 목록이 배열이 아니거나 없습니다:', exhibitions);
        }

        // 3. 기존 초기화 함수들 호출
        initImageUpload();
        initSubmitButton();
        handleExhibitionParam();
    } catch (error) {
        console.error('Error:', error);
        alert('페이지 로딩 중 오류가 발생했습니다.');
    }
})();

/**
 * 이미지 업로드 기능 초기화
 */
function initImageUpload() {
    const imagePreviewContainer = document.getElementById('imagePreview');
    const imagePreview = document.getElementById('previewImage');
    const fileInput = document.getElementById('imageInput');
    const imageOverlay = imagePreviewContainer.querySelector('.image-upload-overlay');

    if (!imagePreviewContainer || !imagePreview || !fileInput) {
        console.error('이미지 업로드 요소를 찾을 수 없습니다.');
        return;
    }

    // 이미지 미리보기 컨테이너 클릭 시 파일 입력 트리거
    imagePreviewContainer.addEventListener('click', () => {
        fileInput.click();
    });

    // 파일 선택 시 미리보기 업데이트
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            updateImagePreview(file);
        }
    });

    // 드래그 앤 드롭 기능
    imagePreviewContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        imagePreviewContainer.classList.add('dragover');
    });

    imagePreviewContainer.addEventListener('dragleave', () => {
        imagePreviewContainer.classList.remove('dragover');
    });

    imagePreviewContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        imagePreviewContainer.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            fileInput.files = e.dataTransfer.files;
            updateImagePreview(file);
        }
    });

    // 이미지 미리보기 업데이트
    function updateImagePreview(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
            imageOverlay.style.opacity = '0';
            imageOverlay.style.pointerEvents = 'none';

            // 이미지 호버 시 오버레이 표시
            imagePreviewContainer.addEventListener('mouseenter', () => {
                imageOverlay.style.opacity = '1';
            });
            imagePreviewContainer.addEventListener('mouseleave', () => {
                imageOverlay.style.opacity = '0';
            });
        };
        reader.readAsDataURL(file);
    }
}

/**
 * 제출 버튼 기능 초기화
 */
function initSubmitButton() {
    const submitButton = document.querySelector('.btn.btn-primary');

    if (!submitButton) {
        console.error('등록 버튼을 찾을 수 없습니다.');
        return;
    }

    submitButton.addEventListener('click', async () => {
        // 에러 메시지 초기화
        clearErrors();

        // 입력값 가져오기
        const title = document.getElementById('title').value.trim();
        const image = document.getElementById('imageInput').files[0];
        const department = document.getElementById('department-input').value.trim();

        let isValid = true;
        let errorMessage = '';

        // 제목 검증
        if (!title) {
            errorMessage = '작품 제목을 입력해주세요.';
            isValid = false;
        }

        // 이미지 검증
        if (!image) {
            errorMessage = '작품 이미지를 업로드해주세요.';
            isValid = false;
        }

        if (!isValid) {
            showError('formError', errorMessage);
            return;
        }

        try {
            // 제출 버튼 비활성화
            submitButton.disabled = true;
            submitButton.textContent = '등록 중...';

            // FormData 생성
            const formData = new FormData();
            formData.append('title', title);
            formData.append('image', image);
            formData.append('description', document.getElementById('description').value.trim());
            formData.append('medium', document.getElementById('medium').value.trim());
            formData.append('size', document.getElementById('size').value.trim());
            formData.append('department', department);
            formData.append('year', new Date().getFullYear().toString());
            formData.append('artistId', user.id);  // user 객체에서 직접 id 가져오기

            const exhibitionSelect = document.getElementById('exhibition');
            if (exhibitionSelect && exhibitionSelect.value) {
                formData.append('exhibitionId', exhibitionSelect.value);
                console.log('전시회 ID 추가:', exhibitionSelect.value, typeof exhibitionSelect.value);
            }

            // 디버깅: FormData 내용 확인
            console.log('FormData 값:');
            for (let [key, value] of formData.entries()) {
                if (key !== 'image') {
                    console.log(`${key}: ${value}`);
                } else {
                    console.log(`${key}: [File 객체]`);
                }
            }

            console.log('서버 요청 시작');
            const response = await fetch('/artwork', {
                method: 'POST',
                body: formData,
                credentials: 'same-origin' // 세션 쿠키 포함
            });
            console.log('서버 응답 상태:', response.status);
            console.log('서버 응답 헤더:', Object.fromEntries(response.headers.entries()));

            let result;
            try {
                const responseText = await response.text();
                console.log('서버 응답 텍스트:', responseText);
                result = JSON.parse(responseText);
                console.log('서버 응답 데이터:', result);
            } catch (error) {
                console.error('JSON 파싱 에러:', error);
                throw new Error('서버 응답을 처리할 수 없습니다.');
            }

            if (!response.ok) {
                if (response.status === 401) {
                    // 세션 만료 또는 인증 오류
                    window.location.href = result.redirectUrl || '/user/login';
                    return;
                }
                // 서버에서 보낸 에러 메시지 사용
                throw new Error(result.message || '작품 등록에 실패했습니다.');
            }

            // 성공 시 작품 상세 페이지로 이동
            window.location.href = `/artwork/${result.artwork.id}`;
        } catch (error) {
            console.error('Error:', error);
            // 에러 메시지 표시
            showError('formError', error.message || '작품 등록 중 오류가 발생했습니다.');

            // 제출 버튼 활성화
            submitButton.disabled = false;
            submitButton.textContent = '등록하기';
        }
    });
}

// 에러 메시지 표시
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

// 에러 메시지 초기화
function clearErrors() {
    const errorElements = document.querySelectorAll('.form-error');
    errorElements.forEach(element => {
        element.textContent = '';
        element.style.display = 'none';
    });
}

// URL에서 전시회 ID를 가져와서 처리
function handleExhibitionParam() {
    const urlParams = new URLSearchParams(window.location.search);
    const exhibitionId = urlParams.get('exhibition');

    if (exhibitionId) {
        const exhibitionSelect = document.getElementById('exhibition');
        if (exhibitionSelect) {
            exhibitionSelect.value = exhibitionId;
            exhibitionSelect.disabled = true;
        }
    }
}
