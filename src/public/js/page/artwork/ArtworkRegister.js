import UserApi from '../../api/UserApi.js';
import ArtworkApi from '../../api/ArtworkApi.js';
// import ExhibitionAPI from '../../api/ExhibitionAPI.js';
import { showErrorMessage, showSuccessMessage, showLoading } from '../../common/util/notification.js';


// 페이지 초기화 함수
async function initializePage() {
    try {
        const response = await UserApi.getProfile();
        const user = response.data;
        console.log('user', user);

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

        // // 2. 출품 가능한 전시회 목록 가져오기
        // try {
        //     const response = await ExhibitionAPI.getSubmittableList();
        //     const exhibitions = response.data || response;
        //     const exhibitionSelect = document.getElementById('exhibition');

        //     if (exhibitionSelect && exhibitions && Array.isArray(exhibitions)) {
        //         // 기존 옵션 제거
        //         exhibitionSelect.innerHTML = '';

        //         // 기본 옵션 추가
        //         const defaultOption = document.createElement('option');
        //         defaultOption.value = '';
        //         defaultOption.textContent = '전시회를 선택해주세요';
        //         exhibitionSelect.appendChild(defaultOption);

        //         // 전시회 옵션 추가
        //         exhibitions.forEach(exhibition => {
        //             const option = document.createElement('option');
        //             option.value = exhibition.id;
        //             option.textContent = exhibition.title;
        //             exhibitionSelect.appendChild(option);
        //         });
        //     } else {
        //         throw new Error('전시회 목록을 불러오는데 실패했습니다.');
        //     }
        // } catch (error) {
        //     const exhibitionSelect = document.getElementById('exhibition');
        //     if (exhibitionSelect) {
        //         exhibitionSelect.innerHTML = '<option value="">전시회 목록을 불러올 수 없습니다</option>';
        //         exhibitionSelect.disabled = true;
        //     }
        //     // 에러 메시지를 화면에 표시
        //     showErrorMessage('전시회 목록을 불러오는데 실패했습니다. 나중에 다시 시도해주세요.');
        // }

        // 3. 기존 초기화 함수들 호출
        initImageUpload();
        initSubmitButton();
        handleExhibitionParam();
    } catch (error) {
        showErrorMessage('페이지 로딩 중 오류가 발생했습니다.');
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
        showLoading(true);
        try {
            // 제출 버튼 비활성화
            submitButton.disabled = true;

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

            try {
                const response = await ArtworkApi.createArtwork(formData);
                if (response.success) {
                    showSuccessMessage('작품 등록이 완료되었습니다.');
                    window.location.href = `/artwork/${response.data.artwork.id}`;
                } else {
                    throw new Error(response.error || '작품 등록에 실패했습니다.');
                }
            } catch (apiError) {
                console.error('API 오류:', apiError);
                showErrorMessage(apiError.message || '작품 등록 중 오류가 발생했습니다.');
            }

        } catch (error) {
            console.error('작품 등록 처리 중 오류:', error);
            showErrorMessage('작품 등록 처리 중 오류가 발생했습니다: ' + error.message);
        } finally {
            // 제출 버튼 활성화
            submitButton.disabled = false;
            submitButton.textContent = '작품 등록';
            showLoading(false);
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
