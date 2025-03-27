/**
 * 작품 목록 페이지
 * 작품 목록의 모든 기능을 처리합니다.
 */
// 애니메이션 관련 함수
function fadeIn(element, callback) {
    if (!element) return;
    element.style.display = '';
    element.classList.add('fade-in');
    requestAnimationFrame(() => {
        element.classList.add('show');
    });
    if (callback) {
        element.addEventListener('transitionend', function handler() {
            callback();
            element.removeEventListener('transitionend', handler);
        });
    }
}

function fadeOut(element, callback) {
    if (!element) return;
    if (element.style.display === 'none') {
        if (callback) callback();
        return;
    }
    element.classList.add('fade-out');
    requestAnimationFrame(() => {
        element.classList.add('hide');
    });
    element.addEventListener('transitionend', function handler() {
        element.style.display = 'none';
        element.classList.remove('fade-out', 'hide');
        if (callback) callback();
        element.removeEventListener('transitionend', handler);
    });
}

function animateButtonClick(button) {
    if (!button) return;
    button.classList.add('clicked');
    setTimeout(() => {
        button.classList.remove('clicked');
    }, 200);
}

// 캐러셀 관련 함수
function initCarousel() {
    const carouselTrack = document.querySelector('.carousel-track');
    const prevButton = document.querySelector('.carousel-prev');
    const nextButton = document.querySelector('.carousel-next');
    const slides = document.querySelectorAll('.carousel-slide');
    let currentIndex = 0;

    if (!carouselTrack || !prevButton || !nextButton || slides.length === 0) return;

    function updateSlides() {
        slides.forEach((slide, index) => {
            slide.classList.remove('active', 'prev-1', 'prev-2', 'prev-3', 'next-1', 'next-2', 'next-3');

            const position = (index - currentIndex + slides.length) % slides.length;

            if (position === 0) slide.classList.add('active');
            else if (position === 1) slide.classList.add('next-1');
            else if (position === 2) slide.classList.add('next-2');
            else if (position === slides.length - 1) slide.classList.add('prev-1');
            else if (position === slides.length - 2) slide.classList.add('prev-2');
            else slide.classList.add('next-3');
        });
        updateCarouselButtons();
    }

    prevButton.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        updateSlides();
        animateButtonClick(prevButton);
    });

    nextButton.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % slides.length;
        updateSlides();
        animateButtonClick(nextButton);
    });

    carouselTrack.addEventListener('scroll', updateCarouselButtons);

    slides.forEach((slide, index) => {
        slide.addEventListener('click', () => {
            if (index !== currentIndex) {
                currentIndex = index;
                updateSlides();
            }
            const exhibition = slide.dataset.exhibition;
            filterArtworksByExhibition(exhibition);
            animateButtonClick(slide);
        });
    });

    // 초기 상태 설정
    updateSlides();
}

function updateCarouselButtons() {
    const carouselTrack = document.querySelector('.carousel-track');
    const prevButton = document.querySelector('.carousel-prev');
    const nextButton = document.querySelector('.carousel-next');

    if (!carouselTrack || !prevButton || !nextButton) return;

    const isAtStart = carouselTrack.scrollLeft <= 10;
    const isAtEnd = carouselTrack.scrollLeft + carouselTrack.offsetWidth >= carouselTrack.scrollWidth - 10;

    prevButton.style.opacity = isAtStart ? '0.5' : '1';
    nextButton.style.opacity = isAtEnd ? '0.5' : '1';
}

// 뷰 전환 관련 함수
function initViewToggle() {
    const cardViewBtn = document.getElementById('cardViewBtn');
    const tableViewBtn = document.getElementById('tableViewBtn');
    const cardView = document.getElementById('cardView');
    const tableView = document.getElementById('tableView');

    if (!cardViewBtn || !tableViewBtn || !cardView || !tableView) return;

    cardViewBtn.addEventListener('click', () => {
        cardViewBtn.classList.add('active');
        tableViewBtn.classList.remove('active');
        cardView.style.display = 'grid';
        tableView.style.display = 'none';
        animateButtonClick(cardViewBtn);
    });

    tableViewBtn.addEventListener('click', () => {
        tableViewBtn.classList.add('active');
        cardViewBtn.classList.remove('active');
        tableView.style.display = 'table';
        cardView.style.display = 'none';
        animateButtonClick(tableViewBtn);
    });
}

// 갤러리 필터링 관련 함수
function filterArtworksByExhibition(exhibition) {
    const artworks = document.querySelectorAll('.card.card--list');
    artworks.forEach(artwork => {
        const artworkExhibition = artwork.dataset.exhibition;
        if (exhibition === 'all' || artworkExhibition === exhibition) {
            fadeIn(artwork);
        } else {
            fadeOut(artwork);
        }
    });
}

// 페이지 초기화
document.addEventListener('DOMContentLoaded', () => {
    initCarousel();
    initViewToggle();
    initArtworkGrid();
    initFilters();
    initPagination();

    // 페이지 로딩 애니메이션
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        fadeIn(mainContent);
    }

    // 상세 검색 토글 초기화
    const advancedSearchToggle = document.getElementById('advancedSearchToggle');
    const advancedSearchPanel = document.getElementById('advancedSearchPanel');

    if (advancedSearchToggle && advancedSearchPanel) {
        let isOpen = false;

        advancedSearchToggle.addEventListener('click', function (e) {
            e.preventDefault();
            isOpen = !isOpen;

            // 버튼 상태 업데이트
            advancedSearchToggle.classList.toggle('active', isOpen);

            // 아이콘 회전
            const icon = advancedSearchToggle.querySelector('.toggle-icon');
            if (icon) {
                icon.classList.toggle('rotate', isOpen);
            }

            // 패널 상태 업데이트
            if (isOpen) {
                advancedSearchPanel.classList.remove('panel-closing');
                requestAnimationFrame(() => {
                    advancedSearchPanel.classList.add('panel-open');
                });
            } else {
                advancedSearchPanel.classList.remove('panel-open');
                advancedSearchPanel.classList.add('panel-closing');
            }

            animateButtonClick(advancedSearchToggle);
        });
    }
});

function initArtworkGrid() {
    // ... existing code ...
}

function initFilters() {
    // ... existing code ...
}

function initPagination() {
    const prevBtn = document.querySelector('.pagination-prev');
    const nextBtn = document.querySelector('.pagination-next');
    const scrollContainer = document.querySelector('.artwork-grid');

    if (!prevBtn || !nextBtn || !scrollContainer) return;

    // 페이지네이션 스크롤 버튼 상태 업데이트 및 이벤트 처리
    const updatePaginationButtons = () => {
        const isAtStart = scrollContainer.scrollLeft <= 10;
        const isAtEnd = scrollContainer.scrollLeft + scrollContainer.offsetWidth >= scrollContainer.scrollWidth - 10;

        prevBtn.style.opacity = isAtStart ? '0.5' : '1';
        prevBtn.disabled = isAtStart;
        nextBtn.style.opacity = isAtEnd ? '0.5' : '1';
        nextBtn.disabled = isAtEnd;
    };

    prevBtn.addEventListener('click', () => {
        scrollContainer.scrollBy({ left: -340, behavior: 'smooth' });
        updatePaginationButtons();
    });

    nextBtn.addEventListener('click', () => {
        scrollContainer.scrollBy({ left: 340, behavior: 'smooth' });
        updatePaginationButtons();
    });

    scrollContainer.addEventListener('scroll', updatePaginationButtons);
    updatePaginationButtons();
}
