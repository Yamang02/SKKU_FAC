import UserApi from '../../api/UserApi.js';
import ArtworkApi from '../../api/ArtworkApi.js';
import ExhibitionApi from '../../api/ExhibitionApi.js';
import { showErrorMessage, showSuccessMessage, showLoading } from '../../common/util/notification.js';


// 페이지 초기화 함수
async function initializePage() {
    try {
        // 사용자 정보 로드
        const response = await UserApi.getProfile();

        // API 응답이 성공이 아닌 경우 처리
        if (!response.success) {
            throw new Error(response.error || '사용자 정보를 불러올 수 없습니다.');
        }

        const user = response.data;

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
            affiliation = user.department && user.studentYear ?
                `${user.department} ${user.studentYear}` :
                (user.department || '');
        } else {
            affiliation = user.affiliation || '';
        }

        if (artistAffiliationSpan) {
            artistAffiliationSpan.textContent = affiliation;
        }

        if (departmentInput) {
            departmentInput.value = affiliation;
        }

        // 2. 출품 가능한 전시회 목록 가져오기
        try {
            const response = await ExhibitionApi.getSubmittableList();
            const exhibitions = response.data || response;
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
                throw new Error('전시회 목록을 불러오는데 실패했습니다.');
            }
        } catch (error) {
            const exhibitionSelect = document.getElementById('exhibition');
            if (exhibitionSelect) {
                exhibitionSelect.innerHTML = '<option value="">전시회 목록을 불러올 수 없습니다</option>';
                exhibitionSelect.disabled = true;
            }
            // 에러 메시지를 화면에 표시
            showErrorMessage('전시회 목록을 불러오는데 실패했습니다. 나중에 다시 시도해주세요.');
        }

        // 3. 기존 초기화 함수들 호출
        initImageUpload();
        initSubmitButton();
        initCharCounter();
        handleExhibitionParam();
    } catch (error) {
        // 오류가 401(Unauthorized) 관련인지 확인
        if (error.message && (
            error.status === 401
        )) {
            showErrorMessage('로그인이 필요한 서비스입니다. 로그인 페이지로 이동합니다.');
            // 3초 후 로그인 페이지로 리디렉션
            setTimeout(() => {
                window.location.href = '/auth/login?returnTo=' + encodeURIComponent(window.location.pathname);
            }, 3000);
        } else {
            showErrorMessage('페이지 로딩 중 오류가 발생했습니다: ' + error.message);
        }
    }
}

// DOM이 로드된 후 초기화 실행
document.addEventListener('DOMContentLoaded', initializePage);

/**
 * 이미지 업로드 기능 초기화
 */
function initImageUpload() {
    const imagePreviewContainer = document.getElementById('imagePreview');
    const imagePreview = document.getElementById('previewImage');
    const fileInput = document.getElementById('imageInput');
    const imageOverlay = imagePreviewContainer.querySelector('.image-upload-overlay');

    if (!imagePreviewContainer || !imagePreview || !fileInput) {
        return;
    }

    // 파일 유효성 검사 함수
    function validateImageFile(file) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

        if (!file) {
            showErrorMessage('파일을 선택해주세요.');
            return false;
        }

        if (!allowedTypes.includes(file.type)) {
            showErrorMessage('지원하지 않는 파일 형식입니다. (JPG, PNG, GIF, WEBP 파일만 가능)');
            return false;
        }

        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            showErrorMessage('파일 크기는 10MB 이하여야 합니다.');
            return false;
        }

        return true;
    }

    // 이미지 미리보기 업데이트 함수
    function updateImagePreview(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
            imageOverlay.style.opacity = '0';
            imageOverlay.style.pointerEvents = 'none';
        };
        reader.readAsDataURL(file);
    }

    // 이미지 호버 효과 설정
    function setupHoverEffect() {
        imagePreviewContainer.addEventListener('mouseenter', () => {
            imageOverlay.style.opacity = '1';
        });
        imagePreviewContainer.addEventListener('mouseleave', () => {
            imageOverlay.style.opacity = '0';
        });
    }

    // 공통 파일 처리 함수
    function handleImageFile(file) {
        if (validateImageFile(file)) {
            updateImagePreview(file);
            setupHoverEffect();
            return true;
        }
        return false;
    }

    // 이미지 미리보기 컨테이너 클릭 시 파일 입력 트리거
    imagePreviewContainer.addEventListener('click', () => {
        fileInput.click();
    });

    // 파일 선택 시 처리
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!handleImageFile(file)) {
            fileInput.value = '';
        }
    });

    // 드래그 앤 드롭 처리
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
        if (file) {
            if (!handleImageFile(file)) {
                fileInput.value = '';
            } else {
                // 드래그 앤 드롭의 경우 DataTransfer 객체를 통해 파일 설정
                const dt = new DataTransfer();
                dt.items.add(file);
                fileInput.files = dt.files;
            }
        }
    });
}

/**
 * 제출 버튼 기능 초기화
 */
function initSubmitButton() {
    // ID로 버튼 선택 (더 정확함)
    const submitButton = document.getElementById('submit-button') || document.querySelector('.btn.btn-primary');

    if (!submitButton) {
        console.error('제출 버튼을 찾을 수 없습니다');
        return;
    }

    submitButton.addEventListener('click', async (event) => {
        event.preventDefault();


        // 입력값 가져오기
        const title = document.getElementById('title').value.trim();
        const image = document.getElementById('imageInput').files[0];
        const department = document.getElementById('department-input').value.trim();
        const exhibitionId = document.getElementById('exhibition').value || 0;
        const year = document.getElementById('year').value.trim();
        const medium = document.getElementById('medium').value.trim();
        const size = document.getElementById('size').value.trim();
        const description = document.getElementById('description').value.trim();

        // 유효성 검사
        if (!title) {
            showErrorMessage('작품 제목을 입력해주세요.');
            return;
        }

        if (!image) {
            showErrorMessage('작품 이미지를 업로드해주세요.');
            return;
        }

        // 매체(medium) 길이 검사
        if (medium.length > 50) {
            showErrorMessage('매체는 50자 이내로 입력해주세요.');
            document.getElementById('mediumError').textContent = '50자 이내로 입력해주세요.';
            document.getElementById('mediumError').style.display = 'block';
            document.getElementById('medium').focus();
            return;
        } else {
            document.getElementById('mediumError').style.display = 'none';
        }

        // 크기(size) 길이 검사
        if (size.length > 50) {
            showErrorMessage('작품 크기는 50자 이내로 입력해주세요.');
            document.getElementById('sizeError').textContent = '50자 이내로 입력해주세요.';
            document.getElementById('sizeError').style.display = 'block';
            document.getElementById('size').focus();
            return;
        } else {
            document.getElementById('sizeError').style.display = 'none';
        }

        // 작품 설명 글자수 검사
        if (description.length > 500) {
            showErrorMessage('작품 설명은 500자 이내로 작성해주세요.');
            return;
        }

        // 버튼 상태 및 로딩 표시 업데이트 (시각적 피드백 추가)
        submitButton.disabled = true;
        submitButton.textContent = '처리 중...';
        submitButton.classList.add('processing');

        try {
            // FormData 생성
            const formData = new FormData();
            formData.append('title', title);
            formData.append('image', image);
            formData.append('department', department);
            formData.append('exhibitionId', exhibitionId);
            formData.append('year', year);
            formData.append('medium', medium);
            formData.append('size', size);
            formData.append('description', description);
            // API 호출
            const response = await ArtworkApi.createArtwork(formData);

            if (response.success) {
                showLoading(false);
                showSuccessMessage('작품 등록에 성공하였습니다.');
                setTimeout(() => {
                    window.location.href = '/success?message=작품 등록에 성공하였습니다.';
                }, 2000);
                return;
            } else {
                showLoading(false);
                throw new Error('작품 등록에 실패했습니다.');
            }
        } catch (error) {
            showErrorMessage('다음 이유로 작품 등록에 실패했습니다 : ' + error.message);
        } finally {
            showLoading(false);
            submitButton.disabled = false;
            submitButton.textContent = '등록하기';
            submitButton.classList.remove('processing');
        }

    });
}

/**
 * 글자수 카운터 초기화
 */
function initCharCounter() {
    const descriptionTextarea = document.getElementById('description');
    const charCountElement = document.getElementById('charCount');

    if (!descriptionTextarea || !charCountElement) return;

    // 초기 글자수 업데이트
    updateCharCount();

    // 입력 이벤트에 글자수 업데이트 함수 연결
    descriptionTextarea.addEventListener('input', updateCharCount);

    function updateCharCount() {
        const currentLength = descriptionTextarea.value.length;
        charCountElement.textContent = currentLength;

        // 글자수 제한에 가까워지면 시각적 피드백 제공
        if (currentLength > 450) {
            charCountElement.classList.add('char-count-warning');
        } else {
            charCountElement.classList.remove('char-count-warning');
        }
    }
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
