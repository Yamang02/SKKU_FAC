/**
 * 메인 페이지 스크립트
 *
 * 이 파일은 메인 페이지의 모든 인터랙션을 관리합니다.
 * - 작품 모달 기능
 * - 주요 작품 데이터 로딩 및 표시
 */

// 모듈 스코프에서 실행
document.addEventListener('DOMContentLoaded', () => {
    // 작품 카드 로드
    loadFeaturedArtworks();

    // 모달 초기화
    initModal();
});

/**
 * 주요 작품 데이터를 불러와 카드를 생성합니다.
 */
async function loadFeaturedArtworks() {
    try {
        const container = document.getElementById('featured-artworks-container');
        if (!container) return;

        // 로딩 표시
        container.innerHTML = '<div class="loading-spinner">작품을 불러오는 중입니다...</div>';

        // API 요청 - /api/featured 엔드포인트 호출
        const response = await fetch('/artwork/api/featured');

        if (!response.ok) {
            throw new Error('작품 데이터를 불러올 수 없습니다.');
        }

        const result = await response.json();

        // 불러온 데이터로 작품 카드 생성
        if (result.success && Array.isArray(result.data)) {
            // 컨테이너 비우기
            container.innerHTML = '';

            // 각 작품에 대한 카드 생성
            for (const artwork of result.data) {
                // 카드 생성
                const card = await createArtworkCard(artwork);

                // 컨테이너에 카드 추가
                container.appendChild(card);
            }

            // 카드가 없는 경우
            if (result.data.length === 0) {
                container.innerHTML = `
                    <div class="empty-artwork-container">
                        <div class="empty-artwork-message">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M8.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                                <path d="M12 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zM3 2a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v8l-2.083-2.083a.5.5 0 0 0-.76.063L8 11 5.835 9.7a.5.5 0 0 0-.611.076L3 12V2z"/>
                            </svg>
                            <h3>주요 작품이 없습니다</h3>
                            <p>곧 새로운 작품이 전시될 예정입니다.</p>
                        </div>
                    </div>
                `;

                // 스타일 추가
                const style = document.createElement('style');
                style.textContent = `
                    .empty-artwork-container {
                        width: 100%;
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                        gap: 24px;
                    }
                    .empty-artwork-message {
                        background-color: #f8f9fa;
                        border-radius: 8px;
                        padding: 48px 20px;
                        text-align: center;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        min-height: 380px;
                        border: 1px solid #e9ecef;
                        grid-column: 1 / -1;
                    }
                    .empty-artwork-message svg {
                        margin-bottom: 16px;
                        color: #adb5bd;
                    }
                    .empty-artwork-message h3 {
                        font-size: 1.25rem;
                        margin-bottom: 8px;
                        color: #495057;
                    }
                    .empty-artwork-message p {
                        color: #6c757d;
                        font-size: 0.9rem;
                    }
                `;
                document.head.appendChild(style);
            }
        }
    } catch (error) {
        console.error('작품 데이터 로딩 중 오류:', error);
        const container = document.getElementById('featured-artworks-container');
        if (container) {
            container.innerHTML = `
                <div class="empty-artwork-container">
                    <div class="error-message">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.146.146 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.163.163 0 0 1-.054.06.116.116 0 0 1-.066.017H1.146a.115.115 0 0 1-.066-.017.163.163 0 0 1-.054-.06.176.176 0 0 1 .002-.183L7.884 2.073a.147.147 0 0 1 .054-.057zm1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566z"/>
                            <path d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995z"/>
                        </svg>
                        <h3>작품 로딩 실패</h3>
                        <p>작품 정보를 불러오는 중 오류가 발생했습니다.</p>
                    </div>
                </div>
            `;

            // 스타일 추가 (이미 추가되지 않았다면)
            if (!document.querySelector('style[data-for="artwork-messages"]')) {
                const style = document.createElement('style');
                style.setAttribute('data-for', 'artwork-messages');
                style.textContent = `
                    .empty-artwork-container {
                        width: 100%;
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                        gap: 24px;
                    }
                    .error-message {
                        background-color: #fff8f8;
                        border-radius: 8px;
                        padding: 48px 20px;
                        text-align: center;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        min-height: 380px;
                        border: 1px solid #f8d7da;
                        grid-column: 1 / -1;
                    }
                    .error-message svg {
                        margin-bottom: 16px;
                        color: #dc3545;
                    }
                    .error-message h3 {
                        font-size: 1.25rem;
                        margin-bottom: 8px;
                        color: #721c24;
                    }
                    .error-message p {
                        color: #721c24;
                        font-size: 0.9rem;
                    }
                `;
                document.head.appendChild(style);
            }
        }
    }
}

/**
 * 작품 데이터를 사용하여 카드 DOM 요소를 생성합니다.
 * @param {Object} artwork - 작품 데이터
 * @returns {HTMLElement} - 카드 DOM 요소
 */
async function createArtworkCard(artwork) {
    try {
        // 카드 데이터 가져오기
        const cardData = await fetchArtworkCardData(artwork.id);

        // 카드 DOM 생성
        const card = document.createElement('div');
        card.className = 'card card--home';
        card.dataset.artworkId = artwork.id;

        // 이미지 경로 처리
        let imagePath = '/images/artwork-placeholder.svg';
        let imageAlt = artwork.title || '';

        // 이미지가 있는 경우에만 이미지 경로 설정
        if (artwork.image) {
            imagePath = artwork.image;
        }

        // 카드 내용 생성
        card.innerHTML = `
            <div class="card__link">
                <div class="card__image-container">
                    <img src="${imagePath}"
                         alt="${imageAlt}"
                         class="card__image"
                         onerror="this.onerror=null; this.src='/images/artwork-placeholder.svg';">
                </div>
                <div class="card__info">
                    <h3 class="card__title">${artwork.title || '제목 없음'}</h3>
                    <p class="card__subtitle">${artwork.artistName || '작가 미상'}</p>
                    <div class="card__meta">${artwork.department || ''}</div>
                </div>
            </div>
        `;

        // 카드 클릭 이벤트 추가
        card.addEventListener('click', async function (e) {
            e.preventDefault();

            try {
                const modal = document.getElementById('artwork-modal');
                const modalData = await fetchArtworkModalData(artwork.id);

                // 모달 내용 업데이트
                updateModalContent(modal, modalData, artwork.id);

                // 모달 표시
                showModal(modal);
            } catch (error) {
                console.error('작품 정보 로딩 중 오류:', error);
                alert('작품 정보를 불러오는 중 오류가 발생했습니다.');
            }
        });

        return card;
    } catch (error) {
        console.error(`작품 카드(ID: ${artwork.id}) 생성 중 오류:`, error);

        // 에러 발생 시 기본 카드 반환
        const errorCard = document.createElement('div');
        errorCard.className = 'card card--home card--error';
        errorCard.innerHTML = `
            <div class="card__link">
                <div class="card__info">
                    <h3 class="card__title">로딩 실패</h3>
                    <p class="card__subtitle">작품 정보를 불러오는데 실패했습니다.</p>
                </div>
            </div>
        `;
        return errorCard;
    }
}

/**
 * 작품 카드 데이터를 가져옵니다.
 * @param {string} artworkId - 작품 ID
 * @returns {Promise<Object>} - 카드 데이터
 */
async function fetchArtworkCardData(artworkId) {
    const response = await fetch(`/artwork/api/data/${artworkId}?type=card`);
    if (!response.ok) throw new Error('작품 카드 데이터를 불러올 수 없습니다.');
    return await response.json();
}

/**
 * 작품 모달 데이터를 가져옵니다.
 * @param {string} artworkId - 작품 ID
 * @returns {Promise<Object>} - 모달 데이터
 */
async function fetchArtworkModalData(artworkId) {
    const response = await fetch(`/artwork/api/data/${artworkId}?type=modal`);
    if (!response.ok) throw new Error('작품 모달 데이터를 불러올 수 없습니다.');
    return await response.json();
}

/**
 * 모달 초기화
 */
function initModal() {
    // 모달 요소 선택
    const modal = document.getElementById('artwork-modal');
    const closeBtn = document.getElementById('close-modal');

    if (!modal || !closeBtn) {
        return;
    }

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
    const modalTitle = document.getElementById('modal-title');
    const modalArtist = document.getElementById('modal-artist');
    const modalDepartment = document.getElementById('modal-department');
    const modalExhibition = document.getElementById('modal-exhibition');
    const modalLink = document.getElementById('modal-link');

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
        modalArtist.textContent = artwork.artist;
    }

    // 학과 업데이트
    if (modalDepartment) {
        modalDepartment.textContent = artwork.department;
    }

    // 전시회 업데이트
    if (modalExhibition) {
        modalExhibition.textContent = artwork.exhibition || '없음';
    }

    // 상세 페이지 링크 업데이트
    if (modalLink) {
        modalLink.href = `/artwork/${artworkId}`;
    }
}
