/**
 * 전시 목록 페이지 - 더보기 모듈
 * 더보기 버튼을 통한 추가 전시회 로드 기능을 처리합니다.
 */

// 페이지네이션 상태
const paginationState = {
    currentPage: 1,
    itemsPerPage: 6,
    totalItems: 30, // 데모용 총 아이템 수
    hasMore: true,
    isLoading: false
};

/**
 * 더보기 기능 초기화
 */
export function initLoadMore() {
    // 스크롤 이벤트 리스너 등록
    window.addEventListener('scroll', handleScroll);

    // 초기 상태 설정
    updateLoadingIndicator();
}

/**
 * 스크롤 이벤트 핸들러
 */
function handleScroll() {
    // 이미 로딩 중이거나 더 불러올 항목이 없으면 중단
    if (paginationState.isLoading || !paginationState.hasMore) return;

    // 페이지 하단에 도달했는지 확인
    const scrollHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const clientHeight = window.innerHeight || document.documentElement.clientHeight;

    // 하단에서 200px 이내로 스크롤되면 추가 로드
    if (scrollTop + clientHeight >= scrollHeight - 200) {
        loadMoreExhibitions();
    }
}

/**
 * 추가 전시회 로드
 */
function loadMoreExhibitions() {
    // 로딩 상태 설정
    paginationState.isLoading = true;
    updateLoadingIndicator();

    // 페이지 증가
    paginationState.currentPage++;

    // 서버에서 데이터를 가져오는 대신 지연 시뮬레이션
    setTimeout(() => {
        // 기존 전시회 복제하여 추가 (데모용)
        const exhibitionsContainer = document.getElementById('exhibitions-container');
        const existingCards = document.querySelectorAll('.exhibition-card');

        if (exhibitionsContainer && existingCards.length > 0) {
            // 기존 카드 복제하여 추가 (실제로는 서버에서 새 데이터 받아옴)
            const cardsToAdd = Math.min(paginationState.itemsPerPage, existingCards.length);

            for (let i = 0; i < cardsToAdd; i++) {
                const randomIndex = Math.floor(Math.random() * existingCards.length);
                const clonedCard = existingCards[randomIndex].cloneNode(true);

                // 고유 ID 부여 (실제로는 서버에서 받은 데이터의 ID 사용)
                const newId = `exhibition-${Date.now()}-${i}`;
                clonedCard.setAttribute('data-exhibition-id', newId);

                // 전시회 유형 랜덤 설정 (데모용)
                const exhibitionTypes = ['regular', 'special'];
                const randomType = exhibitionTypes[Math.floor(Math.random() * exhibitionTypes.length)];
                clonedCard.setAttribute('data-exhibition-type', randomType);

                // 전시회 유형 뱃지 업데이트
                const typeElement = clonedCard.querySelector('.exhibition-type');
                if (typeElement) {
                    typeElement.className = `exhibition-type ${randomType}`;
                    typeElement.textContent = randomType === 'regular' ? '정기' : '특별';
                }

                // 약간의 변형 추가 (데모용)
                const titleElement = clonedCard.querySelector('.exhibition-title');
                if (titleElement) {
                    titleElement.textContent = `${titleElement.textContent} (추가)`;
                }

                // 애니메이션 효과를 위한 초기 스타일
                clonedCard.style.opacity = '0';
                clonedCard.style.transform = 'translateY(20px)';

                // 컨테이너에 추가
                exhibitionsContainer.appendChild(clonedCard);

                // 애니메이션 효과
                setTimeout(() => {
                    clonedCard.style.opacity = '1';
                    clonedCard.style.transform = 'translateY(0)';
                }, 100 * i);

                // 클릭 이벤트 다시 바인딩 (모달 등)
                clonedCard.addEventListener('click', function () {
                    const event = new CustomEvent('exhibition:selected', {
                        detail: { id: newId }
                    });
                    document.dispatchEvent(event);
                });
            }

            // 더 불러올 항목이 있는지 확인
            const totalLoaded = paginationState.currentPage * paginationState.itemsPerPage;
            paginationState.hasMore = totalLoaded < paginationState.totalItems;
        }

        // 로딩 상태 해제
        paginationState.isLoading = false;
        updateLoadingIndicator();

    }, 800); // 로딩 시뮬레이션을 위한 지연
}

/**
 * 로딩 인디케이터 업데이트
 */
function updateLoadingIndicator() {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = paginationState.isLoading ? 'flex' : 'none';
    }
}

/**
 * 페이지네이션 상태 초기화
 */
export function resetPagination() {
    paginationState.currentPage = 1;
    paginationState.hasMore = true;
    paginationState.isLoading = false;
    updateLoadingIndicator();
}
