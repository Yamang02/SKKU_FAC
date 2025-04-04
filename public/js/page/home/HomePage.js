/**
 * 메인 페이지 스크립트
 *
 * 이 파일은 메인 페이지의 모든 인터랙션을 관리합니다.
 * - 작품 모달 기능
 * - 주요 작품 데이터 로딩 및 표시
 */
import ArtworkAPI from '../../api/ArtworkAPI.js';
import Pagination from '../../common/pagination.js';
import { emptyArtworkTemplate, errorMessageTemplate, loadingSpinnerTemplate } from '../../templates/emptyArtworkTemplate.js';
import { modalTemplate, artworkModalContent } from '../../templates/modalTemplate.js';
import { initModal, showModal, closeModal, updateModalContent } from '../../common/modal.js';
import { createArtworkCard } from '../../common/util/card.js';

// 전역 변수 선언
let featuredArtworks = [];
let featuredArtworksResult;

// 모달 초기화
function initArtworkModal() {
    // 모달 HTML 추가
    const modalHTML = modalTemplate('artwork-modal', artworkModalContent);
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // 모달 초기화
    initModal('artwork-modal');
}

// 작품 모달 표시
function showArtworkModal(artwork) {
    // 모달 내용 업데이트
    updateModalContent('artwork-modal', {
        'modal-image': artwork.image || '/images/artwork-placeholder.svg',
        'modal-title': artwork.title || '제목 없음',
        'modal-artist': artwork.artistName || '작가 미상',
        'modal-department': artwork.department || '',
        'modal-exhibition': artwork.exhibitionTitle || '',
        'modal-link': `/artwork/${artwork.id}`
    });

    // 모달 표시
    showModal('artwork-modal');
}

// DOMContentLoaded 이벤트 리스너 제거하고 직접 실행
initArtworkModal();
loadFeaturedArtworks();

/**
 * 주요 작품 데이터를 불러와 카드를 생성합니다.
 */
async function loadFeaturedArtworks() {
    try {
        const container = document.getElementById('featured-artworks-container');
        if (!container) return;

        // 로딩 표시
        container.innerHTML = loadingSpinnerTemplate;

        // 페이지네이션 객체 생성
        const pagination = new Pagination({
            page: 1,
            size: 6
        });

        // API 요청 - ArtworkAPI 사용
        const result = await ArtworkAPI.getArtworkList(pagination, { isFeatured: true });

        // 불러온 데이터로 작품 카드 생성
        if (result.success && result.data && Array.isArray(result.data.items)) {
            featuredArtworksResult = result;
            featuredArtworks = result.data.items;
            renderArtworkCards(featuredArtworks);
            setupCardEvents();
        } else {
            container.innerHTML = emptyArtworkTemplate;
        }
    } catch (error) {
        console.error('작품 데이터 로딩 중 오류:', error);
        const container = document.getElementById('featured-artworks-container');
        if (container) {
            container.innerHTML = errorMessageTemplate;
        }
    }
}

function renderArtworkCards(artworks) {
    const container = document.querySelector('.artwork-grid');
    if (!container) return;

    container.innerHTML = '';

    if (!artworks || artworks.length === 0) {
        container.innerHTML = emptyArtworkTemplate;
        return;
    }

    const fragment = document.createDocumentFragment();
    artworks.forEach(artwork => {
        const card = createArtworkCard(artwork, { type: 'home' });
        fragment.appendChild(card);
    });

    container.appendChild(fragment);
}

function setupCardEvents() {
    const container = document.querySelector('.artwork-grid');
    if (!container) return;

    container.addEventListener('click', handleCardClick);
}

function handleCardClick(e) {
    const card = e.target.closest('.card');
    if (!card) return;

    e.preventDefault();
    e.stopPropagation();

    const artworkId = card.dataset.artworkId;
    if (!artworkId || !featuredArtworksResult) return;

    // ID 타입을 문자열로 통일
    const artwork = featuredArtworksResult.data.items.find(item => String(item.id) === String(artworkId));
    if (!artwork) return;

    showArtworkModal(artwork);
}

function showToast(message, type = 'info') {
    // 간단한 토스트 메시지 표시
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // 3초 후 토스트 제거
    setTimeout(() => {
        toast.remove();
    }, 3000);
}
