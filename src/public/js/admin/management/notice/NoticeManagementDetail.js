/**
 * @file NoticeManagementDetail.js
 * @description Handles notice detail page functionality including form submission for
 * creating/updating notices and deleting notices. Manages loading states and navigation.
 */

// Get data from data attributes
let noticePageData = {};

document.addEventListener('DOMContentLoaded', function () {
    // Read data from data attributes
    const adminManagement = document.querySelector('.admin-management');
    noticePageData = {
        isEdit: adminManagement.dataset.isEdit === 'true',
        userName: adminManagement.dataset.userName
    };

    document.getElementById('noticeForm').addEventListener('submit', handleNoticeFormSubmit);

    // 목록으로 버튼에 로딩 적용
    const backButton = document.querySelector('a[onclick="history.back()"]');
    if (backButton) {
        backButton.addEventListener('click', function (e) {
            e.preventDefault();
            navigateWithLoading('/admin/management/notice', '목록으로 이동하는 중입니다...');
        });
    }
});

async function handleNoticeFormSubmit(event) {
    event.preventDefault();

    if (!confirm('저장하시겠습니까?')) {
        return;
    }

    try {
        showLoading('공지사항을 저장하는 중입니다...', '잠시만 기다려주세요');

        const formData = new FormData(event.target);
        const now = new Date().toISOString();
        const isEdit = noticePageData.isEdit;

        const noticeData = {
            title: formData.get('title'),
            content: formData.get('content'),
            status: formData.get('status'),
            isImportant: formData.get('isImportant') === 'on',
            updatedAt: now
        };

        // 생성 시에만 작성자 정보와 createdAt 추가
        if (!isEdit) {
            noticeData.author = noticePageData.userName;
            noticeData.createdAt = now;
        }

        const method = isEdit ? 'PUT' : 'POST';
        const url = isEdit ? `/admin/management/notice/${formData.get('id')}` : '/admin/management/notice/registration';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(noticeData)
        });

        const result = await response.json();

        if (result.success) {
            alert('저장되었습니다.');
            navigateWithLoading('/admin/management/notice', '목록으로 이동하는 중입니다...');
        } else {
            hideLoading();
            alert(result.message || '저장에 실패했습니다.');
        }
    } catch (error) {
        hideLoading();
        console.error('Error:', error);
        alert('저장 중 오류가 발생했습니다.');
    }
}

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

            const result = await response.json();

            if (result.success) {
                alert(result.message);
                navigateWithLoading('/admin/management/notice', '목록으로 이동하는 중입니다...');
            } else {
                hideLoading();
                alert(result.message || '공지사항 삭제에 실패했습니다.');
            }
        } catch (error) {
            hideLoading();
            console.error('Error:', error);
            alert('공지사항 삭제 중 오류가 발생했습니다.');
        }
    }
}
