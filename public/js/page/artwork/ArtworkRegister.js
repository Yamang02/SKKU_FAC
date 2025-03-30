document.addEventListener('DOMContentLoaded', () => {
    initImageUpload();
    initSubmitButton();
    handleExhibitionParam();
});

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

        // 필수 필드 검증
        const title = document.getElementById('title').value.trim();
        const image = document.getElementById('imageInput').files[0];

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

            const exhibitionSelect = document.getElementById('exhibition');
            if (exhibitionSelect && exhibitionSelect.value) {
                formData.append('exhibitionId', exhibitionSelect.value);
            }

            const response = await fetch('/artwork/registration', {
                method: 'POST',
                body: formData
            });

            let result;
            try {
                // Content-Type 확인
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    result = await response.json();
                } else {
                    // JSON이 아닌 경우 텍스트로 처리
                    const text = await response.text();
                    result = {
                        success: false,
                        message: text
                    };
                }
            } catch (error) {
                console.error('응답 처리 중 오류:', error);
                throw new Error('서버 응답을 처리할 수 없습니다.');
            }

            if (!response.ok || !result.success) {
                throw new Error(result.message || '작품 등록에 실패했습니다.');
            }

            // 성공 시 작품 상세 페이지로 이동
            alert('작품이 성공적으로 등록되었습니다.');
            window.location.href = `/artwork/${result.artwork.id}`;
        } catch (error) {
            console.error('작품 등록 중 오류:', error);
            showError('formError', error.message);

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
