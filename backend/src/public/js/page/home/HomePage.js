/**
 * 메인 페이지 스크립트
 *
 * 이 파일은 메인 페이지의 모든 인터랙션을 관리합니다.
 * - 작품 모달 기능
 * - 주요 작품 데이터 로딩 및 표시
 * - 주요 전시회 슬라이드 기능
 */
import ArtworkApi from '../../api/ArtworkApi.js';
import ExhibitionApi from '../../api/ExhibitionApi.js';
import {
    emptyArtworkTemplate,
    errorMessageTemplate,
    loadingSpinnerTemplate
} from '../../templates/emptyArtworkTemplate.js';
import { modalTemplate, artworkModalContent } from '../../templates/modalTemplate.js';
import { initModal, showModal, updateModalContent } from '../../common/modal.js';
import { createArtworkCard } from '../../common/util/card.js';
import { showErrorMessage } from '../../common/util/notification.js';

// 전역 변수 선언
let featuredArtworks = [];
let featuredExhibitions = [];
let currentSlide = 0;
let slideInterval;

// 모달 초기화
function initArtworkModal() {
    // 모달 HTML 추가
    const modalHTML = modalTemplate('artwork-modal', artworkModalContent);
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // 모달 초기화
    initModal('artwork-modal');
}

// 작품 모달 표시
function showArtworkModal(artwork) {
    // 모달 내용 업데이트
    updateModalContent('artwork-modal', {
        'modal-image': artwork.imageUrl || '/images/artwork-placeholder.svg',
        'modal-title': artwork.title || '제목 없음',
        'modal-artist': artwork.artistName || '작가 미상',
        'modal-affiliation': artwork.artistAffiliation || '',
        'modal-exhibition': artwork.RepresentativeExhibitionTitle || '출품 전시회 없음',
        'modal-link': `/artwork/${artwork.slug}`
    });

    // 모달 표시
    showModal('artwork-modal');
}

// DOMContentLoaded 이벤트 리스너 제거하고 직접 실행
initArtworkModal();
loadFeaturedExhibitions();
loadFeaturedArtworks();

/**
 * 주요 전시회 데이터를 불러와 슬라이드를 생성합니다.
 */
async function loadFeaturedExhibitions() {
    try {
        const container = document.getElementById('featured-exhibitions-slider');
        if (!container) return;

        // 로딩 표시
        container.innerHTML = `<div class="hero-slide hero-slide--loading">
            <div class="idx-hero__content">
                <div class="loading-spinner"></div>
                <p>로딩 중...</p>
            </div>
        </div>`;

        // API 요청
        const response = await ExhibitionApi.getFeaturedExhibitions();

        if (!response.success) {
            throw new Error(response.error || '주요 전시회를 불러오는데 실패했습니다.');
        }

        const exhibitions = response.data;

        // 전역 변수에 전시회 데이터 저장
        featuredExhibitions = exhibitions || [];

        // 슬라이드 생성
        createExhibitionSlides(featuredExhibitions);

        // 도트가 있을 때만 네비게이션 초기화
        if (featuredExhibitions.length > 0) {
            // 슬라이드 네비게이션 초기화
            initSlideNavigation();

            // 자동 슬라이드 시작
            startSlideInterval();
        }
    } catch (error) {
        console.error('주요 전시회 로딩 중 오류:', error);
        const container = document.getElementById('featured-exhibitions-slider');
        if (container) {
            // 에러 발생 시 기본 슬라이드 표시
            const defaultSlideHTML = `
                <div class="hero-slide active">
                    <div class="hero-slide-bg" style="background-image: url('/images/hero_default.jpg')"></div>
                    <div class="idx-hero__content">
                        <h1>Welcome</h1>
                        <p>성균관대학교 미술동아리 갤러리에 오신 것을 환영합니다.</p>
                    </div>
                </div>
            `;
            container.innerHTML = defaultSlideHTML;
        }
    }
}

/**
 * 전시회 슬라이드를 생성합니다.
 */
function createExhibitionSlides(exhibitions) {
    const container = document.getElementById('featured-exhibitions-slider');
    const dotsContainer = document.getElementById('hero-slider-dots');

    if (!container || !dotsContainer) return;

    container.innerHTML = '';
    dotsContainer.innerHTML = '';

    // 전시회가 없을 경우 기본 슬라이드 표시
    if (!exhibitions || exhibitions.length === 0) {
        const defaultSlideHTML = `
            <div class="hero-slide active" data-index="0">
                <div class="hero-slide-bg" style="background-image: url('/images/hero_default.jpg')"></div>
                <div class="idx-hero__content">
                    <h1>Welcome</h1>
                    <p>성균관대학교 미술동아리 갤러리에 오신 것을 환영합니다.</p>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', defaultSlideHTML);
        return;
    }

    exhibitions.forEach((exhibition, index) => {
        // 각 전시회마다 슬라이드 생성
        const slideHTML = `
            <div class="hero-slide ${index === 0 ? 'active' : ''}" data-index="${index}" data-exhibition-id="${exhibition.id}">
                <div class="hero-slide-bg" style="background-image: url('${exhibition.imageUrl || '/images/hero_default.jpg'}')"></div>
                <div class="idx-hero__content">
                    <h1>${exhibition.title}</h1>
                    <p>${exhibition.location || ''}</p>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', slideHTML);

        // 네비게이션 도트 생성
        const dotHTML = `<span class="hero-slider-dot ${index === 0 ? 'active' : ''}" data-index="${index}"></span>`;
        dotsContainer.insertAdjacentHTML('beforeend', dotHTML);
    });

    // 슬라이드 클릭 이벤트 추가
    const slides = document.querySelectorAll('.hero-slide');
    slides.forEach(slide => {
        slide.addEventListener('click', () => {
            const exhibitionId = slide.dataset.exhibitionId;
            if (exhibitionId) {
                window.location.href = `/artwork?exhibition=${exhibitionId}&page=1`;
            }
        });
        // 커서 스타일 변경
        slide.style.cursor = 'pointer';
    });
}

/**
 * 슬라이드 네비게이션을 초기화합니다.
 */
function initSlideNavigation() {
    // 도트 버튼들
    const dots = document.querySelectorAll('.hero-slider-dot');
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const index = parseInt(dot.dataset.index);
            goToSlide(index);
        });
    });

    // 슬라이드 호버 시 자동 슬라이드 일시 중지
    const slider = document.getElementById('featured-exhibitions-slider');
    if (slider) {
        slider.addEventListener('mouseenter', () => {
            clearInterval(slideInterval);
        });

        slider.addEventListener('mouseleave', () => {
            startSlideInterval();
        });
    }
}

/**
 * 지정된 방향으로 슬라이드를 이동합니다.
 */
function navigateSlide(direction) {
    const totalSlides = featuredExhibitions.length;
    if (totalSlides <= 1) return;

    if (direction === 'next') {
        currentSlide = (currentSlide + 1) % totalSlides;
    } else {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    }

    goToSlide(currentSlide);
}

/**
 * 지정된 인덱스의 슬라이드로 이동합니다.
 */
function goToSlide(index) {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.hero-slider-dot');

    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
    });

    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });

    currentSlide = index;
}

/**
 * 자동 슬라이드 기능을 시작합니다.
 */
function startSlideInterval() {
    // 기존 인터벌 제거
    clearInterval(slideInterval);

    // 새 인터벌 시작 (5초마다)
    slideInterval = setInterval(() => {
        navigateSlide('next');
    }, 5000);
}

/**
 * 주요 작품 데이터를 불러와 카드를 생성합니다.
 */
async function loadFeaturedArtworks() {
    try {
        const container = document.getElementById('featured-artworks-container');
        if (!container) return;

        // 로딩 표시
        container.innerHTML = loadingSpinnerTemplate;

        // API 요청
        const response = await ArtworkApi.getFeaturedArtworks();

        if (!response.success) {
            throw new Error(response.error || '추천 작품을 불러오는데 실패했습니다.');
        }

        const artworks = response.data;
        if (artworks && artworks.length > 0) {
            // 전역 변수에 작품 데이터 저장 (모달에서 사용)
            featuredArtworks = artworks;
            const fragment = document.createDocumentFragment();
            artworks.forEach(artwork => {
                const card = createArtworkCard(artwork, { type: 'home' });
                fragment.appendChild(card);
            });

            container.innerHTML = '';
            container.appendChild(fragment);
            setupCardEvents();
        } else {
            container.innerHTML = emptyArtworkTemplate;
        }
    } catch (error) {
        console.error('추천 작품 로딩 중 오류:', error);
        const container = document.getElementById('featured-artworks-container');
        if (container) {
            container.innerHTML = errorMessageTemplate;
        }
        showErrorMessage(error.message || '추천 작품을 불러오는 중 오류가 발생했습니다.');
    }
}

function setupCardEvents() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const artworkId = card.dataset.artworkId;
            if (artworkId) {
                const artwork = featuredArtworks.find(item => item.id.toString() === artworkId);
                if (artwork) {
                    showArtworkModal(artwork);
                }
            }
        });
    });
}
