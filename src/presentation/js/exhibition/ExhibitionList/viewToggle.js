/**
 * 전시 목록 페이지 - 뷰 전환 모듈
 * 그리드/리스트 뷰 전환 기능을 처리합니다.
 */

// 뷰 상태
const viewState = {
    currentView: 'grid' // 'grid' 또는 'list'
};

/**
 * 뷰 전환 초기화
 */
export function initViewToggle() {
    const gridViewButton = document.getElementById('grid-view');
    const listViewButton = document.getElementById('list-view');
    const exhibitionsContainer = document.getElementById('exhibitions-container');

    if (!gridViewButton || !listViewButton || !exhibitionsContainer) return;

    // 그리드 뷰 버튼 클릭 이벤트
    gridViewButton.addEventListener('click', () => {
        if (viewState.currentView !== 'grid') {
            // 버튼 활성화 상태 변경
            gridViewButton.classList.add('active');
            listViewButton.classList.remove('active');

            // 컨테이너 클래스 변경
            exhibitionsContainer.classList.remove('list-view');

            // 상태 업데이트
            viewState.currentView = 'grid';

            // 로컬 스토리지에 저장
            localStorage.setItem('exhibitionViewMode', 'grid');
        }
    });

    // 리스트 뷰 버튼 클릭 이벤트
    listViewButton.addEventListener('click', () => {
        if (viewState.currentView !== 'list') {
            // 버튼 활성화 상태 변경
            listViewButton.classList.add('active');
            gridViewButton.classList.remove('active');

            // 컨테이너 클래스 변경
            exhibitionsContainer.classList.add('list-view');

            // 상태 업데이트
            viewState.currentView = 'list';

            // 로컬 스토리지에 저장
            localStorage.setItem('exhibitionViewMode', 'list');
        }
    });

    // 로컬 스토리지에서 이전 뷰 모드 복원
    restoreViewMode();
}

/**
 * 이전 뷰 모드 복원
 */
function restoreViewMode() {
    const savedViewMode = localStorage.getItem('exhibitionViewMode');

    if (savedViewMode === 'list') {
        // 리스트 뷰로 전환
        const listViewButton = document.getElementById('list-view');
        const gridViewButton = document.getElementById('grid-view');
        const exhibitionsContainer = document.getElementById('exhibitions-container');

        if (listViewButton && gridViewButton && exhibitionsContainer) {
            listViewButton.classList.add('active');
            gridViewButton.classList.remove('active');
            exhibitionsContainer.classList.add('list-view');
            viewState.currentView = 'list';
        }
    }
}
