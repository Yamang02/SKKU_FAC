/**
 * 메인 페이지 스크립트
 *
 * 이 파일은 메인 페이지의 모든 인터랙션을 관리합니다.
 * - 작품 모달 기능
 */

// 모듈 스코프에서 실행
document.addEventListener('DOMContentLoaded', () => {
    // 모달 초기화
    initModal();
});

/**
 * 모달 초기화
 */
function initModal() {
    // 카드 요소 선택
    const cards = document.querySelectorAll('.card.card--home');

    if (cards.length === 0) {
        return;
    }

    // 모달 요소 선택
    const modal = document.getElementById('artwork-modal');
    const closeBtn = document.getElementById('close-modal');

    if (!modal || !closeBtn) {
        return;
    }

    // 각 카드에 클릭 이벤트 추가
    cards.forEach((card) => {
        const artworkId = card.dataset.artworkId;

        // 카드 클릭 이벤트
        card.addEventListener('click', async function (e) {
            // 기본 동작 방지 (링크 이동 등)
            e.preventDefault();

            try {
                const response = await fetch(`/artwork/api/${artworkId}`);
                if (!response.ok) throw new Error('작품 정보를 불러올 수 없습니다.');

                const artwork = await response.json();

                // 모달 내용 업데이트
                updateModalContent(modal, artwork, artworkId);

                // 모달 표시
                showModal(modal);
            } catch (error) {
                console.error('작품 정보 로딩 중 오류:', error);
                alert('작품 정보를 불러오는 중 오류가 발생했습니다.');
            }
        });

        // 카드 내부 링크 요소에도 이벤트 추가 (이벤트 버블링 방지)
        const cardLink = card.querySelector('.card__link');
        if (cardLink) {
            cardLink.addEventListener('click', function (e) {
                e.preventDefault(); // 기본 동작 방지
                e.stopPropagation(); // 이벤트 버블링 방지

                // 부모 카드의 클릭 이벤트 트리거
                card.click();
            });
        }
    });

    // 닫기 버튼 이벤트
    closeBtn.addEventListener('click', function () {
        closeModal(modal);
    });

    // 모달 외부 클릭 시 닫기
    window.addEventListener('click', function (e) {
        if (e.target === modal) {
            closeModal(modal);
        }
    });

    // ESC 키 누를 때 모달 닫기
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeModal(modal);
        }
    });
}

/**
 * 모달 표시 함수
 * @param {HTMLElement} modal - 모달 요소
 */
function showModal(modal) {
    // 스크롤바 너비 계산
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

    // body에 modal-open 클래스 추가
    document.body.classList.add('modal-open');
    document.body.style.paddingRight = `${scrollBarWidth}px`;

    // 모달 표시
    modal.style.display = 'block';
    modal.classList.add('show');

    // 모달 내부 스크롤 초기화
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
        modalContent.scrollTop = 0;
    }
}

/**
 * 모달 닫기 함수
 * @param {HTMLElement} modal - 모달 요소
 */
function closeModal(modal) {
    // body에서 modal-open 클래스 제거
    document.body.classList.remove('modal-open');
    document.body.style.paddingRight = '';

    // 모달 숨기기
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

/**
 * 모달 내용 업데이트 함수
 * @param {HTMLElement} modal - 모달 요소
 * @param {Object} artwork - 작품 데이터
 * @param {string} artworkId - 작품 ID
 */
function updateModalContent(modal, artwork, artworkId) {
    // 모달 내부 요소 선택
    const modalImage = document.getElementById('modal-image');
    const modalTitle = document.querySelector('.modal-title');
    const modalArtist = document.querySelector('.modal-artist');
    const modalDepartment = document.querySelector('.modal-department');
    const modalExhibition = document.querySelector('.modal-exhibition');
    const modalLink = document.querySelector('.detail-button');

    // 이미지 업데이트
    if (modalImage) {
        modalImage.src = artwork.imageUrl;
        modalImage.alt = artwork.title;
    }

    // 제목 업데이트
    if (modalTitle) {
        modalTitle.textContent = artwork.title;
    }

    // 작가 업데이트
    if (modalArtist) {
        modalArtist.textContent = `작가: ${artwork.artist}`;
    }

    // 학과 업데이트
    if (modalDepartment) {
        modalDepartment.textContent = `학과: ${artwork.department}`;
    }

    // 전시회 업데이트
    if (modalExhibition) {
        modalExhibition.textContent = `전시: ${artwork.exhibition || '없음'}`;
    }

    // 상세 페이지 링크 업데이트
    if (modalLink) {
        modalLink.href = `/artwork/${artworkId}`;
    }
}
