/**
 * @file NoticeManagementList.js
 * @description Handles notice list management functionality including pagination,
 * filtering by status and importance, keyword search, and notice deletion.
 * Manages navigation to notice registration and detail pages with loading states.
 */

async function deleteNotice(id) {
    if (confirm('정말로 이 공지사항을 삭제하시겠습니까?')) {
        try {
            showLoading('공지사항을 삭제하는 중입니다...', '잠시만 기다려주세요');

            const response = await fetch(`/admin/management/notice/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                window.location.reload();
            } else {
                hideLoading();
                alert('삭제에 실패했습니다.');
            }
        } catch (error) {
            hideLoading();
            console.error('Error:', error);
            alert('삭제 중 오류가 발생했습니다.');
        }
    }
}

function goToPage(page) {
    const currentUrl = new URL(window.location.href);
    const searchParams = currentUrl.searchParams;
    searchParams.set('page', page);
    navigateWithLoading(currentUrl.toString(), '페이지를 이동하는 중입니다...');
}

// 필터 적용 버튼에 로딩 적용
document.addEventListener('DOMContentLoaded', function () {
    const filterButton = document.querySelector('.admin-filter .admin-button--primary');
    if (filterButton) {
        filterButton.addEventListener('click', function () {
            showLoading('필터를 적용하는 중입니다...', '잠시만 기다려주세요');

            // 필터 적용 직전에 로딩 상태를 해제하여 beforeunload 알림 방지
            setTimeout(() => {
                window.loadingManager.isLoading = false;
            }, 50);
        });
    }

    // 등록 버튼에 로딩 적용
    const registerButton = document.querySelector('a[href="/admin/management/notice/registration"]');
    if (registerButton) {
        registerButton.addEventListener('click', function (e) {
            e.preventDefault();
            navigateWithLoading(this.href, '등록 페이지로 이동하는 중입니다...');
        });
    }

    // 수정 버튼들에 로딩 적용
    document.querySelectorAll('a[href*="/admin/management/notice/"]').forEach(link => {
        if (link.href.includes('/admin/management/notice/') && !link.href.includes('registration')) {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                navigateWithLoading(this.href, '상세 페이지로 이동하는 중입니다...');
            });
        }
    });
});
