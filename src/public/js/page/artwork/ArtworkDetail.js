/**
 * 작품 상세 페이지
 * 작품 상세 페이지의 모든 기능을 처리합니다.
 */

import ArtworkApi from '../../api/ArtworkApi.js';
import UserApi from '../../api/UserApi.js';
import { showErrorMessage, showSuccessMessage, showConfirm } from '../../common/util/notification.js';
import { createArtworkCard } from '../../common/util/card.js';
import { getArtworkSlug } from '../../common/util/url.js';
import QRCodeService from '../../common/service/QRCodeService.js';


function animateButtonClick(button) {
    if (!button) return;
    button.classList.add('clicked');
    setTimeout(() => {
        button.classList.remove('clicked');
    }, 200);
}

// 이미지 뷰어 관련 함수
function initImageViewer() {
    initStickyImageSection();
    initImageZoom();
}

function initStickyImageSection() {
    const imageSection = document.querySelector('.artwork-image-section');
    const infoSection = document.querySelector('.artwork-info-section');

    if (!imageSection || !infoSection) return;

    updateStickyPosition();

    window.addEventListener('scroll', updateStickyPosition);
    window.addEventListener('resize', updateStickyPosition);

    function updateStickyPosition() {
        const imageSectionHeight = imageSection.offsetHeight;
        const infoSectionHeight = infoSection.offsetHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (imageSectionHeight < infoSectionHeight) {
            if (scrollTop > 100) {
                imageSection.classList.add('sticky');

                const bottomLimit = infoSection.offsetTop + infoSectionHeight - imageSectionHeight - 40;
                if (scrollTop > bottomLimit) {
                    imageSection.classList.remove('sticky');
                    imageSection.classList.add('at-bottom');
                } else {
                    imageSection.classList.remove('at-bottom');
                }
            } else {
                imageSection.classList.remove('sticky');
                imageSection.classList.remove('at-bottom');
            }
        }
    }
}

function initImageZoom() {
    const artworkImage = document.querySelector('.artwork-main-image');
    const imageWrapper = document.querySelector('.artwork-image-wrapper');

    if (!artworkImage || !imageWrapper) return;

    let isZoomed = false;

    artworkImage.addEventListener('click', () => {
        if (isZoomed) {
            artworkImage.classList.remove('zoomed');
            imageWrapper.classList.remove('zoomed-wrapper');
        } else {
            artworkImage.classList.add('zoomed');
            imageWrapper.classList.add('zoomed-wrapper');
        }

        isZoomed = !isZoomed;
    });

    document.addEventListener('click', (e) => {
        if (isZoomed && e.target !== artworkImage) {
            artworkImage.classList.remove('zoomed');
            imageWrapper.classList.remove('zoomed-wrapper');
            isZoomed = false;
        }
    });

    artworkImage.addEventListener('click', (e) => {
        e.stopPropagation();
    });
}

// 관련 작품 관련 함수
function initRelatedArtworks() {
    const scrollContainer = document.querySelector('.related-artworks-list');
    const prevBtn = document.querySelector('.btn--scroll[aria-label="이전 작품"]');
    const nextBtn = document.querySelector('.btn--scroll[aria-label="다음 작품"]');

    if (!scrollContainer || !prevBtn || !nextBtn) return;

    prevBtn.addEventListener('click', () => {
        scrollContainer.scrollBy({ left: -340, behavior: 'smooth' });
        animateButtonClick(prevBtn);
        updateScrollButtons();
    });

    nextBtn.addEventListener('click', () => {
        scrollContainer.scrollBy({ left: 340, behavior: 'smooth' });
        animateButtonClick(nextBtn);
        updateScrollButtons();
    });

    scrollContainer.addEventListener('scroll', () => {
        updateScrollButtons();
    });

    updateScrollButtons();

    function updateScrollButtons() {
        const isAtStart = scrollContainer.scrollLeft <= 10;
        const isAtEnd = scrollContainer.scrollLeft + scrollContainer.offsetWidth >= scrollContainer.scrollWidth - 10;

        prevBtn.style.opacity = isAtStart ? '0.5' : '1';
        prevBtn.disabled = isAtStart;
        nextBtn.style.opacity = isAtEnd ? '0.5' : '1';
        nextBtn.disabled = isAtEnd;
    }
}

// 페이지 초기화
initPage();

async function initPage() {
    try {
        await loadArtworkDetail();
        initImageViewer();
        initRelatedArtworks();
        initModalHandlers();
    } catch (error) {
        console.error('페이지 초기화 중 오류:', error);
        showErrorMessage('작품 정보를 불러오는데 실패했습니다.');
    }
}

/**
 * 작품 상세 정보를 로드합니다.
 * @private
 */
async function loadArtworkDetail() {
    try {
        const artworkSlug = getArtworkSlug();
        if (!artworkSlug) {
            throw new Error('작품을 찾을 수 없습니다.');
        }

        const response = await ArtworkApi.getArtworkDetailForPage(artworkSlug);

        if (!response.success) {
            throw new Error(response.error || '작품 데이터를 불러오는데 실패했습니다.');
        }

        const artwork = response.data;
        if (!artwork) {
            throw new Error('작품 데이터가 없습니다.');
        }

        updateArtworkDetail(artwork);

        // 출품 가능한 전시회 정보를 모달에 설정
        const exhibitionList = document.getElementById('exhibitionList');
        if (exhibitionList) {
            exhibitionList.innerHTML = ''; // 기존 내용 초기화
            artwork.submittableExhibitions.forEach(exhibition => {
                const listItem = document.createElement('li');

                // 출품 버튼 추가
                const submitButton = document.createElement('button');
                submitButton.textContent = '출품하기';
                submitButton.className = 'btn btn-submit'; // 클래스 추가
                submitButton.onclick = async () => {
                    await submitArtworkToExhibition(artwork.id, exhibition.id);
                };

                // 전시회 제목 추가
                const titleText = document.createElement('span');
                titleText.textContent = exhibition.title;
                titleText.style.marginLeft = '10px'; // 간격 조정

                listItem.appendChild(submitButton);
                listItem.appendChild(titleText);
                exhibitionList.appendChild(listItem);
            });
        }

        // 이미 출품된 전시회 목록 업데이트
        const submittedExhibitionList = document.getElementById('submittedExhibitionList');
        if (submittedExhibitionList) {
            submittedExhibitionList.innerHTML = ''; // 기존 내용 초기화
            artwork.exhibitions.forEach(exhibition => {
                const listItem = document.createElement('li');

                // 출품 취소 버튼 추가
                const cancelButton = document.createElement('button');
                cancelButton.textContent = '출품 취소';
                cancelButton.className = 'btn btn-cancel'; // 클래스 추가
                cancelButton.onclick = async () => {
                    await cancelSubmission(artwork.id, exhibition.id);
                };

                // 전시회 제목 추가
                const titleText = document.createElement('span');
                titleText.textContent = exhibition.title;
                titleText.style.marginLeft = '10px'; // 간격 조정

                listItem.appendChild(cancelButton);
                listItem.appendChild(titleText);
                submittedExhibitionList.appendChild(listItem);
            });
        }

        // 현재 로그인한 사용자 정보를 가져와서 버튼 표시 여부 결정
        await checkUserPermission(artwork);
    } catch (error) {
        console.error('작품 정보 로드 중 오류:', error);
        showErrorMessage(error.message || '작품 정보를 불러오는데 실패했습니다.');
    }
}

// 출품 취소 함수
async function cancelSubmission(artworkId, exhibitionId) {
    try {
        const response = await ArtworkApi.cancelArtworkSubmission(artworkId, exhibitionId);
        if (response.success) {
            showSuccessMessage('출품이 취소되었습니다.');
            // 페이지를 새로 고침하거나 목록을 업데이트하여 변경 사항을 반영
            loadArtworkDetail();
        } else {
            showErrorMessage(response.error || '출품 취소에 실패했습니다.');
        }
    } catch (error) {
        console.error('출품 취소 중 오류:', error);
        showErrorMessage('출품 취소 중 오류가 발생했습니다.');
    }
}

// 출품 함수
async function submitArtworkToExhibition(artworkId, exhibitionId) {
    try {
        const response = await ArtworkApi.submitArtworkToExhibition(artworkId, exhibitionId);
        if (response.success) {
            showSuccessMessage('출품이 완료되었습니다.');
            loadArtworkDetail(); // 변경 사항 반영
        } else {
            showErrorMessage(response.error || '출품에 실패했습니다.');
        }
    } catch (error) {
        console.error('출품 중 오류:', error);
        showErrorMessage('출품 중 오류가 발생했습니다.');
    }
}

// 모달 관련 함수
function initModalHandlers() {
    const modal = document.getElementById('artworkManageModal');
    if (!modal) return;

    // 모달 닫기 버튼 이벤트 처리
    const closeButton = modal.querySelector('.close');
    const closeBtn = modal.querySelector('.close-btn');

    if (closeButton) {
        closeButton.addEventListener('click', () => {
            closeModal();
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            closeModal();
        });
    }

    // 모달 외부 클릭시 닫기
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // 저장 버튼 이벤트 처리
    const saveButton = document.getElementById('saveArtworkChanges');
    if (saveButton) {
        saveButton.addEventListener('click', saveArtworkChanges);
    }

    // 삭제 버튼 이벤트 처리
    const deleteButton = document.getElementById('deleteArtwork');
    if (deleteButton) {
        deleteButton.addEventListener('click', confirmDeleteArtwork);
    }
}

/**
 * 모달 열기 함수
 * @param {Object} artwork - 작품 정보
 */
function openModal(artwork) {
    const modal = document.getElementById('artworkManageModal');
    if (!modal) return;

    // 입력 필드에 현재 작품 정보 설정
    document.getElementById('editTitle').value = artwork.title || '';
    document.getElementById('editYear').value = artwork.year || '';
    document.getElementById('editMedium').value = artwork.medium || '';
    document.getElementById('editSize').value = artwork.size || '';
    document.getElementById('editDescription').value = artwork.description || '';

    // 작품 ID를 저장 (업데이트 시 필요)
    modal.dataset.artworkId = artwork.id;

    // 모달 표시
    modal.style.display = 'flex';

    // body에 modal-open 클래스 추가하여 스크롤 방지
    document.body.classList.add('modal-open');
}

/**
 * 모달 닫기 함수
 */
function closeModal() {
    const modal = document.getElementById('artworkManageModal');
    if (modal) {
        modal.style.display = 'none';

        // body에서 modal-open 클래스 제거하여 스크롤 허용
        document.body.classList.remove('modal-open');
    }
}

/**
 * 작품 정보 저장 함수
 */
async function saveArtworkChanges() {
    try {
        const modal = document.getElementById('artworkManageModal');
        const artworkId = modal.dataset.artworkId;

        // 입력 필드에서 데이터 가져오기
        const updatedData = {
            year: document.getElementById('editYear').value,
            medium: document.getElementById('editMedium').value,
            size: document.getElementById('editSize').value,
            description: document.getElementById('editDescription').value
        };

        // 작품 정보 업데이트 API 호출
        const response = await ArtworkApi.updateArtwork(artworkId, updatedData);

        if (response.success) {
            showSuccessMessage('작품 정보가 성공적으로 업데이트되었습니다.');

            setTimeout(() => {
                window.location.href = '/success?message=작품 정보가 성공적으로 업데이트되었습니다.';
            }, 2000);
        } else {
            showErrorMessage(response.error || '작품 정보 업데이트에 실패했습니다.');
        }
    } catch (error) {
        console.error('작품 정보 업데이트 중 오류:', error);
        showErrorMessage('작품 정보 업데이트에 실패했습니다.');
    }
}

/**
 * 작품 삭제 확인 함수
 */
function confirmDeleteArtwork() {
    // 확인 모달이 표시되기 전에 오버레이 추가
    const overlay = document.createElement('div');
    overlay.className = 'confirm-overlay';
    document.body.appendChild(overlay);

    showConfirm('정말로 이 작품을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.').then(result => {
        // 확인 모달 응답 후 오버레이 제거
        document.body.removeChild(overlay);

        if (result) {
            deleteArtwork();
        }
    });
}

/**
 * ESC 키를 눌렀을 때 모달 닫기
 */
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});

/**
 * 작품 삭제 함수
 */
async function deleteArtwork() {
    try {
        const modal = document.getElementById('artworkManageModal');
        const artworkId = modal.dataset.artworkId;

        // 작품 삭제 API 호출
        const response = await ArtworkApi.deleteArtwork(artworkId);

        if (response.success) {
            showSuccessMessage('작품이 성공적으로 삭제되었습니다.');

            setTimeout(() => {
                window.location.href = '/success?message=작품이 성공적으로 삭제되었습니다.';
            }, 2000);
        } else {
            showErrorMessage(response.error || '작품 삭제에 실패했습니다.');
        }
    } catch (error) {
        console.error('작품 삭제 중 오류:', error);
        showErrorMessage('작품 삭제에 실패했습니다.');
    }
}

/**
 * 사용자가 작품 소유자인지 확인하고 관리 버튼을 처리합니다.
 * @param {Object} artwork - 작품 정보 객체
 */
async function checkUserPermission(artwork) {
    try {
        // 현재 로그인한 사용자 정보 가져오기
        const response = await UserApi.getSessionUser();

        if (response.success && response.data) {
            const currentUser = response.data;
            const manageButton = document.getElementById('manageArtworkBtn');
            const generateQRBtn = document.getElementById('generateQRBtn');
            const shareByKakaoTalkBtn = document.getElementById('shareByKakaoTalkBtn');

            // 현재 사용자가 작품 작가인 경우 관리 버튼 표시
            if (currentUser.id === artwork.userId) {
                manageButton.style.display = 'flex';
                generateQRBtn.style.display = 'flex';
                shareByKakaoTalkBtn.style.display = 'flex';

                // 관리 버튼 클릭 시 모달 열기
                manageButton.addEventListener('click', () => {
                    openModal(artwork);
                });
            }
        }
    } catch (error) {
        console.error('사용자 권한 확인 중 오류:', error);
    }
}

/**
 * 작품 상세 정보를 화면에 업데이트합니다.
 * @param {Object} artwork - 작품 정보 객체
 * @private
 */
function updateArtworkDetail(artwork) {
    // 작품 이미지 업데이트
    const artworkImage = document.querySelector('.artwork-main-image');
    if (artworkImage) {
        artworkImage.src = artwork.imageUrl || '/images/artwork-placeholder.svg';
        artworkImage.alt = artwork.title || '작품 이미지';
    }

    // 작품 제목 업데이트
    const titleElement = document.querySelector('.artwork-detail-title');
    if (titleElement) {
        titleElement.textContent = artwork.title || '미표기';
    }

    // 작가 정보 업데이트
    const artistElement = document.querySelector('.artwork-detail-artist');
    if (artistElement) {
        artistElement.textContent = artwork.artistName || '미표기';
    }

    // 학과 정보 업데이트
    const affiliationElement = document.querySelector('.artwork-detail-affiliation');
    if (affiliationElement) {
        affiliationElement.textContent = artwork.artistAffiliation || '미표기';
    }

    // 작품 정보 업데이트
    const yearElement = document.querySelector('.value.year');
    if (yearElement) {
        yearElement.textContent = artwork.year || '미표기';
    }

    const mediumElement = document.querySelector('.value.medium');
    if (mediumElement) {
        mediumElement.textContent = artwork.medium || '미표기';
    }

    const sizeElement = document.querySelector('.value.size');
    if (sizeElement) {
        sizeElement.textContent = artwork.size || '미표기';
    }

    // 작품 설명 업데이트
    const descriptionElement = document.querySelector('.artwork-description');
    if (descriptionElement) {
        descriptionElement.textContent = artwork.description || '미표기';
    }

    // 전시회 정보 업데이트
    const exhibitionElement = document.querySelector('.exhibition-info');
    if (exhibitionElement) {
        // 기존 내용을 초기화
        exhibitionElement.innerHTML = '';

        // exhibitions 배열이 존재하고 길이가 0보다 큰 경우
        if (artwork.exhibitions && artwork.exhibitions.length > 0) {
            artwork.exhibitions.forEach(exhibition => {
                const exhibitionItem = document.createElement('div');
                exhibitionItem.className = 'exhibition-item'; // 클래스 추가
                exhibitionItem.textContent = exhibition.title || '전시회 제목 없음'; // 전시회 제목

                // 클릭 이벤트 추가
                exhibitionItem.onclick = () => {
                    window.location.href = `/artwork/list?exhibition=${exhibition.id}&page=1`; // 링크 설정
                };

                exhibitionElement.appendChild(exhibitionItem);
            });
        } else {
            exhibitionElement.textContent = '출품되지 않음'; // 전시회 정보가 없을 경우
        }
    }

    // 페이지 타이틀 업데이트
    document.title = `${artwork.title || '작품 상세'} - 성미회`;

    // 관련 작품 업데이트
    updateRelatedArtworks(artwork.relatedArtworks);
}

/**
 * 관련 작품 목록을 업데이트합니다.
 * @param {Array<Object>} artworks - 관련 작품 목록
 * @private
 */
function updateRelatedArtworks(artworks) {
    const container = document.querySelector('.related-artworks-list');
    if (!container) return;

    if (!artworks || artworks.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-image"></i>
                <p>관련된 다른 작품이 없습니다.</p>
            </div>
        `;
        return;
    }

    const fragment = document.createDocumentFragment();
    artworks.forEach(artwork => {
        const card = createArtworkCard(artwork, { type: 'list' });
        if (card) {
            fragment.appendChild(card);
        }
    });

    container.innerHTML = '';
    container.appendChild(fragment);
}

// 카카오톡 공유 버튼 이벤트 리스너 등록
const shareButton = document.getElementById('shareByKakaoTalkBtn');
if (shareButton) {
    shareButton.addEventListener('click', () => {
        // 현재 작품 정보가 있을 때만 공유 기능 실행
        const artworkTitle = document.querySelector('.artwork-detail-title').textContent;
        const artworkImage = document.querySelector('.artwork-main-image').src;
        shareByKakaoTalk({
            title: artworkTitle,
            imageUrl: artworkImage
        });
    });
}

function shareByKakaoTalk(artwork) {
    const jsKey = 'd559013a67d0a8e4f0358affeefdbc28';
    // window.Kakao 객체 존재 여부 확인
    if (typeof window.Kakao === 'undefined') {
        console.error('Kakao SDK가 로드되지 않았습니다.');
        return;
    }

    if (!window.Kakao || !jsKey) return;
    if (!Kakao.isInitialized()) {
        Kakao.init(jsKey);
    }


    Kakao.Link.sendDefault({
        objectType: 'feed',
        content: {
            title: artwork.title,
            description: '성미회 작품 감상',
            imageUrl: artwork.imageUrl,
            link: {
                webUrl: window.location.href,
                mobileWebUrl: window.location.href
            }
        }
    });
}

const generateQRBtn = document.getElementById('generateQRBtn');
if (generateQRBtn) {
    generateQRBtn.addEventListener('click', () => {
        const artworkTitle = document.querySelector('.artwork-detail-title').textContent;
        const artistName = document.querySelector('.artwork-detail-artist').textContent;

        QRCodeService.showQRCode({
            title: artworkTitle,
            subtitle: artistName
        });
    });
}

