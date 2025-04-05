/**
 * 작품 목록 페이지
 * 작품 목록의 모든 기능을 처리합니다.
 */
import ArtworkAPI from '../../api/ArtworkAPI.js';
import { emptyArtworkTemplate, errorMessageTemplate, loadingSpinnerTemplate } from '../../templates/emptyArtworkTemplate.js';
import { modalTemplate, artworkModalContent } from '../../templates/modalTemplate.js';
import { initModal, showModal, closeModal, updateModalContent } from '../../common/modal.js';
import Pagination from '../../common/pagination.js';
import { createArtworkCard } from '../../common/util/card.js';

// 전역 URL 파라미터
const urlParams = new URLSearchParams(window.location.search);

// API 함수 - 서버에서 가져오기
async function fetchArtworkList(pagination, filters = {}) {
    return await ArtworkAPI.getArtworkList(pagination, filters);
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
    const totalCountElement = document.querySelector('.card--all .card__meta strong');
    const carouselTrack = document.querySelector('.carousel-track');

    try {
        showLoading(true);

        const pagination = new Pagination({
            page: parseInt(urlParams.get('page')) || 1,
            limit: parseInt(urlParams.get('limit')) || 12,
            sortField: urlParams.get('sortField') || 'createdAt',
            sortOrder: urlParams.get('sortOrder') || 'desc'
        });

        const filters = {
            searchType: urlParams.get('searchType') || '',
            keyword: urlParams.get('keyword') || '',
            exhibition: urlParams.get('exhibition') || ''
        };

        const response = await fetchArtworkList(pagination, filters);

        if (!response || !response.success) {
            throw new Error(response?.error || '작품 목록을 불러오는데 실패했습니다.');
        }

        const data = response.data;
        const artworks = Array.isArray(data) ? data : (data.items || []);

        // 총 작품 수 업데이트
        if (totalCountElement) {
            totalCountElement.textContent = data.total || artworks.length;
        }
        if (resultCount) {
            resultCount.innerHTML = `총 <strong>${data.total || artworks.length}</strong>개의 작품이 검색되었습니다.`;
        }

        // 작품 목록 표시
        if (artworks.length > 0) {
            const cardFragment = document.createDocumentFragment();
            const tableFragment = document.createDocumentFragment();

            artworks.forEach(artwork => {
                if (cardView) {
                    const card = createArtworkCard(artwork, { type: 'list' });
                    cardFragment.appendChild(card);
                }
                if (tableViewBody) {
                    tableFragment.appendChild(createArtworkTableRow(artwork));
                }
            });

            if (cardView) {
                cardView.innerHTML = '';
                cardView.appendChild(cardFragment);
            }
            if (tableViewBody) {
                tableViewBody.innerHTML = '';
                tableViewBody.appendChild(tableFragment);
            }
        } else {
            if (cardView) {
                cardView.innerHTML = emptyArtworkTemplate;
            }
            if (tableViewBody) {
                const emptyRow = document.createElement('tr');
                emptyRow.innerHTML = '<td colspan="6" class="no-results">검색 결과가 없습니다.</td>';
                tableViewBody.innerHTML = '';
                tableViewBody.appendChild(emptyRow);
            }
        }

        // 전시회 카드 추가
        if (carouselTrack && data.exhibitions) {
            const exhibitionCards = data.exhibitions.map(exhibition => `
                <div class="carousel-slide" data-exhibition="${exhibition.id || ''}">
                    <div class="card card--carousel">
                        <div class="card__image-container">
                            <img src="${exhibition.image || '/images/exhibition-placeholder.svg'}"
                                alt="${exhibition.title || ''}" class="card__image"
                                onerror="this.onerror=null; this.src='/images/exhibition-placeholder.svg';">
                        </div>
                        <div class="card__info">
                            <h3 class="card__title">${exhibition.title || ''}</h3>
                            ${exhibition.subtitle ? `<p class="card__subtitle">${exhibition.subtitle}</p>` : ''}
                            <div class="card__meta">
                                <p class="card__date">
                                    ${exhibition.startDate ? new Date(exhibition.startDate).toLocaleDateString() : ''}
                                    ~
                                    ${exhibition.endDate ? new Date(exhibition.endDate).toLocaleDateString() : ''}
                                </p>
                                <p class="card__location">${exhibition.location || ''}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');

            carouselTrack.innerHTML += exhibitionCards;
            initializeCarousel();
        }

    } catch (error) {
        console.error('작품 목록을 로드하는 중 오류 발생:', error);
        showErrorMessage(error.message || '작품 목록을 불러오는 중 오류가 발생했습니다.');

        if (cardView) {
            cardView.innerHTML = errorMessageTemplate;
        }
    } finally {
        showLoading(false);
    }
}

// 테이블 행 생성 함수
function createArtworkTableRow(artwork) {
    const row = document.createElement('tr');

    // 이미지 셀
    const imageCell = document.createElement('td');
    const imageContainer = document.createElement('div');
    imageContainer.className = 'table-image-container';

    const image = document.createElement('img');
    image.src = artwork.image || '/images/artwork-placeholder.svg';
    image.alt = artwork.title || '';
    image.className = 'table-image';
    image.loading = 'lazy'; // 이미지 지연 로딩 추가
    image.onerror = function () {
        this.onerror = null;
        this.src = '/images/artwork-placeholder.svg';
    };

    imageContainer.appendChild(image);
    imageCell.appendChild(imageContainer);
    row.appendChild(imageCell);

    // 제목 셀
    const titleCell = document.createElement('td');
    const titleLink = document.createElement('a');
    titleLink.href = `/artwork/${artwork.id}`;
    titleLink.textContent = artwork.title || '제목 없음';
    titleCell.appendChild(titleLink);
    row.appendChild(titleCell);

    // 작가 셀
    const artistCell = document.createElement('td');
    artistCell.textContent = artwork.artistName || '작가 미상';
    row.appendChild(artistCell);

    // 학과 셀
    const departmentCell = document.createElement('td');
    departmentCell.textContent = artwork.department || '';
    row.appendChild(departmentCell);

    // 전시회 셀
    const exhibitionCell = document.createElement('td');
    exhibitionCell.textContent = artwork.exhibitionTitle || '';
    row.appendChild(exhibitionCell);

    return row;
}
