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
        // 버튼 활성화 상태 변경
        cardViewBtn.classList.add('active');
        tableViewBtn.classList.remove('active');

        // 뷰 전환
        cardView.style.display = 'grid';
        tableView.style.display = 'none';

        // 클릭 애니메이션
        animateButtonClick(cardViewBtn);
    });

    // 테이블 뷰 버튼 클릭 이벤트
    tableViewBtn.addEventListener('click', () => {
        // 버튼 활성화 상태 변경
        tableViewBtn.classList.add('active');
        cardViewBtn.classList.remove('active');

        // 뷰 전환
        tableView.style.display = 'table';
        cardView.style.display = 'none';

        // 클릭 애니메이션
        animateButtonClick(tableViewBtn);
    });
}
