document.addEventListener('DOMContentLoaded', () => {
    initImageUpload();
    initForm();
    handleExhibitionParam();
});

/**
 * 이미지 업로드 기능 초기화
 */
function initImageUpload() {
    const imagePreviewContainer = document.getElementById('imagePreview');
    const imagePreview = document.getElementById('previewImage');
    const fileInput = document.getElementById('imageInput');

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
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // 드래그 앤 드롭 기능
    imagePreviewContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        imagePreviewContainer.style.borderColor = '#3b82f6';
    });

    imagePreviewContainer.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        imagePreviewContainer.style.borderColor = '#e5e7eb';
    });

    imagePreviewContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        imagePreviewContainer.style.borderColor = '#e5e7eb';

        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            fileInput.files = e.dataTransfer.files;
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
}

/**
 * 폼 제출 기능 초기화
 */
function initForm() {
    const form = document.getElementById('artworkForm');

    if (!form) {
        console.error('폼 요소를 찾을 수 없습니다.');
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            const formData = new FormData(form);

            const response = await fetch('/artwork/register', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('작품 등록에 실패했습니다.');
            }

            const result = await response.json();

            // 성공 시 작품 상세 페이지로 이동
            window.location.href = `/artwork/${result.id}`;
        } catch (error) {
            console.error('작품 등록 중 오류:', error);
            alert('작품 등록 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
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
