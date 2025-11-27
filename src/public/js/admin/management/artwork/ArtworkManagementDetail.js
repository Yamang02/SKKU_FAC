/**
 * 작품 관리 상세 페이지 스크립트
 */

document.addEventListener('DOMContentLoaded', function () {
    // 폼 제출 시 로딩 표시
    const artworkForm = document.getElementById('artworkForm');
    if (artworkForm) {
        artworkForm.addEventListener('submit', function () {
            showLoading('작품 정보를 저장하는 중입니다...', '잠시만 기다려주세요');
        });
    }

    // 목록으로 버튼에 로딩 적용
    const backButton = document.querySelector('a[href="/admin/management/artwork"]');
    if (backButton) {
        backButton.addEventListener('click', function (e) {
            e.preventDefault();
            navigateWithLoading(this.href, '목록으로 이동하는 중입니다...');
        });
    }

    // 취소 버튼에 로딩 적용
    const cancelButton = document.querySelector('a.admin-button--secondary');
    if (cancelButton) {
        cancelButton.addEventListener('click', function (e) {
            e.preventDefault();
            navigateWithLoading(this.href, '목록으로 이동하는 중입니다...');
        });
    }

    // 삭제 폼에 확인 대화상자만 적용 (로딩 표시 제거)
    const deleteForm = document.getElementById('deleteForm');
    if (deleteForm) {
        deleteForm.addEventListener('submit', function (e) {
            const confirmed = confirm('정말로 이 작품을 삭제하시겠습니까?\n\n' +
                '⚠️ 경고: 이 작업은 되돌릴 수 없습니다.\n' +
                '• 해당 작품의 모든 정보가 영구적으로 삭제됩니다.\n' +
                '• 작품과 관련된 모든 데이터(이미지, 설명 등)가 함께 삭제됩니다.\n' +
                '• 이 작업은 되돌릴 수 없으므로 신중하게 결정해주세요.');
            if (!confirmed) {
                e.preventDefault();
            }
            // 로딩 표시 없이 바로 제출하여 beforeunload 방지
        });
    }
});
