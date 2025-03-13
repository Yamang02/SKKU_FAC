/**
 * 작품 목록 페이지 - 뷰 전환 모듈
 * 카드 뷰와 테이블 뷰 간의 전환 기능을 처리합니다.
 */
import { animateButtonClick } from '/js/artwork/common/animation.js';

/**
 * 뷰 전환 기능 초기화
 */
export function initViewToggle() {
    const cardViewBtn = document.getElementById('cardViewBtn');
    const tableViewBtn = document.getElementById('tableViewBtn');
    const cardView = document.getElementById('cardView');
    const tableView = document.getElementById('tableView');

    if (!cardViewBtn || !tableViewBtn || !cardView || !tableView) return;

    // 카드 뷰 버튼 클릭 이벤트
    cardViewBtn.addEventListener('click', () => {
        // 이미 활성화된 상태면 무시
        if (cardViewBtn.classList.contains('active')) return;

        // 버튼 활성화 상태 변경
        cardViewBtn.classList.add('active');
        tableViewBtn.classList.remove('active');

        // 현재 표시된 뷰 페이드 아웃
        tableView.style.opacity = '0';
        tableView.style.transform = 'translateY(10px)';

        // 애니메이션 후 뷰 전환
        setTimeout(() => {
            tableView.style.display = 'none';
            cardView.style.display = 'grid';

            // 약간의 지연 후 새 뷰 페이드 인
            setTimeout(() => {
                cardView.style.opacity = '1';
                cardView.style.transform = 'translateY(0)';
            }, 50);
        }, 300);

        // 클릭 애니메이션
        animateButtonClick(cardViewBtn);
    });

    // 테이블 뷰 버튼 클릭 이벤트
    tableViewBtn.addEventListener('click', () => {
        // 이미 활성화된 상태면 무시
        if (tableViewBtn.classList.contains('active')) return;

        // 버튼 활성화 상태 변경
        tableViewBtn.classList.add('active');
        cardViewBtn.classList.remove('active');

        // 현재 표시된 뷰 페이드 아웃
        cardView.style.opacity = '0';
        cardView.style.transform = 'translateY(10px)';

        // 애니메이션 후 뷰 전환
        setTimeout(() => {
            cardView.style.display = 'none';
            tableView.style.display = 'table';

            // 약간의 지연 후 새 뷰 페이드 인
            setTimeout(() => {
                tableView.style.opacity = '1';
                tableView.style.transform = 'translateY(0)';
            }, 50);
        }, 300);

        // 클릭 애니메이션
        animateButtonClick(tableViewBtn);
    });

    // 초기 상태 설정
    cardView.style.opacity = '1';
    cardView.style.transform = 'translateY(0)';
    tableView.style.opacity = '0';
}
