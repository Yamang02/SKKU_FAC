/**
 * 작품 목록 페이지 - 캐러셀 모듈
 * 전시회 캐러셀 기능을 처리합니다.
 */
import { filterArtworksByExhibition } from './gallery.js';
import { animateItemClick } from '/js/artwork/common/animation.js';

/**
 * 전시회 캐러셀 기능 초기화
 */
export function initCarousel() {
    const track = document.querySelector('.carousel-track');
    const slides = Array.from(document.querySelectorAll('.carousel-slide'));
    const nextButton = document.querySelector('.carousel-next');
    const prevButton = document.querySelector('.carousel-prev');

    if (!track || !slides.length) return;

    let currentIndex = 0;
    const totalSlides = slides.length;

    // 초기 상태 설정
    updateCarousel();

    // 이벤트 리스너 등록
    nextButton?.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % totalSlides;
        updateCarousel();
    });

    prevButton?.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        updateCarousel();
    });

    /**
     * 캐러셀 상태 업데이트
     */
    function updateCarousel() {
        slides.forEach((slide, index) => {
            // 모든 클래스 제거
            slide.classList.remove('active', 'prev-1', 'prev-2', 'next-1', 'next-2', 'prev-3', 'next-3');

            // 상대적 위치 계산
            const position = (index - currentIndex + totalSlides) % totalSlides;

            // 위치에 따른 클래스 할당
            if (position === 0) {
                slide.classList.add('active');
            } else if (position === 1 || position === -4) {
                slide.classList.add('next-1');
            } else if (position === 2 || position === -3) {
                slide.classList.add('next-2');
            } else if (position === -1 || position === 4) {
                slide.classList.add('prev-1');
            } else if (position === -2 || position === 3) {
                slide.classList.add('prev-2');
            } else if (position <= -3 || position >= 3) {
                slide.classList.add(position < 0 ? 'prev-3' : 'next-3');
            }
        });

        // 활성화된 슬라이드의 전시회 필터링
        const activeSlide = slides[currentIndex];
        if (activeSlide) {
            const exhibition = activeSlide.dataset.exhibition;
            filterArtworksByExhibition(exhibition);
        }
    }

    // 전시회 카드 클릭 이벤트
    slides.forEach((slide, index) => {
        slide.addEventListener('click', (e) => {
            e.preventDefault(); // 기본 링크 동작 방지

            // 이미 활성화된 카드를 클릭한 경우 무시
            if (index === currentIndex) return;

            // 클릭한 카드를 중앙으로 이동
            currentIndex = index;
            updateCarousel();

            // 클릭 효과 애니메이션
            animateItemClick(slide);
        });
    });
}
