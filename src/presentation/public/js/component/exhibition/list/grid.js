/**
 * 전시 목록 페이지 - 그리드 모듈
 * 전시회 그리드 관련 기능을 처리합니다.
 */
import { fadeIn } from '../../../utils/index.js';
import { showExhibitionModal } from './modal.js';

/**
 * 그리드 초기화
 */
export function initGrid() {
    const exhibitionGrid = document.querySelector('.exhibition-grid');
    const exhibitionCards = document.querySelectorAll('.exhibition-card');

    if (!exhibitionGrid || !exhibitionCards.length) return;

    // 그리드 애니메이션 효과
    animateGrid(exhibitionGrid, exhibitionCards);

    // 카드 호버 효과
    initCardHoverEffects(exhibitionCards);

    // 카드 클릭 이벤트
    initCardClickEvents(exhibitionCards);

    // 필터링 기능 (있는 경우)
    initFiltering();
}

/**
 * 그리드 애니메이션
 * @param {HTMLElement} grid - 그리드 요소
 * @param {NodeList} cards - 카드 요소 목록
 */
function animateGrid(grid, cards) {
    // 초기 상태 설정
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });

    // 스크롤 이벤트 리스너 추가
    window.addEventListener('scroll', () => {
        const gridTop = grid.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;

        // 그리드가 화면에 들어왔을 때 애니메이션 실행
        if (gridTop < windowHeight * 0.8) {
            // 카드 순차적 애니메이션
            cards.forEach((card, index) => {
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 100 * index);
            });

            // 이벤트 리스너 제거 (한 번만 실행)
            window.removeEventListener('scroll', this);
        }
    });

    // 페이지 로드 시 이미 보이는 경우 애니메이션 실행
    setTimeout(() => {
        const gridTop = grid.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;

        if (gridTop < windowHeight) {
            cards.forEach((card, index) => {
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 100 * index);
            });
        }
    }, 100);
}

/**
 * 카드 호버 효과 초기화
 * @param {NodeList} cards - 카드 요소 목록
 */
function initCardHoverEffects(cards) {
    cards.forEach(card => {
        // 호버 효과
        card.addEventListener('mouseenter', () => {
            card.classList.add('hover');
        });

        card.addEventListener('mouseleave', () => {
            card.classList.remove('hover');
        });
    });
}

/**
 * 필터링 기능 초기화
 */
function initFiltering() {
    const filterButtons = document.querySelectorAll('.filter-button');
    const exhibitionCards = document.querySelectorAll('.exhibition-card');

    if (!filterButtons.length) return;

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 활성 버튼 스타일 변경
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const category = button.dataset.category;

            // 모든 전시회 표시 또는 필터링
            if (category === 'all') {
                exhibitionCards.forEach(card => {
                    fadeIn(card);
                });
            } else {
                exhibitionCards.forEach(card => {
                    if (card.dataset.category === category) {
                        fadeIn(card);
                    } else {
                        card.style.display = 'none';
                    }
                });
            }
        });
    });
}

/**
 * 카드 클릭 이벤트 초기화
 * @param {NodeList} cards - 카드 요소 목록
 */
function initCardClickEvents(cards) {
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const exhibitionData = {
                id: card.dataset.exhibitionId,
                imageUrl: card.querySelector('.exhibition-image').src,
                title: card.querySelector('.exhibition-title').textContent,
                startDate: card.dataset.startDate,
                endDate: card.dataset.endDate,
                description: card.dataset.description,
                type: card.querySelector('.exhibition-type')?.textContent || '일반 전시',
                viewingHours: card.dataset.viewingHours || '10:00 - 18:00',
                // 기간별 전시장소 데이터 구성
                locations: card.dataset.locations ?
                    JSON.parse(card.dataset.locations) :
                    [{
                        startDate: card.dataset.startDate,
                        endDate: card.dataset.endDate,
                        name: card.dataset.location
                    }]
            };
            showExhibitionModal(exhibitionData);
        });
    });
}
