/**
 * 홈 메인 페이지 - 추천 작품 모듈
 * 추천 작품 섹션 관련 기능을 처리합니다.
 */
import { fadeIn } from '../common/util.js';

/**
 * 추천 작품 섹션 초기화
 */
export function initFeatured() {
    const featuredSection = document.querySelector('.idx-featured-section');
    const artworkCards = document.querySelectorAll('.card--home');

    if (!featuredSection || !artworkCards.length) return;

    // 추천 작품 섹션 애니메이션
    animateFeaturedSection(featuredSection);

    // 카드 호버 효과
    artworkCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.classList.add('hover');
        });

        card.addEventListener('mouseleave', () => {
            card.classList.remove('hover');
        });
    });
}

/**
 * 추천 작품 섹션 애니메이션
 * @param {HTMLElement} featuredSection - 추천 작품 섹션 요소
 */
function animateFeaturedSection(featuredSection) {
    // 스크롤 이벤트 리스너 추가
    window.addEventListener('scroll', () => {
        const sectionTop = featuredSection.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;

        // 섹션이 화면에 들어왔을 때 애니메이션 실행
        if (sectionTop < windowHeight * 0.8) {
            fadeIn(featuredSection);

            // 작품 카드 순차적 애니메이션
            const cards = featuredSection.querySelectorAll('.card--home');
            cards.forEach((card, index) => {
                setTimeout(() => {
                    fadeIn(card);
                }, 100 * index);
            });
        }
    });
}
