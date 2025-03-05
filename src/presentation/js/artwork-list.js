/**
 * 작품 목록 페이지 스크립트
 * 카드 뷰와 테이블 뷰 전환, 검색 기능 등을 처리합니다.
 */
document.addEventListener('DOMContentLoaded', function() {
    initViewToggle();
    initSearchForm();
    initPagination();
});

/**
 * 카드 뷰와 테이블 뷰 전환 기능을 초기화합니다.
 */
function initViewToggle() {
    const cardViewBtn = document.getElementById('cardViewBtn');
    const tableViewBtn = document.getElementById('tableViewBtn');
    const cardView = document.getElementById('cardView');
    const tableView = document.getElementById('tableView');

    if (!cardViewBtn || !tableViewBtn || !cardView || !tableView) return;

    cardViewBtn.addEventListener('click', function() {
        cardViewBtn.classList.add('active');
        tableViewBtn.classList.remove('active');
        cardView.style.display = 'grid';
        tableView.style.display = 'none';
        
        // 로컬 스토리지에 선호하는 뷰 저장
        localStorage.setItem('preferredView', 'card');
    });

    tableViewBtn.addEventListener('click', function() {
        tableViewBtn.classList.add('active');
        cardViewBtn.classList.remove('active');
        tableView.style.display = 'table';
        cardView.style.display = 'none';
        
        // 로컬 스토리지에 선호하는 뷰 저장
        localStorage.setItem('preferredView', 'table');
    });

    // 저장된 선호 뷰가 있으면 적용
    const preferredView = localStorage.getItem('preferredView');
    if (preferredView === 'table') {
        tableViewBtn.click();
    }
}

/**
 * 검색 폼 기능을 초기화합니다.
 */
function initSearchForm() {
    const searchForm = document.getElementById('searchForm');
    
    if (!searchForm) return;

    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // 폼 데이터 수집
        const formData = new FormData(searchForm);
        const searchParams = new URLSearchParams();
        
        for (const [key, value] of formData.entries()) {
            if (value) {
                searchParams.append(key, value);
            }
        }
        
        // URL 업데이트 및 페이지 새로고침
        const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
        window.location.href = newUrl;
    });

    // URL 파라미터에서 검색 조건 복원
    const urlParams = new URLSearchParams(window.location.search);
    for (const [key, value] of urlParams.entries()) {
        const input = searchForm.querySelector(`[name="${key}"]`);
        if (input) {
            input.value = value;
        }
    }
}

/**
 * 페이지네이션 기능을 초기화합니다.
 */
function initPagination() {
    const pagination = document.querySelector('.pagination');
    
    if (!pagination) return;
    
    const buttons = pagination.querySelectorAll('button');
    
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            if (this.classList.contains('active') || this.querySelector('i')) return;
            
            // 현재 URL 파라미터 가져오기
            const urlParams = new URLSearchParams(window.location.search);
            
            // 페이지 번호 설정
            const pageNum = this.textContent;
            urlParams.set('page', pageNum);
            
            // URL 업데이트 및 페이지 새로고침
            const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
            window.location.href = newUrl;
        });
    });

    // 다음 페이지 버튼
    const nextPageBtn = pagination.querySelector('button:last-child');
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', function() {
            const urlParams = new URLSearchParams(window.location.search);
            let currentPage = parseInt(urlParams.get('page') || '1');
            urlParams.set('page', (currentPage + 1).toString());
            
            const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
            window.location.href = newUrl;
        });
    }
} 