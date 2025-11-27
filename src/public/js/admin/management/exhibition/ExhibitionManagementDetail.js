/**
 * 전시회 관리 상세 페이지 스크립트
 */

// 전역 변수로 mode 선언
let mode;

// 페이지 초기화
document.addEventListener('DOMContentLoaded', function () {
    // data attribute에서 mode 읽어오기
    const adminManagement = document.querySelector('.admin-management');
    mode = adminManagement ? adminManagement.dataset.mode : 'create';
    // 폼 제출 이벤트 설정
    document.getElementById('exhibitionForm').addEventListener('submit', handleExhibitionFormSubmit);

    // 이미지 업로드 영역 클릭 이벤트 (수정 모드가 아닐 때만 활성화)
    if (mode === 'create') {
        document.getElementById('exhibition-thumbnail-preview').addEventListener('click', function () {
            document.getElementById('thumbnailInput').click();
        });
    }

    // 파일 업로드 이벤트
    document.getElementById('thumbnailInput').addEventListener('change', function () {
        updateThumbnailPreview(this.files[0]);
    });

    // 이미지 삭제 버튼 이벤트 (존재할 경우)
    const cancelThumbnail = document.getElementById('cancelThumbnail');
    if (cancelThumbnail) {
        cancelThumbnail.addEventListener('click', cancelThumbnailUpload);
    }

    // 뒤로가기 버튼 클릭 이벤트
    document.getElementById('backButton').addEventListener('click', function (e) {
        e.preventDefault();
        navigateWithLoading('/admin/management/exhibition', '목록으로 이동하는 중입니다...');
    });

    // 삭제 버튼 설정 (전시회 객체가 있을 경우에만)
    const deleteButton = document.getElementById('deleteButton');
    if (deleteButton) {
        deleteButton.addEventListener('click', function () {
            handleDelete(deleteButton.getAttribute('data-id'));
        });
    }

    // 시작일과 종료일을 당일로 자동 입력
    const today = new Date().toISOString().split('T')[0];
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');

    if (!startDateInput.value) {
        startDateInput.value = today;
    }
    if (!endDateInput.value) {
        endDateInput.value = today;
    }
});

/**
 * 썸네일 미리보기 업데이트
 * @param {File} file - 업로드할 이미지 파일
 */
function updateThumbnailPreview(file) {
    const previewContainer = document.getElementById('exhibition-thumbnail-preview');
    const reader = new FileReader();

    reader.onload = function (e) {
        if (previewContainer) {
            // 기존 내용 지우기
            previewContainer.innerHTML = '';

            const cancelDiv = document.querySelector('.thumbnail-cancel');
            if (cancelDiv) {
                cancelDiv.innerHTML = '';
            }

            // 헤더 추가 (삭제 링크 포함)
            const headerDiv = document.createElement('div');
            headerDiv.className = 'thumbnail-header';

            const cancelLink = document.createElement('a');
            cancelLink.href = '#';
            cancelLink.id = 'cancelThumbnail';
            cancelLink.className = 'cancel-thumbnail';
            cancelLink.textContent = '이미지 삭제';
            cancelLink.addEventListener('click', cancelThumbnailUpload);

            headerDiv.appendChild(cancelLink);

            // 이미지 추가
            const imageElement = document.createElement('img');
            imageElement.src = e.target.result;
            imageElement.alt = '전시회 썸네일';
            imageElement.className = 'thumbnail-image';

            // 요소 추가
            cancelDiv.appendChild(headerDiv);
            previewContainer.appendChild(imageElement);
        }
    };

    if (file) {
        reader.readAsDataURL(file);
    }
}

/**
 * 썸네일 업로드 취소
 * @param {Event} event - 클릭 이벤트
 */
function cancelThumbnailUpload(event) {
    event.preventDefault();

    const previewContainer = document.getElementById('exhibition-thumbnail-preview');
    const fileInput = document.getElementById('thumbnailInput');
    const cancelDiv = document.querySelector('.thumbnail-cancel');

    // 파일 입력 초기화
    fileInput.value = '';

    // 미리보기 초기화
    previewContainer.innerHTML = '';

    if (cancelDiv) {
        cancelDiv.innerHTML = '';
    }

    // 플레이스홀더 추가
    const placeholderDiv = document.createElement('div');
    placeholderDiv.className = 'placeholder';

    const placeholderText = document.createElement('p');
    placeholderText.textContent = '이미지를 클릭하여 업로드 (선택사항)';

    placeholderDiv.appendChild(placeholderText);
    previewContainer.appendChild(placeholderDiv);
}

/**
 * 전시회 폼 제출 핸들러
 * @param {Event} event - 폼 제출 이벤트
 */
async function handleExhibitionFormSubmit(event) {
    event.preventDefault();

    if (!confirm('저장하시겠습니까?')) {
        return;
    }

    try {
        showLoading('전시회를 저장하는 중입니다...', '잠시만 기다려주세요');

        const now = new Date().toISOString();
        let isEdit = (mode === 'edit'); // mode를 기반으로 isEdit 설정

        const method = isEdit ? 'PUT' : 'POST'; // isEdit에 따라 메소드 설정
        const url = isEdit ? `/admin/management/exhibition/${document.getElementById('id').value}` : '/admin/management/exhibition/new';

        let response;

        // 수정 모드일 때는 JSON으로 데이터 전송
        if (isEdit) {
            // 폼 데이터를 JSON 객체로 수집
            const formEl = document.getElementById('exhibitionForm');
            const formData = {};

            // 폼 요소들에서 데이터 수집
            formEl.querySelectorAll('input, select, textarea').forEach(element => {
                if (element.name && element.name !== 'image') { // 이미지 필드는 제외
                    formData[element.name] = element.value;
                }
            });

            // Boolean 값 처리
            formData.isSubmissionOpen = formData.isSubmissionOpen === 'true';
            formData.isFeatured = formData.isFeatured === 'true';

            // 업데이트 시간 추가
            formData.updatedAt = now;

            response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
        } else {
            // 생성 모드일 때는 기존 FormData 사용
            const formData = new FormData(document.getElementById('exhibitionForm'));

            // 생성 시간 추가
            formData.append('createdAt', now);
            formData.append('updatedAt', now);

            // Boolean 값 처리
            formData.set('isSubmissionOpen', formData.get('isSubmissionOpen') === 'true');
            formData.set('isFeatured', formData.get('isFeatured') === 'true');

            response = await fetch(url, {
                method: method,
                body: formData
            });
        }

        if (!response.ok) {
            hideLoading();
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 성공 시 페이지 이동 (로딩은 자동으로 유지됨)
        navigateWithLoading('/admin/management/exhibition', '목록으로 이동하는 중입니다...');
    } catch (error) {
        hideLoading();
        console.error('Error:', error);
        alert('저장 중 오류가 발생했습니다.');
    }
}

/**
 * 전시회 삭제 핸들러
 * @param {string} id - 삭제할 전시회 ID
 */
async function handleDelete(id) {
    if (confirm('정말로 이 전시회를 삭제하시겠습니까?')) {
        showLoading('전시회를 삭제하는 중입니다...', '잠시만 기다려주세요');

        // SSR 방식으로 폼 제출 (쿼리 파라미터 방식)
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `/admin/management/exhibition/${id}?_method=DELETE`;
        form.style.display = 'none';

        document.body.appendChild(form);
        form.submit();
    }
}
