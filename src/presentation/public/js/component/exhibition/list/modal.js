/**
 * 전시 목록 페이지 - 모달 모듈
 * 전시회 모달 관련 기능을 처리합니다.
 */
import { fadeIn, fadeOut, showErrorMessage } from '../../../utils/index.js';
import { fetchExhibitionDetail } from '../../../api/exhibition.js';

// 모달 상태
const modalState = {
    isOpen: false,
    currentExhibitionId: null
};

/**
 * 모달 초기화
 */
export function initModal() {
    const modal = document.getElementById('exhibition-modal');
    const closeModal = document.getElementById('close-modal');

    if (!modal || !closeModal) return;

    // 닫기 버튼 클릭 이벤트
    closeModal.addEventListener('click', () => {
        closeExhibitionModal();
    });

    // 모달 외부 클릭 시 닫기
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeExhibitionModal();
        }
    });

    // ESC 키 누를 때 닫기
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalState.isOpen) {
            closeExhibitionModal();
        }
    });

    // 전시회 카드 클릭 이벤트 처리
    const exhibitionCards = document.querySelectorAll('.exhibition-card');
    exhibitionCards.forEach(card => {
        card.addEventListener('click', async () => {
            const exhibitionId = card.dataset.exhibitionId;
            if (exhibitionId) {
                showExhibitionModal(exhibitionId);
            }
        });
    });
}

/**
 * 전시회 모달 표시
 * @param {string} exhibitionId - 전시회 ID
 */
export async function showExhibitionModal(exhibitionId) {
    const modal = document.getElementById('exhibition-modal');

    if (!modal) return;

    // 모달 상태 업데이트
    modalState.isOpen = true;
    modalState.currentExhibitionId = exhibitionId;

    try {
        // 전시회 데이터 가져오기
        const exhibition = await fetchExhibitionDetail(exhibitionId);

        // 모달 내용 업데이트
        updateModalContent(exhibition);

        // 모달 표시
        document.body.style.overflow = 'hidden'; // 스크롤 방지
        fadeIn(modal);
    } catch (error) {
        showErrorMessage('전시회 정보를 불러오는데 실패했습니다.');
        console.error('전시회 정보를 가져오는 중 오류 발생:', error);
    }
}

/**
 * 전시회 모달 닫기
 */
export function closeExhibitionModal() {
    const modal = document.getElementById('exhibition-modal');

    if (!modal) return;

    // 모달 상태 업데이트
    modalState.isOpen = false;
    modalState.currentExhibitionId = null;

    // 모달 닫기
    fadeOut(modal, () => {
        document.body.style.overflow = ''; // 스크롤 복원
    });
}

/**
 * 모달 내용 업데이트
 * @param {Object} exhibition - 전시회 데이터
 */
function updateModalContent(exhibition) {
    const modalImage = document.getElementById('modal-image');
    const modalTitle = document.getElementById('modal-title');
    const modalSubtitle = document.getElementById('modal-subtitle');
    const modalDescription = document.getElementById('modal-description');
    const modalDate = document.getElementById('modal-date');
    const modalArtworksLink = document.getElementById('modal-artworks-link');

    if (!modalImage || !modalTitle || !modalDescription || !modalDate || !modalArtworksLink) return;

    // 이미지 설정
    modalImage.src = exhibition.image;
    modalImage.alt = exhibition.title;

    // 제목 설정
    modalTitle.textContent = exhibition.title;

    // 부제목 설정
    if (modalSubtitle) {
        modalSubtitle.textContent = exhibition.subtitle || '';
    }

    // 설명 설정
    modalDescription.innerHTML = exhibition.description;

    // 날짜 설정
    modalDate.textContent = `${exhibition.startDate} ~ ${exhibition.endDate}`;

    // 작품 보기 링크 설정
    modalArtworksLink.href = `/exhibition/${exhibition.id}`;
}
