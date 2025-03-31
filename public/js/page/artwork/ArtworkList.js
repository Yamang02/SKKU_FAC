/**
 * 작품 목록 페이지
 * 작품 목록의 모든 기능을 처리합니다.
 */
import ArtworkAPI from '../../api/ArtworkAPI';

// API 함수 - 서버에서 가져오기
async function fetchArtworkList(params = {}) {
    return await ArtworkAPI.getList(params);
}

// 유틸리티 함수
function showLoading(isShow) {
    // 로딩 표시 로직 구현
    const loadingEl = document.querySelector('.loading-artwork');
    if (loadingEl) {
        loadingEl.style.display = isShow ? 'flex' : 'none';
    }
}

function showErrorMessage(message) {
    console.error(message);
    // 오류 메시지 표시 로직 구현
}

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

    // URL 파라미터에 전시회 필터 적용
    const urlParams = new URLSearchParams(window.location.search);

    if (exhibition === 'all') {
        urlParams.delete('exhibition');
    } else {
        urlParams.set('exhibition', exhibition);
    }

    // 검색 필드가 있다면 URL에 유지
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        const keyword = searchForm.querySelector('#keyword').value;
        if (keyword) {
            urlParams.set('keyword', keyword);
        }
    }

    // URL 업데이트 (페이지 리로드 없이)
    const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
}

// 페이지 초기화
document.addEventListener('DOMContentLoaded', () => {
    initCarousel();
    initViewToggle();
    loadArtworkList(); // 작품 목록 로딩
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

/**
 * 작품 목록을 로드하고 표시합니다.
 */
async function loadArtworkList() {
    const cardView = document.getElementById('cardView');
    const tableViewBody = document.getElementById('tableViewBody');
    const resultCount = document.getElementById('resultCount');

    try {
        // 현재 URL에서 쿼리 파라미터 가져오기
        const urlParams = new URLSearchParams(window.location.search);
        const params = {
            page: urlParams.get('page') || 1,
            limit: urlParams.get('limit') || 12,
            sortField: urlParams.get('sortField') || 'createdAt',
            sortOrder: urlParams.get('sortOrder') || 'desc',
            searchType: urlParams.get('searchType') || '',
            keyword: urlParams.get('keyword') || '',
            exhibition: urlParams.get('exhibition') || ''
        };

        // API 호출
        const data = await fetchArtworkList(params);

        // 카드 뷰 업데이트
        if (cardView) {
            cardView.innerHTML = ''; // 기존 내용 비우기

            if (data.items && data.items.length > 0) {
                // 각 작품에 대한 카드 생성
                data.items.forEach(artwork => {
                    const card = createArtworkCard(artwork);
                    cardView.appendChild(card);
                });
            } else {
                // 결과가 없는 경우
                cardView.innerHTML = '<div class="no-results"><p>검색 결과가 없습니다.</p></div>';
            }
        }

        // 테이블 뷰 업데이트
        if (tableViewBody) {
            tableViewBody.innerHTML = ''; // 기존 내용 비우기

            if (data.items && data.items.length > 0) {
                // 각 작품에 대한 테이블 행 생성
                data.items.forEach(artwork => {
                    const row = createArtworkTableRow(artwork);
                    tableViewBody.appendChild(row);
                });
            } else {
                // 결과가 없는 경우
                const emptyRow = document.createElement('tr');
                emptyRow.innerHTML = '<td colspan="6" class="no-results">검색 결과가 없습니다.</td>';
                tableViewBody.appendChild(emptyRow);
            }
        }

        // 결과 개수 표시 업데이트
        if (resultCount) {
            resultCount.innerHTML = `총 <strong>${data.total}</strong>개의 작품이 검색되었습니다.`;
        }
    } catch (error) {
        console.error('작품 목록을 로드하는 중 오류 발생:', error);

        // 오류 메시지 표시
        if (cardView) {
            cardView.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>작품 목록을 불러오는 중 오류가 발생했습니다.</p>
                </div>
            `;
        }
    }
}

/**
 * 작품 데이터로 카드 요소를 생성합니다.
 * @param {Object} artwork - 작품 데이터
 * @returns {HTMLElement} 생성된 카드 요소
 */
function createArtworkCard(artwork) {
    const card = document.createElement('div');
    card.className = 'card card--list';
    card.dataset.exhibition = artwork.exhibitionId || '';

    let artistName = '작가 미상';
    let artistDept = '';

    if (artwork.artist) {
        if (typeof artwork.artist === 'string') {
            artistName = artwork.artist;
        } else if (artwork.artist.name) {
            artistName = artwork.artist.name;
            artistDept = artwork.artist.department || '';
        }
    }

    // 이미지 경로 처리
    let imagePath = '/images/artwork-placeholder.svg';
    let imageAlt = artwork.title || '';

    if (artwork.image) {
        if (typeof artwork.image === 'string') {
            imagePath = artwork.image;
        } else if (artwork.image.path) {
            imagePath = artwork.image.path;
            imageAlt = artwork.image.alt || artwork.title || '';
        }
    }

    card.innerHTML = `
        <a href="/artwork/${artwork.id}" class="card__link">
            <div class="card__image-container">
                <img src="${imagePath}"
                     alt="${imageAlt}"
                     class="card__image"
                     onerror="this.onerror=null; this.src='/images/artwork-placeholder.svg';">
            </div>
            <div class="card__info">
                <h3 class="card__title">${artwork.title || ''}</h3>
                <p class="card__subtitle">${artistName}</p>
                <div class="card__meta">${artistDept}</div>
            </div>
        </a>
    `;

    return card;
}

/**
 * 작품 데이터로 테이블 행 요소를 생성합니다.
 * @param {Object} artwork - 작품 데이터
 * @returns {HTMLElement} 생성된 테이블 행 요소
 */
function createArtworkTableRow(artwork) {
    const row = document.createElement('tr');
    row.dataset.id = artwork.id || '';
    row.onclick = function () {
        window.location.href = `/artwork/${artwork.id}`;
    };

    let artistName = '작가 미상';
    let artistDept = '';

    if (artwork.artist) {
        if (typeof artwork.artist === 'string') {
            artistName = artwork.artist;
        } else if (artwork.artist.name) {
            artistName = artwork.artist.name;
            artistDept = artwork.artist.department || '';
        }
    }

    // 이미지 경로 처리
    let imagePath = '/images/artwork-placeholder.svg';
    let imageAlt = artwork.title || '';

    if (artwork.image) {
        if (typeof artwork.image === 'string') {
            imagePath = artwork.image;
        } else if (artwork.image.path) {
            imagePath = artwork.image.path;
            imageAlt = artwork.image.alt || artwork.title || '';
        }
    }

    row.innerHTML = `
        <td>
            <img src="${imagePath}"
                 alt="${imageAlt}"
                 class="artwork-thumbnail"
                 onerror="this.onerror=null; this.src='/images/artwork-placeholder.svg';">
        </td>
        <td>${artwork.title || ''}</td>
        <td>${artistName}</td>
        <td>${artistDept}</td>
        <td>${artwork.exhibition || ''}</td>
        <td>${artwork.year || ''}</td>
    `;

    return row;
}
