/**
 * 홈 메인 페이지 - 히어로 모듈
 * 히어로 섹션 관련 기능을 처리합니다.
 */

/**
 * 히어로 섹션 초기화
 */
export function initHero() {
    const heroSection = document.querySelector('.idx-hero-section');
    if (!heroSection) return;

    // 히어로 섹션 애니메이션 효과
    animateHeroSection(heroSection);

    // 스크롤 이벤트 리스너 추가
    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY;

        // 스크롤 위치에 따른 패럴랙스 효과
        if (scrollPosition < 500) {
            const translateY = scrollPosition * 0.3;
            heroSection.style.transform = `translateY(${translateY}px)`;
            heroSection.style.opacity = 1 - (scrollPosition / 500);
        }
    });
}

/**
 * 히어로 섹션 애니메이션
 * @param {HTMLElement} heroSection - 히어로 섹션 요소
 */
function animateHeroSection(heroSection) {
    // 초기 상태 설정
    heroSection.style.opacity = '0';
    heroSection.style.transform = 'translateY(20px)';

    // 트랜지션 설정
    heroSection.style.transition = 'opacity 1s ease, transform 1s ease';

    // 애니메이션 시작
    setTimeout(() => {
        heroSection.style.opacity = '1';
        heroSection.style.transform = 'translateY(0)';
    }, 100);
}
