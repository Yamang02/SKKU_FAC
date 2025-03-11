/**
 * 작품 목록 페이지 - 검색 모듈
 * 작품 검색 기능을 처리합니다.
 */
import { updateGallery } from './gallery.js';
import { debounce, fadeIn, fadeOut } from '../common/util.js';

/**
 * 검색 기능 초기화
 */
export function initSearch() {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const advancedSearchToggle = document.getElementById('advancedSearchToggle');
    const advancedSearchPanel = document.getElementById('advancedSearchPanel');

    if (!searchInput || !searchButton) return;

    // 검색 입력 이벤트 (디바운스 적용)
    searchInput.addEventListener('input', debounce(() => {
        const searchTerm = searchInput.value.trim().toLowerCase();
        performSearch(searchTerm);
    }, 300));

    // 검색 버튼 클릭 이벤트
    searchButton.addEventListener('click', () => {
        const searchTerm = searchInput.value.trim().toLowerCase();
        performSearch(searchTerm);
    });

    // 엔터 키 이벤트
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const searchTerm = searchInput.value.trim().toLowerCase();
            performSearch(searchTerm);
        }
    });

    // URL 파라미터에서 검색어 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const keywordParam = urlParams.get('keyword');

    if (keywordParam) {
        searchInput.value = keywordParam;
        performSearch(keywordParam.toLowerCase());
    }

    // 상세 검색 토글 기능 초기화
    if (advancedSearchToggle && advancedSearchPanel) {
        initAdvancedSearchToggle(advancedSearchToggle, advancedSearchPanel);
    }
}

/**
 * 상세 검색 토글 기능 초기화
 * @param {HTMLElement} toggleButton - 토글 버튼 요소
 * @param {HTMLElement} panel - 패널 요소
 */
function initAdvancedSearchToggle(toggleButton, panel) {
    // 초기 상태 설정 (기본적으로 닫힘)
    panel.style.display = 'none';
    let isOpen = false;

    // 토글 버튼 클릭 이벤트
    toggleButton.addEventListener('click', () => {
        isOpen = !isOpen;

        // 아이콘 회전
        const icon = toggleButton.querySelector('.toggle-icon');
        if (icon) {
            icon.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
        }

        // 패널 표시/숨김
        if (isOpen) {
            panel.style.display = 'block';
            fadeIn(panel);
        } else {
            fadeOut(panel, () => {
                panel.style.display = 'none';
            });
        }
    });
}

/**
 * 검색 수행
 * @param {string} searchTerm - 검색어
 */
function performSearch(searchTerm) {
    // 갤러리 업데이트
    updateGallery({ search: searchTerm });

    // URL 파라미터 업데이트 (선택적)
    updateUrlParams(searchTerm);
}

/**
 * URL 파라미터 업데이트
 * @param {string} searchTerm - 검색어
 */
function updateUrlParams(searchTerm) {
    // 현재 URL 파라미터 가져오기
    const urlParams = new URLSearchParams(window.location.search);

    // 검색어 파라미터 설정
    if (searchTerm) {
        urlParams.set('keyword', searchTerm);
    } else {
        urlParams.delete('keyword');
    }

    // URL 업데이트 (페이지 새로고침 없이)
    const newUrl = `${window.location.pathname}${urlParams.toString() ? '?' + urlParams.toString() : ''}`;
    window.history.replaceState({}, '', newUrl);
}
