/**
 * @file ExhibitionManagementList.js
 * @description Handles exhibition list management functionality including pagination,
 * filtering by exhibition type, featured status, year, and keyword search.
 * Also manages navigation to exhibition registration and detail pages.
 */

function goToPage(page) {
    const currentUrl = new URL(window.location.href);
    const searchParams = currentUrl.searchParams;
    searchParams.set('page', page);
    navigateWithLoading(currentUrl.toString(), '페이지를 이동하는 중입니다...');
}

document.addEventListener('DOMContentLoaded', function () {
    // 필터 적용 버튼
    document.getElementById('btnApplyFilter').addEventListener('click', function () {
        showLoading('필터를 적용하는 중입니다...', '잠시만 기다려주세요');

        const exhibitionType = document.querySelector('select[name="exhibitionType"]').value;
        const featured = document.querySelector('select[name="featured"]').value;
        const year = document.querySelector('select[name="year"]').value;
        const keyword = document.querySelector('input[name="keyword"]').value;

        const currentUrl = new URL(window.location.href);
        const searchParams = currentUrl.searchParams;

        if (exhibitionType) {
            searchParams.set('exhibitionType', exhibitionType);
        } else {
            searchParams.delete('exhibitionType');
        }

        if (featured) {
            searchParams.set('featured', featured);
        } else {
            searchParams.delete('featured');
        }

        if (year) {
            searchParams.set('year', year);
        } else {
            searchParams.delete('year');
        }

        if (keyword) {
            searchParams.set('keyword', keyword);
        } else {
            searchParams.delete('keyword');
        }

        searchParams.set('page', 1);

        // 필터 적용 직전에 로딩 상태를 해제하여 beforeunload 알림 방지
        setTimeout(() => {
            window.loadingManager.isLoading = false;
            window.location.href = currentUrl.toString();
        }, 50);
    });

    // 등록 버튼 (로딩 없이 직접 이동)
    const addExhibitionBtn = document.getElementById('addExhibitionBtn');
    if (addExhibitionBtn) {
        addExhibitionBtn.addEventListener('click', function () {
            // 로딩 없이 직접 이동하여 뒤로가기 문제 방지
            window.location.href = '/admin/management/exhibition/new';
        });
    }

    // 상세보기 버튼들 (로딩 없이 직접 이동)
    document.querySelectorAll('a.admin-button--secondary').forEach(link => {
        if (link.href && link.href.includes('/admin/management/exhibition/') && !link.href.includes('new')) {
            // 로딩 없이 직접 이동하여 beforeunload 방지
            // 기본 동작 그대로 사용
        }
    });
});
