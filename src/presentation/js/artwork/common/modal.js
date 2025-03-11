/**
 * 작품 도메인 - 모달 모듈
 * 모달 관련 기능을 처리합니다.
 */
import { fadeIn, fadeOut } from './util.js';

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

    // 전역 함수로 등록 (다른 모듈에서 접근 가능하도록)
    window.showArtworkModal = showModal;
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

    // 작품 정보 가져오기
    const artworkCard = document.querySelector(`.artwork-card[data-artwork-id="${artworkId}"]`);
    if (!artworkCard) return;

    // 모달 상태 업데이트
    modalState.isOpen = true;
    modalState.currentArtworkId = artworkId;

    // 모달 내용 설정
    const image = artworkCard.querySelector('.artwork-image').src;
    const title = artworkCard.querySelector('.artwork-title').textContent;
    const artist = artworkCard.querySelector('.artwork-artist').textContent;
    const department = artworkCard.dataset.department;

    modalImage.src = image;
    modalImage.alt = title;
    modalTitle.textContent = title;
    modalArtist.textContent = artist;

    // 학과 정보 설정
    const modalDepartment = document.querySelector('.modal-department');
    if (modalDepartment && department) {
        modalDepartment.textContent = department;
    }

    // 상세 페이지 링크 설정
    detailLink.href = `/artwork/${artworkId}`;

    // 모달 표시
    document.body.style.overflow = 'hidden'; // 스크롤 방지
    fadeIn(modal);
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
 * 현재 모달 상태 반환
 */
export function getModalState() {
    return { ...modalState };
}
