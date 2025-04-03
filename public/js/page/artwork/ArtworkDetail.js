/**
 * 작품 상세 페이지
 * 작품 상세 페이지의 모든 기능을 처리합니다.
 */

import ArtworkAPI from '../../api/ArtworkAPI.js';
import { showErrorMessage } from '../../common/util/notification.js';
import { createArtworkCard } from '../../common/util/card.js';
import { getArtworkId } from '../../common/util/url.js';

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

// 이미지 뷰어 관련 함수
function initImageViewer() {
    initStickyImageSection();
    initImageZoom();
}

function initStickyImageSection() {
    const imageSection = document.querySelector('.artwork-image-section');
    const infoSection = document.querySelector('.artwork-info-section');

    if (!imageSection || !infoSection) return;

    updateStickyPosition();

    window.addEventListener('scroll', updateStickyPosition);
    window.addEventListener('resize', updateStickyPosition);

    function updateStickyPosition() {
        const imageSectionHeight = imageSection.offsetHeight;
        const infoSectionHeight = infoSection.offsetHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (imageSectionHeight < infoSectionHeight) {
            if (scrollTop > 100) {
                imageSection.classList.add('sticky');

                const bottomLimit = infoSection.offsetTop + infoSectionHeight - imageSectionHeight - 40;
                if (scrollTop > bottomLimit) {
                    imageSection.classList.remove('sticky');
                    imageSection.classList.add('at-bottom');
                } else {
                    imageSection.classList.remove('at-bottom');
                }
            } else {
                imageSection.classList.remove('sticky');
                imageSection.classList.remove('at-bottom');
            }
        }
    }
}

function initImageZoom() {
    const artworkImage = document.querySelector('.artwork-main-image');
    const imageWrapper = document.querySelector('.artwork-image-wrapper');

    if (!artworkImage || !imageWrapper) return;

    let isZoomed = false;

    artworkImage.addEventListener('click', () => {
        if (isZoomed) {
            artworkImage.classList.remove('zoomed');
            imageWrapper.classList.remove('zoomed-wrapper');
        } else {
            artworkImage.classList.add('zoomed');
            imageWrapper.classList.add('zoomed-wrapper');
        }

        isZoomed = !isZoomed;
    });

    document.addEventListener('click', (e) => {
        if (isZoomed && e.target !== artworkImage) {
            artworkImage.classList.remove('zoomed');
            imageWrapper.classList.remove('zoomed-wrapper');
            isZoomed = false;
        }
    });

    artworkImage.addEventListener('click', (e) => {
        e.stopPropagation();
    });
}

// 관련 작품 관련 함수
function initRelatedArtworks() {
    const scrollContainer = document.querySelector('.related-artworks-list');
    const prevBtn = document.querySelector('.btn--scroll[aria-label="이전 작품"]');
    const nextBtn = document.querySelector('.btn--scroll[aria-label="다음 작품"]');

    if (!scrollContainer || !prevBtn || !nextBtn) return;

    prevBtn.addEventListener('click', () => {
        scrollContainer.scrollBy({ left: -340, behavior: 'smooth' });
        animateButtonClick(prevBtn);
        updateScrollButtons();
    });

    nextBtn.addEventListener('click', () => {
        scrollContainer.scrollBy({ left: 340, behavior: 'smooth' });
        animateButtonClick(nextBtn);
        updateScrollButtons();
    });

    scrollContainer.addEventListener('scroll', () => {
        updateScrollButtons();
    });

    updateScrollButtons();

    function updateScrollButtons() {
        const isAtStart = scrollContainer.scrollLeft <= 10;
        const isAtEnd = scrollContainer.scrollLeft + scrollContainer.offsetWidth >= scrollContainer.scrollWidth - 10;

        prevBtn.style.opacity = isAtStart ? '0.5' : '1';
        prevBtn.disabled = isAtStart;
        nextBtn.style.opacity = isAtEnd ? '0.5' : '1';
        nextBtn.disabled = isAtEnd;
    }
}

// 페이지 초기화 - DOMContentLoaded 제거하고 즉시 실행
initPage();

async function initPage() {
    try {
        await loadArtworkDetail();
        initImageViewer();
        initRelatedArtworks();
    } catch (error) {
        console.error('페이지 초기화 중 오류:', error);
        showErrorMessage('작품 정보를 불러오는데 실패했습니다.');
    }
}

// 작품 상세 정보 로드
async function loadArtworkDetail() {
    try {
        const artworkId = getArtworkId();
        console.log('작품 ID:', artworkId);

        if (!artworkId) {
            throw new Error('작품 ID를 찾을 수 없습니다.');
        }

        const response = await ArtworkAPI.getDetail(artworkId);
        console.log('API 응답:', response);

        if (!response || !response.success || !response.data) {
            throw new Error('작품 정보를 불러오는데 실패했습니다.');
        }

        const artwork = response.data;
        updateArtworkDetail(artwork);
        await loadRelatedArtworks(artwork);
    } catch (error) {
        console.error('작품 정보 로드 중 오류:', error);
        showErrorMessage('작품 정보를 불러오는데 실패했습니다.');
        throw error;
    }
}

// 작품 상세 정보 업데이트
function updateArtworkDetail(artwork) {
    // 이미지 업데이트
    const artworkImage = document.querySelector('.artwork-main-image');
    if (artworkImage) {
        artworkImage.src = artwork.image || '/images/artwork-placeholder.svg';
        artworkImage.alt = artwork.title;
    }

    // 제목 및 기본 정보 업데이트
    document.querySelector('.artwork-detail-title').textContent = artwork.title || '제목 없음';
    document.querySelector('.artwork-detail-artist').textContent = artwork.artist || '작가 미상';
    document.querySelector('.artwork-detail-department').textContent = artwork.department || '';

    // 상세 정보 업데이트
    document.querySelector('.value.year').textContent = artwork.year || '미표기';
    document.querySelector('.value.medium').textContent = artwork.medium || '미표기';
    document.querySelector('.value.size').textContent = artwork.size || '미표기';
    document.querySelector('.artwork-description').textContent = artwork.description || '작품에 대한 설명이 없습니다.';
    document.querySelector('.exhibition-info').textContent = artwork.exhibition || '없음';

    // 페이지 타이틀 업데이트
    document.title = `${artwork.title} - 성미회`;
}

// 관련 작품 로드
async function loadRelatedArtworks(artwork) {
    try {
        const response = await ArtworkAPI.getList({
            page: 1,
            size: 6,
            excludeId: artwork.id,
            department: artwork.department
        });

        if (!response.success || !response.data) {
            throw new Error('관련 작품을 불러오는데 실패했습니다.');
        }

        const relatedArtworks = response.data.items;
        updateRelatedArtworks(relatedArtworks);
    } catch (error) {
        console.error('관련 작품 로드 중 오류:', error);
        showErrorMessage('관련 작품을 불러오는데 실패했습니다.');
    }
}

// 관련 작품 목록 업데이트
function updateRelatedArtworks(artworks) {
    const container = document.querySelector('.related-artworks-list');
    if (!container) return;

    if (!artworks || artworks.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-image"></i>
                <p>관련된 다른 작품이 없습니다.</p>
            </div>
        `;
        return;
    }

    const fragment = document.createDocumentFragment();
    artworks.forEach(artwork => {
        const card = createArtworkCard(artwork, { type: 'list' });
        if (card) {
            card.classList.add('card--related');
            fragment.appendChild(card);
        }
    });

    container.innerHTML = '';
    container.appendChild(fragment);
}
