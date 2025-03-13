/**
 * 작품 목록 페이지 진입점
 * 각 모듈을 초기화하고 통합합니다.
 */
import { initFilter } from './filter.js';
import { initGallery } from './gallery.js';
import { initSearch } from './search.js';
import { initPagination } from './pagination.js';
import { initCarousel } from './carousel.js';
import { initViewToggle } from './viewToggle.js';
import { fadeIn } from '/js/artwork/common/util.js';
import { animateButtonClick } from '/js/artwork/common/animation.js';

document.addEventListener('DOMContentLoaded', function () {
    // 모듈 초기화
    initCarousel();
    initFilter();
    initGallery();
    initSearch(); // 검색 모듈 초기화
    initPagination();
    initViewToggle();

    // 페이지 로딩 애니메이션
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        fadeIn(mainContent);
    }

    // 상세 검색 토글 버튼 직접 초기화 (중복 초기화 방지)
    const advancedSearchToggle = document.getElementById('advancedSearchToggle');
    const advancedSearchPanel = document.getElementById('advancedSearchPanel');

    if (advancedSearchToggle && advancedSearchPanel) {
        // 초기 상태 설정
        advancedSearchPanel.style.display = 'none';
        let isOpen = false;

        // 클릭 이벤트 리스너 추가
        advancedSearchToggle.addEventListener('click', function (e) {
            e.preventDefault();

            isOpen = !isOpen;

            // 버튼 active 클래스 토글
            if (isOpen) {
                advancedSearchToggle.classList.add('active');
            } else {
                advancedSearchToggle.classList.remove('active');
            }

            // 아이콘 회전
            const icon = advancedSearchToggle.querySelector('.toggle-icon');
            if (icon) {
                icon.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
                icon.style.transition = 'transform 0.3s ease';
            }

            // 패널 표시/숨김
            if (isOpen) {
                // 패널 표시
                advancedSearchPanel.style.display = 'block';

                // 약간의 지연 후 애니메이션 적용 (브라우저 렌더링 시간 확보)
                setTimeout(() => {
                    advancedSearchPanel.classList.add('active');
                    advancedSearchPanel.style.opacity = '1';
                    advancedSearchPanel.style.transform = 'translateY(0)';
                    advancedSearchPanel.style.visibility = 'visible';
                    advancedSearchPanel.style.maxHeight = '1000px';
                    advancedSearchPanel.style.marginTop = '20px';
                    advancedSearchPanel.style.marginBottom = '30px';
                }, 10);
            } else {
                // 패널 숨김 애니메이션
                advancedSearchPanel.classList.remove('active');
                advancedSearchPanel.style.opacity = '0';
                advancedSearchPanel.style.transform = 'translateY(-10px)';
                advancedSearchPanel.style.visibility = 'hidden';
                advancedSearchPanel.style.maxHeight = '0';
                advancedSearchPanel.style.marginTop = '0';
                advancedSearchPanel.style.marginBottom = '0';

                // 트랜지션 완료 후 display 속성 변경
                setTimeout(() => {
                    if (!isOpen) {
                        advancedSearchPanel.style.display = 'none';
                    }
                }, 600);
            }

            // 버튼 클릭 애니메이션
            animateButtonClick(advancedSearchToggle);
        });
    }
});

export { initCarousel, initFilter, initGallery, initSearch, initPagination, initViewToggle };
