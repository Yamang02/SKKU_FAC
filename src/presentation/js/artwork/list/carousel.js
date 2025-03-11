/**
 * 작품 목록 페이지 - 캐러셀 모듈
 * 전시회 캐러셀 기능을 처리합니다.
 */
import { filterArtworksByExhibition } from './gallery.js';
import { animateButtonClick, animateItemClick } from '../common/animation.js';

/**
 * 전시회 캐러셀 기능 초기화
 */
export function initCarousel() {
    const carouselTrack = document.querySelector('.carousel-track');
    const prevButton = document.querySelector('.carousel-prev');
    const nextButton = document.querySelector('.carousel-next');
    const exhibitionItems = document.querySelectorAll('.carousel-item');

    if (!carouselTrack || !prevButton || !nextButton) return;

    // 이전 버튼 클릭 이벤트
    prevButton.addEventListener('click', () => {
        const scrollAmount = carouselTrack.offsetWidth * 0.8;
        carouselTrack.scrollBy({
            left: -scrollAmount,
            behavior: 'smooth'
        });

        animateButtonClick(prevButton);
        updateScrollButtons();
    });

    // 다음 버튼 클릭 이벤트
    nextButton.addEventListener('click', () => {
        const scrollAmount = carouselTrack.offsetWidth * 0.8;
        carouselTrack.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });

        animateButtonClick(nextButton);
        updateScrollButtons();
    });

    // 스크롤 이벤트
    carouselTrack.addEventListener('scroll', () => {
        updateScrollButtons();
    });

    // 초기 버튼 상태 업데이트
    updateScrollButtons();

    // 전시회 아이템 클릭 이벤트 초기화
    initExhibitionItems(exhibitionItems);
}

/**
 * 스크롤 버튼 상태 업데이트
 */
function updateScrollButtons() {
    const carouselTrack = document.querySelector('.carousel-track');
    const prevButton = document.querySelector('.carousel-prev');
    const nextButton = document.querySelector('.carousel-next');

    if (!carouselTrack || !prevButton || !nextButton) return;

    // 왼쪽 끝에 도달했는지 확인
    const isAtStart = carouselTrack.scrollLeft <= 10;
    // 오른쪽 끝에 도달했는지 확인
    const isAtEnd = carouselTrack.scrollLeft + carouselTrack.offsetWidth >= carouselTrack.scrollWidth - 10;

    // 버튼 상태 업데이트
    prevButton.style.opacity = isAtStart ? '0.5' : '1';
    nextButton.style.opacity = isAtEnd ? '0.5' : '1';
}

/**
 * 전시회 아이템 클릭 이벤트 초기화
 */
function initExhibitionItems(exhibitionItems) {
    if (!exhibitionItems || exhibitionItems.length === 0) return;

    exhibitionItems.forEach(item => {
        item.addEventListener('click', () => {
            const exhibitionId = item.dataset.exhibitionId;

            // 활성화 상태 토글
            exhibitionItems.forEach(el => el.classList.remove('active'));
            item.classList.add('active');

            // 애니메이션 효과
            animateItemClick(item);

            // 작품 필터링
            filterArtworksByExhibition(exhibitionId);
        });
    });
}
