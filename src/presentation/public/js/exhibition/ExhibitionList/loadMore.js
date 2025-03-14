/**
 * 전시 목록 페이지 - 무한 스크롤 모듈
 */

let currentPage = 1;
const maxPages = 3; // 최대 3페이지까지만 로드 (초기 + 2번의 추가 로드)
let isLoading = false; // 로딩 상태
let scrollTimeout = null; // 디바운싱을 위한 타임아웃

/**
 * 무한 스크롤 초기화
 */
export function initLoadMore() {
    window.addEventListener('scroll', debounceScroll);
}

/**
 * 스크롤 이벤트 디바운싱
 */
function debounceScroll() {
    if (scrollTimeout) {
        clearTimeout(scrollTimeout);
    }
    scrollTimeout = setTimeout(handleScroll, 100);
}

/**
 * 스크롤 이벤트 핸들러
 */
function handleScroll() {
    if (currentPage >= maxPages || isLoading) {
        // 최대 페이지에 도달했거나 로딩 중이면 중단
        if (currentPage >= maxPages) {
            window.removeEventListener('scroll', debounceScroll);
        }
        return;
    }

    const scrollHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const clientHeight = document.documentElement.clientHeight;

    if (scrollTop + clientHeight >= scrollHeight - 100) {
        loadMoreExhibitions();
    }
}

/**
 * 추가 전시회 로드
 */
function loadMoreExhibitions() {
    if (isLoading) return; // 이미 로딩 중이면 중단

    isLoading = true; // 로딩 시작
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) loadingIndicator.style.display = 'flex';

    // 현재 표시된 전시회들을 복제하여 추가
    setTimeout(() => {
        const container = document.getElementById('exhibitions-container');
        const exhibitions = container.querySelectorAll('.exhibition-card');

        // 현재 보이는 전시회만 복제
        const visibleExhibitions = Array.from(exhibitions).filter(
            exhibition => exhibition.style.display !== 'none'
        );

        visibleExhibitions.forEach(exhibition => {
            const clone = exhibition.cloneNode(true);
            container.appendChild(clone);
        });

        currentPage++;
        isLoading = false; // 로딩 완료

        if (loadingIndicator) loadingIndicator.style.display = 'none';

        // 최대 페이지에 도달하면 스크롤 이벤트 제거
        if (currentPage >= maxPages) {
            window.removeEventListener('scroll', debounceScroll);
        }
    }, 1000);
}

/**
 * 페이지네이션 초기화
 */
export function resetPagination() {
    currentPage = 1;
    isLoading = false;
    // 스크롤 이벤트 다시 등록
    window.removeEventListener('scroll', debounceScroll);
    window.addEventListener('scroll', debounceScroll);
}
