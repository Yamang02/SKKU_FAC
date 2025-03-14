/**
 * 홈 메인 페이지 - 모달 모듈
 * 작품 모달 관련 기능을 처리합니다.
 */
import { fadeIn, fadeOut } from '../common/util.js';
import { fetchArtworkDetail } from '../common/api.js';

// 모달 상태
const modalState = {
    isOpen: false,
    currentArtworkId: null
};

/**
 * 모달 초기화
 */
export function initModal() {
    const modal = document.getElementById('artwork-modal');
    const closeButton = document.getElementById('close-modal');

    if (!modal || !closeButton) return;

    // 닫기 버튼 클릭 이벤트
    closeButton.addEventListener('click', () => {
        closeModal();
    });

    // 모달 외부 클릭 시 닫기
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // ESC 키 누를 때 닫기
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalState.isOpen) {
            closeModal();
        }
    });

    // 작품 카드 클릭 이벤트 처리
    const artworkCards = document.querySelectorAll('.card--home');
    artworkCards.forEach(card => {
        card.addEventListener('click', () => {
            const artworkId = card.dataset.artworkId;
            if (artworkId) {
                showModal(artworkId);
            }
        });
    });
}

/**
 * 작품 모달 표시
 * @param {string} artworkId - 작품 ID
 */
export function showModal(artworkId) {
    const modal = document.getElementById('artwork-modal');
    const modalImage = document.getElementById('modal-image');
    const modalTitle = document.getElementById('modal-title');
    const modalArtist = document.getElementById('modal-artist');
    const detailLink = document.getElementById('detail-link');

    if (!modal || !modalImage || !modalTitle || !modalArtist || !detailLink) return;

    // 모달 상태 업데이트
    modalState.isOpen = true;
    modalState.currentArtworkId = artworkId;

    // 작품 데이터 가져오기 (실제 구현에서는 API 호출)
    fetchArtworkDetail(artworkId)
        .then(artwork => {
            // 모달 내용 업데이트
            updateModalContent(artwork, artworkId);

            // 모달 표시
            document.body.style.overflow = 'hidden'; // 스크롤 방지
            fadeIn(modal);
        })
        .catch(error => {
            console.error('작품 정보를 가져오는 중 오류 발생:', error);
        });
}

/**
 * 모달 닫기
 */
export function closeModal() {
    const modal = document.getElementById('artwork-modal');
    if (!modal) return;

    // 모달 상태 업데이트
    modalState.isOpen = false;

    // 모달 숨기기
    fadeOut(modal, () => {
        document.body.style.overflow = ''; // 스크롤 복원
    });
}

/**
 * 모달 내용 업데이트
 * @param {Object} artwork - 작품 데이터
 * @param {string} artworkId - 작품 ID
 */
function updateModalContent(artwork, artworkId) {
    const modalImage = document.getElementById('modal-image');
    const modalTitle = document.getElementById('modal-title');
    const modalArtist = document.getElementById('modal-artist');
    const detailLink = document.getElementById('detail-link');

    if (!modalImage || !modalTitle || !modalArtist || !detailLink) return;

    // 모달 내용 설정
    modalImage.src = artwork.image;
    modalImage.alt = artwork.title;
    modalTitle.textContent = artwork.title;
    modalArtist.textContent = artwork.artist;

    // 학과 정보 설정
    const modalDepartment = document.querySelector('.modal-department');
    if (modalDepartment && artwork.department) {
        modalDepartment.textContent = artwork.department;
    }

    // 전시회 정보 설정
    const modalExhibition = document.querySelector('.modal-exhibition');
    if (modalExhibition && artwork.exhibition) {
        modalExhibition.textContent = artwork.exhibition;
    }

    // 상세 페이지 링크 설정
    detailLink.href = `/artwork/${artworkId}`;
}
