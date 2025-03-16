/**
 * 메인 페이지 스크립트
 *
 * 이 파일은 메인 페이지의 모든 인터랙션을 관리합니다.
 * - 작품 모달 기능
 */

// 모듈 스코프에서 실행
document.addEventListener('DOMContentLoaded', function () {
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
        card.addEventListener('click', function (e) {
            // 기본 동작 방지 (링크 이동 등)
            e.preventDefault();

            // 카드에서 직접 데이터 추출
            const artwork = {
                title: card.querySelector('.card__title').textContent.trim(),
                artist: card.querySelector('.card__subtitle').textContent.trim(),
                department: card.querySelector('.card__meta').textContent.trim(),
                image: card.querySelector('.card__image').src,
                exhibition: '' // 카드에 전시회 정보가 없으면 빈 문자열 사용
            };

            // 모달 내용 업데이트
            updateModalContent(modal, artwork, artworkId);

            // 모달 표시
            showModal(modal);
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

    // 스크롤바 너비가 0이 아닌 경우에만 패딩 적용
    if (scrollBarWidth > 0) {
        document.body.style.paddingRight = scrollBarWidth + 'px';
    }

    // 모달 표시
    modal.style.display = 'block';

    // 트랜지션을 위한 지연
    setTimeout(() => {
        modal.style.opacity = '1';
    }, 10);
}

/**
 * 모달 내용 업데이트
 * @param {HTMLElement} modal - 모달 요소
 * @param {Object} artwork - 작품 데이터
 * @param {string} artworkId - 작품 ID
 */
function updateModalContent(modal, artwork, artworkId) {
    const modalImage = modal.querySelector('.modal-image');
    const modalTitle = modal.querySelector('.modal-title');
    const modalArtist = modal.querySelector('.modal-artist');
    const modalDepartment = modal.querySelector('.modal-department');
    const modalExhibition = modal.querySelector('.modal-exhibition');
    const detailLink = modal.querySelector('#detail-link');

    if (modalImage) {
        modalImage.src = artwork.image;
        modalImage.alt = artwork.title;
    }

    if (modalTitle) {
        modalTitle.textContent = artwork.title;
    }

    if (modalArtist) {
        modalArtist.textContent = artwork.artist;
    }

    if (modalDepartment) {
        modalDepartment.textContent = artwork.department || '';
    }

    if (modalExhibition) {
        modalExhibition.textContent = artwork.exhibition || '';
    }

    if (detailLink) {
        detailLink.href = `/artwork/${artworkId}`;
    }
}

/**
 * 모달 닫기
 * @param {HTMLElement} modal - 모달 요소
 */
function closeModal(modal) {
    if (!modal) {
        return;
    }

    // 페이드 아웃
    modal.style.opacity = '0';

    // 트랜지션 후 숨김 처리
    setTimeout(() => {
        modal.style.display = 'none';

        // body에서 modal-open 클래스 제거
        document.body.classList.remove('modal-open');

        // body 패딩 초기화
        document.body.style.paddingRight = '';
    }, 300);
}
