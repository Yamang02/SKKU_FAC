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

// 댓글 관련 기능
document.addEventListener('DOMContentLoaded', () => {
    const commentForm = document.querySelector('.comment-form');
    const commentInput = commentForm.querySelector('.comment-form__input');
    const clearButton = commentForm.querySelector('.btn--comment-clear');

    // 댓글 입력 폼 초기화
    const clearCommentForm = () => {
        if (commentInput.value.trim()) {
            Modal.show({
                content: '작성 중인 내용을 모두 지우시겠습니까?',
                type: 'danger'
            }).then((confirmed) => {
                if (confirmed) {
                    commentInput.value = '';
                    Toast.show('댓글이 초기화되었습니다.');
                }
            });
        }
    };

    // 댓글 작성
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        const content = commentInput.value.trim();

        if (!content) {
            Toast.show('댓글 내용을 입력해주세요.', 'error');
            return;
        }

        try {
            const response = await fetch('/api/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content })
            });

            if (!response.ok) throw new Error('댓글 작성에 실패했습니다.');

            Toast.show('댓글이 작성되었습니다.', 'success');
            commentInput.value = '';
            location.reload();
        } catch (error) {
            Toast.show(error.message, 'error');
        }
    };

    // 댓글 수정
    const handleCommentEdit = async (commentId) => {
        const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`).closest('.comment');
        const contentElement = commentElement.querySelector('.comment__content');
        const originalContent = contentElement.textContent.trim();

        // 수정 모드로 전환
        contentElement.innerHTML = `
            <textarea class="comment-form__input">${originalContent}</textarea>
            <div class="comment__edit-actions">
                <button class="btn btn--secondary" data-action="cancel">취소</button>
                <button class="btn btn--primary" data-action="save">저장</button>
            </div>
        `;

        const handleEditAction = async (e) => {
            const action = e.target.dataset.action;
            if (!action) return;

            if (action === 'cancel') {
                contentElement.innerHTML = originalContent;
            } else if (action === 'save') {
                const newContent = contentElement.querySelector('textarea').value.trim();

                if (!newContent) {
                    Toast.show('댓글 내용을 입력해주세요.', 'error');
                    return;
                }

                try {
                    const response = await fetch(`/api/comments/${commentId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ content: newContent })
                    });

                    if (!response.ok) throw new Error('댓글 수정에 실패했습니다.');

                    Toast.show('댓글이 수정되었습니다.', 'success');
                    contentElement.innerHTML = newContent;
                } catch (error) {
                    Toast.show(error.message, 'error');
                }
            }

            contentElement.removeEventListener('click', handleEditAction);
        };

        contentElement.addEventListener('click', handleEditAction);
    };

    // 댓글 삭제
    const handleCommentDelete = async (commentId) => {
        const confirmed = await Modal.show({
            title: '댓글 삭제',
            content: '정말 이 댓글을 삭제하시겠습니까?',
            confirmText: '삭제',
            type: 'danger'
        });

        if (confirmed) {
            try {
                const response = await fetch(`/api/comments/${commentId}`, {
                    method: 'DELETE'
                });

                if (!response.ok) throw new Error('댓글 삭제에 실패했습니다.');

                Toast.show('댓글이 삭제되었습니다.', 'success');
                document.querySelector(`[data-comment-id="${commentId}"]`).closest('.comment').remove();
            } catch (error) {
                Toast.show(error.message, 'error');
            }
        }
    };

    // 이벤트 리스너 등록
    clearButton.addEventListener('click', clearCommentForm);
    commentForm.addEventListener('submit', handleCommentSubmit);

    // 댓글 수정/삭제 버튼 이벤트 위임
    document.querySelector('.comments__list').addEventListener('click', (e) => {
        const actionButton = e.target.closest('.btn--action');
        if (!actionButton) return;

        const commentId = actionButton.dataset.commentId;
        if (actionButton.classList.contains('btn--delete')) {
            handleCommentDelete(commentId);
        } else {
            handleCommentEdit(commentId);
        }
    });
});
