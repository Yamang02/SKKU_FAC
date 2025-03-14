/**
 * 작품 상세 페이지 - 댓글 모듈
 * 댓글 기능을 처리합니다.
 */
import { fadeIn, fadeOut } from '../common/util.js';

/**
 * 댓글 기능 초기화
 */
export function initComment() {
    const commentForm = document.querySelector('.comment_form');
    const clearBtn = document.querySelector('.clear_comment');
    const commentInput = document.querySelector('.comment_input');
    const commentList = document.querySelector('.comment_list');

    if (!commentForm || !commentInput) return;

    // 댓글 폼 제출 이벤트
    commentForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const commentText = commentInput.value.trim();
        if (!commentText) return;

        // 댓글 추가
        addComment(commentText);

        // 입력 필드 초기화
        commentInput.value = '';
    });

    // 댓글 지우기 버튼 이벤트
    if (clearBtn) {
        clearBtn.addEventListener('click', function () {
            commentInput.value = '';
            commentInput.focus();
        });
    }

    // 기존 댓글 삭제 버튼 이벤트
    if (commentList) {
        const deleteButtons = commentList.querySelectorAll('.delete_comment');
        deleteButtons.forEach(button => {
            button.addEventListener('click', function () {
                const commentItem = this.closest('.comment_item');
                if (commentItem) {
                    deleteComment(commentItem);
                }
            });
        });
    }
}

/**
 * 댓글 추가
 * @param {string} commentText - 댓글 내용
 */
function addComment(commentText) {
    const commentList = document.querySelector('.comment_list');
    if (!commentList) return;

    // 현재 시간 포맷팅
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`;

    // 새 댓글 요소 생성
    const newComment = document.createElement('div');
    newComment.className = 'comment_item';
    newComment.innerHTML = `
        <div class="comment_header">
            <span class="comment_author">사용자</span>
            <span class="comment_date">${formattedDate}</span>
            <button class="delete_comment" aria-label="댓글 삭제">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="comment_content">${commentText}</div>
    `;

    // 댓글 삭제 버튼 이벤트 추가
    const deleteButton = newComment.querySelector('.delete_comment');
    deleteButton.addEventListener('click', function () {
        deleteComment(newComment);
    });

    // 댓글 목록에 추가
    commentList.prepend(newComment);

    // 애니메이션 효과
    fadeIn(newComment);

    // 댓글 수 업데이트
    updateCommentCount(1);

    // 서버에 댓글 저장 (실제 구현 필요)
    saveComment(commentText);
}

/**
 * 댓글 삭제
 * @param {HTMLElement} commentItem - 댓글 요소
 */
function deleteComment(commentItem) {
    if (!commentItem) return;

    // 애니메이션 효과
    fadeOut(commentItem, () => {
        commentItem.remove();

        // 댓글 수 업데이트
        updateCommentCount(-1);

        // 서버에서 댓글 삭제 (실제 구현 필요)
        const commentId = commentItem.dataset.commentId;
        if (commentId) {
            deleteCommentFromServer(commentId);
        }
    });
}

/**
 * 댓글 수 업데이트
 * @param {number} change - 변경량 (1: 추가, -1: 삭제)
 */
function updateCommentCount(change) {
    const commentCount = document.querySelector('.comment_count');
    if (!commentCount) return;

    const currentCount = parseInt(commentCount.textContent) || 0;
    commentCount.textContent = currentCount + change;
}

/**
 * 서버에 댓글 저장 (실제 구현 필요)
 * @param {string} commentText - 댓글 내용
 */
function saveComment(commentText) {
    // TODO: 서버에 댓글 저장 로직 구현
    // eslint-disable-next-line no-unused-vars
    const payload = { content: commentText, timestamp: new Date().toISOString() };
    // 실제 구현에서는 이 payload를 서버로 전송
}

/**
 * 서버에서 댓글 삭제 (실제 구현 필요)
 * @param {string} commentId - 댓글 ID
 */
function deleteCommentFromServer(commentId) {
    // TODO: 서버에서 댓글 삭제 로직 구현
    // eslint-disable-next-line no-unused-vars
    const deleteRequest = { id: commentId, deleted: true };
    // 실제 구현에서는 이 deleteRequest를 서버로 전송
}
