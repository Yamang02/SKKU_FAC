// 모달 및 토스트 유틸리티

const Modal = {
    show({ title, content, confirmText = '확인', cancelText = '취소', type = 'primary' }) {
        return new Promise((resolve) => {
            const backdrop = document.createElement('div');
            backdrop.className = 'modal-backdrop';

            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = `
                ${title ? `<h3 class="modal__title">${title}</h3>` : ''}
                <div class="modal__content">${content}</div>
                <div class="modal__actions">
                    <button class="modal__btn modal__btn--secondary" data-action="cancel">${cancelText}</button>
                    <button class="modal__btn modal__btn--${type}" data-action="confirm">${confirmText}</button>
                </div>
            `;

            backdrop.appendChild(modal);
            document.body.appendChild(backdrop);

            // 애니메이션을 위해 약간의 지연 후 show 클래스 추가
            requestAnimationFrame(() => backdrop.classList.add('show'));

            const handleClick = (e) => {
                if (e.target.dataset.action === 'confirm') {
                    resolve(true);
                } else if (e.target.dataset.action === 'cancel' || e.target === backdrop) {
                    resolve(false);
                }
                backdrop.classList.remove('show');
                setTimeout(() => backdrop.remove(), 300);
            };

            backdrop.addEventListener('click', handleClick);
            modal.addEventListener('click', (e) => e.stopPropagation());
        });
    }
};

const Toast = {
    show(message, type = 'default') {
        const toast = document.createElement('div');
        toast.className = `toast ${type ? `toast--${type}` : ''}`;
        toast.textContent = message;

        document.body.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('show'));

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

// 댓글 관련 코드 주석 처리
// const handleCommentSubmit = async (e) => {
//     e.preventDefault();
//     const formData = new FormData(e.target);
//     const commentData = {
//         content: formData.get('content'),
//         noticeId: noticeId
//     };

//     try {
//         const response = await fetch('/api/comments', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(commentData)
//         });

//         if (response.ok) {
//             window.location.reload();
//         } else {
//             alert('댓글 작성에 실패했습니다.');
//         }
//     } catch (error) {
//         console.error('Error:', error);
//         alert('댓글 작성 중 오류가 발생했습니다.');
//     }
// };

// const handleCommentEdit = async (commentId, content) => {
//     try {
//         const response = await fetch(`/api/comments/${commentId}`, {
//             method: 'PUT',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({ content })
//         });

//         if (response.ok) {
//             window.location.reload();
//         } else {
//             alert('댓글 수정에 실패했습니다.');
//         }
//     } catch (error) {
//         console.error('Error:', error);
//         alert('댓글 수정 중 오류가 발생했습니다.');
//     }
// };

// const handleCommentDelete = async (commentId) => {
//     if (!confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
//         return;
//     }

//     try {
//         const response = await fetch(`/api/comments/${commentId}`, {
//             method: 'DELETE'
//         });

//         if (response.ok) {
//             window.location.reload();
//         } else {
//             alert('댓글 삭제에 실패했습니다.');
//         }
//     } catch (error) {
//         console.error('Error:', error);
//         alert('댓글 삭제 중 오류가 발생했습니다.');
//     }
// };

// 이벤트 리스너 주석 처리
// commentForm.addEventListener('submit', handleCommentSubmit);

// document.querySelector('.comments__list').addEventListener('click', (e) => {
//     const target = e.target;
//     if (target.classList.contains('comment__edit-btn')) {
//         const commentId = target.dataset.commentId;
//         const content = prompt('수정할 내용을 입력하세요:', target.dataset.content);
//         if (content !== null) {
//             handleCommentEdit(commentId, content);
//         }
//     } else if (target.classList.contains('comment__delete-btn')) {
//         const commentId = target.dataset.commentId;
//         handleCommentDelete(commentId);
//     }
// });
