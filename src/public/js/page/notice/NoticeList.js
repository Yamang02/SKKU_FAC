/**
 * 공지사항 목록 페이지
 * 공지사항 목록의 기능을 처리합니다.
 */


document.addEventListener('DOMContentLoaded', () => {
    initSearch();
    initNoticeList();
});

function initSearch() {
    const searchForm = document.querySelector('.search-form');
    const resetButton = document.querySelector('.search-button--reset');

    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            const keyword = document.getElementById('keyword').value.trim();
            if (!keyword) {
                e.preventDefault();
                const searchInput = document.getElementById('keyword');
                searchInput.classList.add('error');
                searchInput.placeholder = '검색어를 입력해주세요';
                setTimeout(() => {
                    searchInput.classList.remove('error');
                    searchInput.placeholder = '검색어 입력';
                }, 2000);
            }
        });
    }

    if (resetButton) {
        resetButton.addEventListener('click', () => {
            document.getElementById('keyword').value = '';
            window.location.href = window.location.pathname;
        });
    }
}

function initNoticeList() {
    // 공지사항 아이템 클릭 이벤트
    const noticeItems = document.querySelectorAll('.notice-item');

    noticeItems.forEach(item => {
        item.addEventListener('click', function () {
            const link = this.querySelector('.notice-link');
            if (link) {
                link.click();
            }
        });
    });

    // 페이지 로딩 애니메이션
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.style.opacity = '0';
        requestAnimationFrame(() => {
            mainContent.style.transition = 'opacity 0.3s ease';
            mainContent.style.opacity = '1';
        });
    }
}

// 에러 스타일 추가
const style = document.createElement('style');
style.textContent = `
    .search-input.error {
        border-color: #ff4757;
        animation: shake 0.5s;
    }

    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);
