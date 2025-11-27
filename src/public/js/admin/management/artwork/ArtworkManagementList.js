/**
 * 작품 관리 목록 페이지 스크립트
 */

document.addEventListener('DOMContentLoaded', function () {
    // 필터 폼 제출 시 로딩 표시
    const filterForm = document.querySelector('.admin-filter__form');
    if (filterForm) {
        filterForm.addEventListener('submit', function (e) {
            e.preventDefault(); // 폼 제출 방지

            showLoading('필터를 적용하는 중입니다...', '잠시만 기다려주세요');

            // 폼 데이터 수집
            const formData = new FormData(filterForm);
            const currentUrl = new URL(window.location.href);
            const searchParams = currentUrl.searchParams;

            // 기존 파라미터 초기화
            searchParams.delete('status');
            searchParams.delete('isFeatured');
            searchParams.delete('sort');
            searchParams.delete('order');
            searchParams.delete('keyword');
            searchParams.delete('page');

            // 새로운 파라미터 설정
            for (const [key, value] of formData.entries()) {
                if (value) {
                    searchParams.set(key, value);
                }
            }
            searchParams.set('page', 1);

            // 필터 적용 직전에 로딩 상태를 해제하여 beforeunload 알림 방지
            setTimeout(() => {
                window.loadingManager.isLoading = false;
                window.location.href = currentUrl.toString();
            }, 50);
        });
    }

    // 정렬 링크들 (로딩 없이 직접 이동)
    document.querySelectorAll('.sort-btn').forEach(link => {
        // 로딩 없이 직접 이동하여 beforeunload 방지
        // 기본 동작 그대로 사용
    });

    // 상세보기 링크들 (로딩 없이 직접 이동)
    document.querySelectorAll('a.admin-link, a.admin-button--info').forEach(link => {
        if (link.href && link.href.match(/\/admin\/management\/artwork\/\d+$/)) {
            // 로딩 없이 직접 이동하여 beforeunload 방지
            // 기본 동작 그대로 사용
        }
    });

    // 페이지네이션 링크들에 로딩 적용
    document.querySelectorAll('.admin-pagination a').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            navigateWithLoading(this.href, '페이지를 이동하는 중입니다...');
        });
    });
});
