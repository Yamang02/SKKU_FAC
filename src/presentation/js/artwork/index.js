/**
 * 작품 목록 페이지 스크립트
 * 카드 뷰와 테이블 뷰 전환, 검색 기능 등을 처리합니다.
 */
document.addEventListener('DOMContentLoaded', function () {
    // 요소 참조
    const carouselTrack = document.querySelector('.carousel-track');
    const prevButton = document.querySelector('.carousel-prev');
    const nextButton = document.querySelector('.carousel-next');
    const exhibitionItems = document.querySelectorAll('.exhibition-item');
    const advancedSearchToggle = document.getElementById('advancedSearchToggle');
    const advancedSearchPanel = document.getElementById('advancedSearchPanel');
    const cardViewBtn = document.getElementById('cardViewBtn');
    const tableViewBtn = document.getElementById('tableViewBtn');
    const cardView = document.getElementById('cardView');
    const tableView = document.getElementById('tableView');
    const searchForm = document.getElementById('searchForm');

    // 전시회 캐러셀 초기화
    initCarousel();

    // 상세 검색 토글 초기화
    initAdvancedSearchToggle();

    // 뷰 전환 초기화
    initViewToggle();

    // 전시회 아이템 클릭 이벤트 초기화
    initExhibitionItems();

    // 검색 폼 제출 이벤트 초기화
    initSearchForm();

    // 페이지네이션 초기화
    initPagination();

    /**
     * 전시회 캐러셀 기능 초기화
     */
    function initCarousel() {
        if (!carouselTrack || !prevButton || !nextButton) return;

        // 이전 버튼 클릭 이벤트
        prevButton.addEventListener('click', () => {
            const scrollAmount = carouselTrack.offsetWidth * 0.8;
            carouselTrack.scrollBy({
                left: -scrollAmount,
                behavior: 'smooth'
            });

            // 버튼 클릭 애니메이션
            animateButtonClick(prevButton);
        });

        // 다음 버튼 클릭 이벤트
        nextButton.addEventListener('click', () => {
            const scrollAmount = carouselTrack.offsetWidth * 0.8;
            carouselTrack.scrollBy({
                left: scrollAmount,
                behavior: 'smooth'
            });

            // 버튼 클릭 애니메이션
            animateButtonClick(nextButton);
        });

        // 스크롤 이벤트 감지하여 버튼 표시/숨김 처리
        carouselTrack.addEventListener('scroll', debounce(() => {
            updateScrollButtons();
        }, 100));

        // 초기 버튼 상태 설정
        updateScrollButtons();
    }

    /**
     * 스크롤 버튼 상태 업데이트
     */
    function updateScrollButtons() {
        if (!carouselTrack || !prevButton || !nextButton) return;

        const isAtStart = carouselTrack.scrollLeft <= 10;
        const isAtEnd = carouselTrack.scrollLeft + carouselTrack.offsetWidth >= carouselTrack.scrollWidth - 10;

        prevButton.style.opacity = isAtStart ? '0.5' : '1';
        prevButton.style.pointerEvents = isAtStart ? 'none' : 'auto';

        nextButton.style.opacity = isAtEnd ? '0.5' : '1';
        nextButton.style.pointerEvents = isAtEnd ? 'none' : 'auto';
    }

    /**
     * 상세 검색 토글 기능 초기화
     */
    function initAdvancedSearchToggle() {
        if (!advancedSearchToggle || !advancedSearchPanel) return;

        // URL 파라미터에서 검색 조건이 있는지 확인
        const urlParams = new URLSearchParams(window.location.search);
        const hasSearchParams = urlParams.has('keyword') || urlParams.has('exhibition') || urlParams.has('year');

        // 검색 조건이 있으면 패널 표시
        if (hasSearchParams) {
            advancedSearchPanel.classList.add('active');
            advancedSearchToggle.classList.add('active');
            const toggleIcon = advancedSearchToggle.querySelector('.toggle-icon');
            if (toggleIcon) {
                toggleIcon.classList.add('fa-chevron-up');
                toggleIcon.classList.remove('fa-chevron-down');
            }
        }

        // 토글 버튼 클릭 이벤트
        advancedSearchToggle.addEventListener('click', () => {
            advancedSearchPanel.classList.toggle('active');
            advancedSearchToggle.classList.toggle('active');

            // 토글 아이콘 변경
            const toggleIcon = advancedSearchToggle.querySelector('.toggle-icon');
            if (toggleIcon) {
                if (advancedSearchPanel.classList.contains('active')) {
                    toggleIcon.classList.add('fa-chevron-up');
                    toggleIcon.classList.remove('fa-chevron-down');
                } else {
                    toggleIcon.classList.add('fa-chevron-down');
                    toggleIcon.classList.remove('fa-chevron-up');
                }
            }

            // 버튼 클릭 애니메이션
            animateButtonClick(advancedSearchToggle);
        });
    }

    /**
     * 뷰 전환 기능 초기화
     */
    function initViewToggle() {
        if (!cardViewBtn || !tableViewBtn || !cardView || !tableView) return;

        cardViewBtn.addEventListener('click', () => {
            if (cardViewBtn.classList.contains('active')) return;

            cardViewBtn.classList.add('active');
            tableViewBtn.classList.remove('active');

            // 페이드 애니메이션으로 전환
            fadeOut(tableView, () => {
                tableView.style.display = 'none';
                cardView.style.display = 'grid';
                fadeIn(cardView);
            });

            // 로컬 스토리지에 선호하는 뷰 저장
            localStorage.setItem('preferredView', 'card');

            // 버튼 클릭 애니메이션
            animateButtonClick(cardViewBtn);
        });

        tableViewBtn.addEventListener('click', () => {
            if (tableViewBtn.classList.contains('active')) return;

            tableViewBtn.classList.add('active');
            cardViewBtn.classList.remove('active');

            // 페이드 애니메이션으로 전환
            fadeOut(cardView, () => {
                cardView.style.display = 'none';
                tableView.style.display = 'table';
                fadeIn(tableView);
            });

            // 로컬 스토리지에 선호하는 뷰 저장
            localStorage.setItem('preferredView', 'table');

            // 버튼 클릭 애니메이션
            animateButtonClick(tableViewBtn);
        });

        // 저장된 선호 뷰가 있으면 적용
        const preferredView = localStorage.getItem('preferredView');
        if (preferredView === 'table') {
            tableViewBtn.click();
        }
    }

    /**
     * 전시회 아이템 클릭 이벤트 초기화
     */
    function initExhibitionItems() {
        if (!exhibitionItems.length) return;

        exhibitionItems.forEach(item => {
            item.addEventListener('click', () => {
                // 이미 활성화된 아이템이면 무시
                if (item.classList.contains('active')) return;

                // 활성 상태 업데이트
                exhibitionItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');

                // 전시회 ID 가져오기
                const exhibitionId = item.dataset.exhibition;

                // 클릭 애니메이션
                animateItemClick(item);

                // 여기서 전시회 ID에 따라 작품 필터링 로직 구현
                filterArtworksByExhibition(exhibitionId);
            });
        });
    }

    /**
     * 전시회 ID에 따라 작품 필터링
     * @param {string} exhibitionId - 전시회 ID
     */
    function filterArtworksByExhibition(exhibitionId) {
        // 로딩 상태 표시
        showLoading(true);

        // 실제 구현에서는 서버에 요청을 보내거나 클라이언트 측에서 필터링
        // 예시 코드:
        if (exhibitionId === 'all') {
            // 모든 작품 표시
            document.getElementById('exhibition').value = '';
            // 폼 제출하여 모든 작품 가져오기
            if (searchForm) {
                setTimeout(() => {
                    searchForm.submit();
                }, 500); // 로딩 상태를 보여주기 위한 지연
            } else {
                showLoading(false);
            }
        } else {
            // 특정 전시회 작품만 표시
            document.getElementById('exhibition').value = exhibitionId;
            // 폼 제출하여 필터링된 작품 가져오기
            if (searchForm) {
                setTimeout(() => {
                    searchForm.submit();
                }, 500); // 로딩 상태를 보여주기 위한 지연
            } else {
                showLoading(false);
            }
        }
    }

    /**
     * 검색 폼 제출 이벤트 초기화
     */
    function initSearchForm() {
        if (!searchForm) return;

        // 폼 제출 이벤트
        searchForm.addEventListener('submit', function () {
            // 로딩 상태 표시
            showLoading(true);

            // 실제 구현에서는 이 부분을 제거하고 서버로 폼을 제출
            // 현재는 예시를 위해 기본 동작 방지
            // event.preventDefault();

            // 폼 데이터 수집
            const formData = new FormData(searchForm);
            const searchParams = {};

            for (const [key, value] of formData.entries()) {
                searchParams[key] = value;
            }
        });

        // 초기화 버튼 이벤트 - 폼 초기화만 수행하고 자동 검색은 하지 않음
        const resetButton = searchForm.querySelector('button[type="reset"]');
        if (resetButton) {
            // 기본 reset 이벤트를 방지하고 커스텀 동작 구현
            resetButton.addEventListener('click', function (event) {
                event.preventDefault(); // 기본 reset 동작 방지

                // 폼 필드 수동 초기화
                const inputs = searchForm.querySelectorAll('input, select');
                inputs.forEach(input => {
                    if (input.type === 'text') {
                        input.value = '';
                    } else if (input.type === 'select-one') {
                        input.selectedIndex = 0;
                    }
                });

                // 초기화 버튼 클릭 애니메이션
                animateButtonClick(resetButton);
            });
        }
    }

    /**
     * 페이지네이션 초기화
     */
    function initPagination() {
        const pagination = document.querySelector('.pagination');
        if (!pagination) return;

        // 페이지 버튼 이벤트 처리
        const pageButtons = pagination.querySelectorAll('.pagination__btn:not(.pagination__btn--prev):not(.pagination__btn--next)');

        pageButtons.forEach(button => {
            button.addEventListener('click', function (e) {
                // 이미 활성화된 버튼이면 무시
                if (this.classList.contains('pagination__btn--active') || this.classList.contains('pagination__btn--disabled')) {
                    e.preventDefault();
                    return;
                }

                // 버튼 클릭 애니메이션
                animateButtonClick(this);

                // 로딩 상태 표시
                showLoading(true);
            });
        });

        // 이전 페이지 버튼
        const prevPageBtn = pagination.querySelector('.pagination__btn--prev:not(.pagination__btn--disabled)');
        if (prevPageBtn) {
            prevPageBtn.addEventListener('click', function (e) {
                // 비활성화된 버튼이면 무시
                if (this.classList.contains('pagination__btn--disabled')) {
                    e.preventDefault();
                    return;
                }

                // 버튼 클릭 애니메이션
                animateButtonClick(this);

                // 로딩 상태 표시
                showLoading(true);
            });
        }

        // 다음 페이지 버튼
        const nextPageBtn = pagination.querySelector('.pagination__btn--next:not(.pagination__btn--disabled)');
        if (nextPageBtn) {
            nextPageBtn.addEventListener('click', function (e) {
                // 비활성화된 버튼이면 무시
                if (this.classList.contains('pagination__btn--disabled')) {
                    e.preventDefault();
                    return;
                }

                // 버튼 클릭 애니메이션
                animateButtonClick(this);

                // 로딩 상태 표시
                showLoading(true);
            });
        }
    }

    /**
     * 로딩 상태 표시/숨김
     * @param {boolean} show - 로딩 상태 표시 여부
     */
    function showLoading(show) {
        // 실제 구현에서는 로딩 인디케이터를 표시
        if (show) {
            // 로딩 인디케이터 표시 로직
            document.body.classList.add('loading');
        } else {
            // 로딩 인디케이터 숨김 로직
            document.body.classList.remove('loading');
        }
    }

    /**
     * 버튼 클릭 애니메이션
     * @param {HTMLElement} button - 애니메이션을 적용할 버튼
     */
    function animateButtonClick(button) {
        button.classList.add('btn--clicked');
        setTimeout(() => {
            button.classList.remove('btn--clicked');
        }, 300);
    }

    /**
     * 아이템 클릭 애니메이션
     * @param {HTMLElement} item - 애니메이션을 적용할 아이템
     */
    function animateItemClick(item) {
        item.classList.add('item-clicked');
        setTimeout(() => {
            item.classList.remove('item-clicked');
        }, 300);
    }

    /**
     * 요소 페이드 인 애니메이션
     * @param {HTMLElement} element - 페이드 인할 요소
     * @param {Function} callback - 애니메이션 완료 후 콜백
     */
    function fadeIn(element, callback) {
        element.style.opacity = 0;
        element.style.transition = 'opacity 0.3s ease';

        // 다음 프레임에서 opacity 변경
        requestAnimationFrame(() => {
            element.style.opacity = 1;
        });

        // 애니메이션 완료 후 콜백 실행
        if (callback) {
            setTimeout(callback, 300);
        }
    }

    /**
     * 요소 페이드 아웃 애니메이션
     * @param {HTMLElement} element - 페이드 아웃할 요소
     * @param {Function} callback - 애니메이션 완료 후 콜백
     */
    function fadeOut(element, callback) {
        element.style.opacity = 1;
        element.style.transition = 'opacity 0.3s ease';

        // 다음 프레임에서 opacity 변경
        requestAnimationFrame(() => {
            element.style.opacity = 0;
        });

        // 애니메이션 완료 후 콜백 실행
        if (callback) {
            setTimeout(callback, 300);
        }
    }

    /**
     * 디바운스 함수
     * @param {Function} func - 디바운스할 함수
     * @param {number} wait - 대기 시간(ms)
     * @returns {Function} 디바운스된 함수
     */
    function debounce(func, wait) {
        let timeout;
        return function () {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(context, args);
            }, wait);
        };
    }
});
