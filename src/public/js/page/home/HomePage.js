/**
 * 메인 페이지 스크립트
 *
 * 이 파일은 메인 페이지의 모든 인터랙션을 관리합니다.
 * - 작품 모달 기능
 * - 주요 작품 데이터 로딩 및 표시
 */
import ArtworkAPI from '../../api/ArtworkAPI.js';
import { emptyArtworkTemplate, errorMessageTemplate, loadingSpinnerTemplate } from '../../templates/emptyArtworkTemplate.js';
import { modalTemplate, artworkModalContent } from '../../templates/modalTemplate.js';
import { initModal, showModal, updateModalContent } from '../../common/modal.js';
import { createArtworkCard } from '../../common/util/card.js';
import { showErrorMessage } from '/js/common/util/notification.js';

// 전역 변수 선언
let featuredArtworks = [];


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
        'modal-image': artwork.imageUrl || '/images/artwork-placeholder.svg',
        'modal-title': artwork.title || '제목 없음',
        'modal-artist': artwork.artistName || '작가 미상',
        'modal-affiliation': artwork.artistAffiliation || '',
        'modal-exhibition': artwork.exhibitionTitle || '',
        'modal-link': `/artwork/${artwork.slug}`
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

        // API 요청
        const response = await ArtworkAPI.getFeaturedArtworks();

        if (!response.success) {
            throw new Error(response.error || '추천 작품을 불러오는데 실패했습니다.');
        }

        const artworks = response.data;
        console.log(artworks);
        if (artworks && artworks.length > 0) {
            // 전역 변수에 작품 데이터 저장 (모달에서 사용)
            featuredArtworks = artworks;
            const fragment = document.createDocumentFragment();
            artworks.forEach(artwork => {
                const card = createArtworkCard(artwork, { type: 'home' });
                fragment.appendChild(card);
            });

            container.innerHTML = '';
            container.appendChild(fragment);
            setupCardEvents();
        } else {
            container.innerHTML = emptyArtworkTemplate;
        }
    } catch (error) {
        console.error('추천 작품 로딩 중 오류:', error);
        const container = document.getElementById('featured-artworks-container');
        if (container) {
            container.innerHTML = errorMessageTemplate;
        }
        showErrorMessage(error.message || '추천 작품을 불러오는 중 오류가 발생했습니다.');
    }
}

function setupCardEvents() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const artworkId = card.dataset.artworkId;
            if (artworkId) {
                const artwork = featuredArtworks.find(item => item.id.toString() === artworkId);
                if (artwork) {
                    showArtworkModal(artwork);
                }
            }
        });
    });
}
