/**
 * 작품 상세 페이지
 * 작품 상세 페이지의 모든 기능을 처리합니다.
 */
<style ref="stylesheet">
    @import url('../../css/artwork/ArtworkDetail.css');
</style>
import { showErrorMessage } from '/js/common/util/index.js';

// 애니메이션 관련 함수
function fadeIn(element, callback) {
    if (!element) return;
    element.style.display = '';
    element.classList.add('fade-in');
    requestAnimationFrame(() => {
        element.classList.add('show');
    });
    if (callback) {
        element.addEventListener('transitionend', function handler() {
            callback();
            element.removeEventListener('transitionend', handler);
        });
    }
}

function fadeOut(element, callback) {
    if (!element) return;
    if (element.style.display === 'none') {
        if (callback) callback();
        return;
    }
    element.classList.add('fade-out');
    requestAnimationFrame(() => {
        element.classList.add('hide');
    });
    element.addEventListener('transitionend', function handler() {
        element.style.display = 'none';
        element.classList.remove('fade-out', 'hide');
        if (callback) callback();
        element.removeEventListener('transitionend', handler);
    });
}

function animateButtonClick(button) {
    if (!button) return;
    button.classList.add('clicked');
    setTimeout(() => {
        button.classList.remove('clicked');
    }, 200);
}

// 이미지 뷰어 관련 함수
function initImageViewer() {
    initStickyImageSection();
    initImageZoom();
}

function initStickyImageSection() {
    const imageSection = document.querySelector('.artwork-image-section');
    const infoSection = document.querySelector('.artwork-info-section');

    if (!imageSection || !infoSection) return;

    updateStickyPosition();

    window.addEventListener('scroll', updateStickyPosition);
    window.addEventListener('resize', updateStickyPosition);

    function updateStickyPosition() {
        const imageSectionHeight = imageSection.offsetHeight;
        const infoSectionHeight = infoSection.offsetHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (imageSectionHeight < infoSectionHeight) {
            if (scrollTop > 100) {
                imageSection.classList.add('sticky');

                const bottomLimit = infoSection.offsetTop + infoSectionHeight - imageSectionHeight - 40;
                if (scrollTop > bottomLimit) {
                    imageSection.classList.remove('sticky');
                    imageSection.classList.add('at-bottom');
                } else {
                    imageSection.classList.remove('at-bottom');
                }
            } else {
                imageSection.classList.remove('sticky');
                imageSection.classList.remove('at-bottom');
            }
        }
    }
}

function initImageZoom() {
    const artworkImage = document.querySelector('.artwork-image');
    const imageWrapper = document.querySelector('.artwork-image-wrapper');

    if (!artworkImage || !imageWrapper) return;

    let isZoomed = false;

    artworkImage.addEventListener('click', () => {
        if (isZoomed) {
            artworkImage.classList.remove('zoomed');
            imageWrapper.classList.remove('zoomed-wrapper');
        } else {
            artworkImage.classList.add('zoomed');
            imageWrapper.classList.add('zoomed-wrapper');
        }

        isZoomed = !isZoomed;
    });

    document.addEventListener('click', (e) => {
        if (isZoomed && e.target !== artworkImage) {
            artworkImage.classList.remove('zoomed');
            imageWrapper.classList.remove('zoomed-wrapper');
            isZoomed = false;
        }
    });

    artworkImage.addEventListener('click', (e) => {
        e.stopPropagation();
    });
}

// 관련 작품 관련 함수
function initRelatedArtworks() {
    const scrollContainer = document.querySelector('.related_artworks_list');
    const prevBtn = document.querySelector('.prev_btn');
    const nextBtn = document.querySelector('.next_btn');

    if (!scrollContainer || !prevBtn || !nextBtn) return;

    prevBtn.addEventListener('click', () => {
        scrollContainer.scrollBy({ left: -340, behavior: 'smooth' });
        animateButtonClick(prevBtn);
        updateScrollButtons();
    });

    nextBtn.addEventListener('click', () => {
        scrollContainer.scrollBy({ left: 340, behavior: 'smooth' });
        animateButtonClick(nextBtn);
        updateScrollButtons();
    });

    scrollContainer.addEventListener('scroll', () => {
        updateScrollButtons();
    });

    updateScrollButtons();
    initRelatedArtworkItems();

    function updateScrollButtons() {
        const isAtStart = scrollContainer.scrollLeft <= 10;
        const isAtEnd = scrollContainer.scrollLeft + scrollContainer.offsetWidth >= scrollContainer.scrollWidth - 10;

        prevBtn.style.opacity = isAtStart ? '0.5' : '1';
        prevBtn.disabled = isAtStart;
        nextBtn.style.opacity = isAtEnd ? '0.5' : '1';
        nextBtn.disabled = isAtEnd;
    }
}

function initRelatedArtworkItems() {
    const relatedArtworks = document.querySelectorAll('.related_artwork_item');

    if (!relatedArtworks.length) return;

    relatedArtworks.forEach(item => {
        item.addEventListener('click', () => {
            const artworkId = item.dataset.artworkId;
            if (artworkId) {
                window.location.href = `/artwork/${artworkId}`;
            }
        });
    });
}

// 댓글 관련 함수
function initComment() {
    const commentForm = document.querySelector('.comment_form');
    const clearBtn = document.querySelector('.clear_comment');
    const commentInput = document.querySelector('.comment_input');
    const commentList = document.querySelector('.comment_list');

    if (!commentForm || !commentInput) return;

    commentForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const commentText = commentInput.value.trim();
        if (!commentText) return;

        addComment(commentText);
        commentInput.value = '';
    });

    if (clearBtn) {
        clearBtn.addEventListener('click', function () {
            commentInput.value = '';
            commentInput.focus();
        });
    }

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

function addComment(commentText) {
    const commentList = document.querySelector('.comment_list');
    if (!commentList) return;

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`;

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

    const deleteButton = newComment.querySelector('.delete_comment');
    deleteButton.addEventListener('click', function () {
        deleteComment(newComment);
    });

    commentList.prepend(newComment);
    fadeIn(newComment);
    updateCommentCount(1);
    saveComment(commentText);
}

function deleteComment(commentItem) {
    if (!commentItem) return;

    fadeOut(commentItem, () => {
        commentItem.remove();
        updateCommentCount(-1);

        const commentId = commentItem.dataset.commentId;
        if (commentId) {
            deleteCommentFromServer(commentId);
        }
    });
}

function updateCommentCount(change) {
    const commentCount = document.querySelector('.comment_count');
    if (!commentCount) return;

    const currentCount = parseInt(commentCount.textContent) || 0;
    commentCount.textContent = currentCount + change;
}

/**
 * 댓글을 서버에 저장합니다.
 * @param {string} commentText - 저장할 댓글 내용
 * @returns {Promise<void>}
 */
async function saveComment(commentText) {
    try {
        // TODO: 서버에 댓글 저장 로직 구현
        await fetch('/api/comments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: commentText,
                timestamp: new Date().toISOString()
            })
        });
    } catch (error) {
        showErrorMessage('댓글 저장에 실패했습니다.');
    }
}

/**
 * 댓글을 서버에서 삭제합니다.
 * @param {string} commentId - 삭제할 댓글 ID
 * @returns {Promise<void>}
 */
async function deleteCommentFromServer(commentId) {
    try {
        // TODO: 서버에 댓글 삭제 로직 구현
        await fetch(`/api/comments/${commentId}`, {
            method: 'DELETE'
        });
    } catch (error) {
        showErrorMessage('댓글 삭제에 실패했습니다.');
    }
}

// 페이지 초기화
document.addEventListener('DOMContentLoaded', function () {
    initImageViewer();
    initRelatedArtworks();
    initComment();

    const mainContent = document.querySelector('.artwork-detail-container');
    if (mainContent) {
        fadeIn(mainContent);
    }
});
