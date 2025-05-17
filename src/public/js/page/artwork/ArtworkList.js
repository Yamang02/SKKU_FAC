/**
 * 작품 목록 페이지
 * 작품 목록의 모든 기능을 처리합니다.
 */
import ArtworkApi from '../../api/ArtworkApi.js';
import ExhibitionApi from '../../api/ExhibitionApi.js';
import { emptyArtworkTemplate, errorMessageTemplate } from '../../templates/emptyArtworkTemplate.js';
import { initModal } from '../../common/modal.js';
import Pagination from '../../common/pagination.js';
import { createArtworkCard, createExhibitionCarouselCard } from '../../common/util/card.js';
import { createArtworkTable } from '../../common/util/table.js';
import { showErrorMessage } from '../../common/util/notification.js';

// 전역 URL 파라미터
const urlParams = new URLSearchParams(window.location.search);

// API 함수 - 서버에서 가져오기
async function fetchArtworkList(pagination, filters = {}) {
    return await ArtworkApi.getArtworkList(pagination, filters);
}

async function fetchExhibitionList() {
    try {

        // 캐러셀용 전시회는 제한 없이 모두 가져오기 위해 특별 파라미터 전달
        const response = await ExhibitionApi.getExhibitionList({
            limit: 100, // 충분히 많은 수의 전시회를 가져오기 위한 값
            page: 1,
            sort: 'date-desc' // 최신 전시회부터 정렬
        });


        // API 응답 구조 확인
        if (!response || !response.items) {
            console.error('유효하지 않은 API 응답 구조:', response);
        } else if (response.items.length === 0) {
            console.warn('전시회 데이터가 비어 있습니다.');
        }

        return response;
    } catch (error) {
        console.error('Error fetching exhibition list:', error);
        showErrorMessage('전시회 목록을 불러오는데 실패했습니다.');
        return null;
    }
}

// 전시회 캐러셀 업데이트
async function updateExhibitionCarousel() {
    const carouselTrack = document.querySelector('.carousel-track');
    if (!carouselTrack) return;

    try {
        const exhibitionData = await fetchExhibitionList();

        // 새로운 API 응답 구조 처리
        if (!exhibitionData) {
            console.error('전시회 데이터를 불러오는데 실패했습니다.');
            return;
        }

        const exhibitions = exhibitionData.items || [];

        if (exhibitions.length === 0) {
            console.warn('표시할 전시회가 없습니다.');
            return;
        }

        // 기존의 "모든 작품" 슬라이드를 제외한 다른 슬라이드 제거
        const existingSlides = carouselTrack.querySelectorAll('.carousel-slide:not([data-exhibition="all"])');
        existingSlides.forEach(slide => slide.remove());

        // 전시회 카드 생성
        const exhibitionFragment = document.createDocumentFragment();

        exhibitions.forEach((exhibition, index) => {
            if (!exhibition || !exhibition.id) {
                console.warn(`유효하지 않은 전시회 데이터 (인덱스: ${index}):`, exhibition);
                return;
            }
            const exhibitionCard = createExhibitionCarouselCard(exhibition);
            exhibitionFragment.appendChild(exhibitionCard);
        });

        // 모든 작품 카드 다음에 전시회 카드들 추가
        carouselTrack.appendChild(exhibitionFragment);

        // 전시회 옵션 업데이트
        updateExhibitionOptions(exhibitions);

        // 캐러셀 초기화
        initCarousel();
    } catch (error) {
        console.error('Error updating exhibition carousel:', error);
        showErrorMessage('전시회 정보를 불러오는데 실패했습니다.');
    }
}

// 전시회 선택 옵션 업데이트
function updateExhibitionOptions(exhibitions) {
    const exhibitionSelect = document.getElementById('exhibition');
    if (!exhibitionSelect) return;

    // 기존 옵션 초기화 (첫 번째 옵션 제외)
    while (exhibitionSelect.options.length > 1) {
        exhibitionSelect.remove(1);
    }

    // 전시회가 없거나 배열이 아닌 경우 처리
    if (!exhibitions || !Array.isArray(exhibitions) || exhibitions.length === 0) {
        console.warn('유효한 전시회 데이터가 없습니다:', exhibitions);
        return;
    }

    // 옵션 추가
    exhibitions.forEach(exhibition => {
        if (!exhibition || !exhibition.id || !exhibition.title) return;

        const option = document.createElement('option');
        option.value = exhibition.id;
        option.textContent = exhibition.title;
        exhibitionSelect.appendChild(option);
    });
}

// 애니메이션 관련 함수
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

    if (!carouselTrack || !prevButton || !nextButton || slides.length === 0) {
        return;
    }

    function updateSlides() {
        slides.forEach((slide, index) => {
            // 모든 클래스 제거 후 새로 적용
            slide.classList.remove('active', 'prev-1', 'prev-2', 'prev-3', 'next-1', 'next-2', 'next-3');

            // 위치에 따라 클래스 적용
            const position = (index - currentIndex + slides.length) % slides.length;

            if (position === 0) {
                slide.classList.add('active');
            } else if (position === 1) {
                slide.classList.add('next-1');
            } else if (position === 2) {
                slide.classList.add('next-2');
            } else if (position === slides.length - 1) {
                slide.classList.add('prev-1');
            } else if (position === slides.length - 2) {
                slide.classList.add('prev-2');
            } else {
                slide.classList.add('next-3');
            }
        });

        // 캐러셀 버튼 상태 업데이트
        updateCarouselButtons();
    }

    prevButton.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        updateSlides();
        animateButtonClick(prevButton);

        // 현재 활성화된 슬라이드의 전시회 정보로 필터링
        const exhibition = slides[currentIndex].dataset.exhibition;
        filterArtworksByExhibition(exhibition);
    });

    nextButton.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % slides.length;
        updateSlides();
        animateButtonClick(nextButton);

        // 현재 활성화된 슬라이드의 전시회 정보로 필터링
        const exhibition = slides[currentIndex].dataset.exhibition;
        filterArtworksByExhibition(exhibition);
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

// 갤러리 필터링 관련 함수
function filterArtworksByExhibition(exhibition) {
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
        } else {
            urlParams.delete('keyword');
        }

        const year = searchForm.querySelector('#year').value;
        if (year) {
            urlParams.set('year', year);
        } else {
            urlParams.delete('year');
        }
    }

    // 페이지 정보 초기화
    urlParams.set('page', '1');

    // URL 업데이트 (페이지 리로드 없이)
    const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
    window.history.pushState({ path: newUrl }, '', newUrl);

    // 현재 active 상태인 캐러셀 슬라이드 확인
    updateActiveSlide(exhibition);

    // API로 작품 목록만 다시 로드
    loadArtworkList();
}

function updateActiveSlide(exhibition) {
    const slides = document.querySelectorAll('.carousel-slide');
    if (!slides.length) return;

    let activeIndex = 0;
    slides.forEach((slide, index) => {
        if (slide.dataset.exhibition === exhibition) {
            activeIndex = index;
        }
    });

    // 캐러셀 업데이트
    const carouselTrack = document.querySelector('.carousel-track');
    const prevButton = document.querySelector('.carousel-prev');
    const nextButton = document.querySelector('.carousel-next');

    if (carouselTrack && prevButton && nextButton) {
        slides.forEach((slide, index) => {
            // 모든 클래스 제거 후 새로 적용
            slide.classList.remove('active', 'prev-1', 'prev-2', 'prev-3', 'next-1', 'next-2', 'next-3');

            // 위치에 따라 클래스 적용
            const position = (index - activeIndex + slides.length) % slides.length;

            if (position === 0) {
                slide.classList.add('active');
            } else if (position === 1) {
                slide.classList.add('next-1');
            } else if (position === 2) {
                slide.classList.add('next-2');
            } else if (position === slides.length - 1) {
                slide.classList.add('prev-1');
            } else if (position === slides.length - 2) {
                slide.classList.add('prev-2');
            } else {
                slide.classList.add('next-3');
            }
        });

        // 캐러셀 버튼 상태 업데이트
        updateCarouselButtons();
    }
}

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

function initAdvancedSearch() {
    const advancedSearchToggle = document.getElementById('advancedSearchToggle');
    const advancedSearchPanel = document.getElementById('advancedSearchPanel');
    const searchForm = document.getElementById('searchForm');

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

    // 검색 폼 제출 시 페이지 정보를 초기화 (항상 1페이지부터 시작)
    if (searchForm) {
        searchForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // 폼 데이터를 URL 파라미터로 변환
            const formData = new FormData(this);
            for (const [key, value] of formData.entries()) {
                if (value) {
                    urlParams.set(key, value);
                } else {
                    urlParams.delete(key);
                }
            }

            // 페이지 파라미터 설정 (새로운 검색 시 항상 1페이지부터)
            urlParams.set('page', '1');

            // URL 업데이트 (페이지 리로드 없이)
            const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
            window.history.pushState({ path: newUrl }, '', newUrl);

            // 전시회 필터가 있으면 캐러셀 슬라이드 업데이트
            const exhibition = urlParams.get('exhibition');
            if (exhibition) {
                updateActiveSlide(exhibition);
            } else {
                updateActiveSlide('all');
            }

            // API로 작품 목록만 다시 로드
            loadArtworkList();
        });

        // 초기화 버튼 클릭 시 처리
        const resetButton = searchForm.querySelector('button[type="reset"]');
        if (resetButton) {
            resetButton.addEventListener('click', function () {
                // 모든 URL 파라미터 초기화
                for (const key of [...urlParams.keys()]) {
                    urlParams.delete(key);
                }

                // 폼 필드 초기화
                searchForm.reset();

                // URL 업데이트 (페이지 리로드 없이)
                const newUrl = window.location.pathname;
                window.history.pushState({ path: newUrl }, '', newUrl);

                // 캐러셀 슬라이드 "모든 작품"으로 업데이트
                updateActiveSlide('all');

                // API로 작품 목록만 다시 로드
                loadArtworkList();
            });
        }
    }
}

// 페이지 초기화
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 전시회 캐러셀 업데이트
        await updateExhibitionCarousel();

        // 기존 초기화 함수들 호출
        initViewToggle();
        initPagination();
        initModal();
        initAdvancedSearch();

        // 초기 작품 목록 로드
        await loadArtworkList();
    } catch (error) {
        console.error('Error initializing page:', error);
        showErrorMessage('페이지 초기화 중 오류가 발생했습니다.');
    }
});

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
    const paginationContainer = document.getElementById('pagination');

    // 로딩 상태 표시
    if (cardView) {
        const loadingSpinner = document.createElement('div');
        loadingSpinner.className = 'loading-artwork';
        loadingSpinner.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
            </div>
        `;
        cardView.innerHTML = '';
        cardView.appendChild(loadingSpinner);
    }

    try {
        const pagination = new Pagination({
            page: parseInt(urlParams.get('page')) || 1,
            limit: parseInt(urlParams.get('limit')) || 12,
            sortField: urlParams.get('sortField') || 'createdAt',
            sortOrder: urlParams.get('sortOrder') || 'desc'
        });

        const filters = {
            keyword: urlParams.get('keyword') || '',
            exhibition: urlParams.get('exhibition') || '',
            year: urlParams.get('year') || ''
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

        // 페이지네이션 정보 설정
        if (data.pageInfo) {
            pagination.setPageInfo(data.pageInfo);
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
                    tableFragment.appendChild(createArtworkTable(artwork));
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

        // 페이지네이션 UI 렌더링
        if (paginationContainer) {
            pagination.renderUI(paginationContainer);

            // 페이지 변경 이벤트 리스너
            // 이벤트 리스너 중복 추가 방지를 위해 이전 리스너 제거
            const clonedPaginationContainer = paginationContainer.cloneNode(true);
            paginationContainer.parentNode.replaceChild(clonedPaginationContainer, paginationContainer);

            clonedPaginationContainer.addEventListener('pagination:change', async (e) => {
                const page = e.detail.page;
                // URL 파라미터 업데이트
                urlParams.set('page', page);

                // URL 업데이트 (페이지 리로드 없이)
                const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
                window.history.pushState({ path: newUrl }, '', newUrl);

                // 작품 목록 다시 로드
                await loadArtworkList();
            });
        }

    } catch (error) {
        console.error('작품 목록을 로드하는 중 오류 발생:', error);
        showErrorMessage(error.message || '작품 목록을 불러오는 중 오류가 발생했습니다.');

        if (cardView) {
            cardView.innerHTML = errorMessageTemplate;
        }

        // 오류 발생 시에도 페이지네이션 UI 초기화 (1페이지 표시)
        if (paginationContainer) {
            const defaultPagination = new Pagination({
                page: 1,
                limit: 12,
                pageInfo: {
                    currentPage: 1,
                    totalPages: 1,
                    hasPrev: false,
                    hasNext: false
                }
            });
            defaultPagination.renderUI(paginationContainer);
        }
    }
}
