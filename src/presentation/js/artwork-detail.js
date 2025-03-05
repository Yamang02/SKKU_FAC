/**
 * 작품 상세 페이지 스크립트
 * 
 * 이 파일은 작품 상세 페이지의 모든 인터랙션을 관리합니다.
 * - 관련 작품 스크롤 기능
 * - 댓글 제출 처리
 * - 이미지 섹션 Sticky 기능
 */

document.addEventListener('DOMContentLoaded', function() {
    // 스크롤 버튼 기능
    initRelatedArtworksScroll();
    
    // 댓글 기능
    initCommentForm();
    
    // Sticky 기능
    initStickyImageSection();
});

/**
 * 관련 작품 스크롤 기능 초기화
 */
function initRelatedArtworksScroll() {
    const scrollContainer = document.querySelector('.related-artworks-list');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    if (scrollContainer && prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            scrollContainer.scrollBy({ left: -340, behavior: 'smooth' });
        });

        nextBtn.addEventListener('click', () => {
            scrollContainer.scrollBy({ left: 340, behavior: 'smooth' });
        });
    }
}

/**
 * 댓글 폼 기능 초기화
 */
function initCommentForm() {
    const commentForm = document.querySelector('.comment-form');
    const clearBtn = document.querySelector('.clear-comment');
    const commentInput = document.querySelector('.comment-input');
    
    if (commentForm) {
        commentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // 여기에 댓글 제출 로직 구현
            console.log('댓글 제출:', commentInput.value);
            
            // 폼 초기화
            commentInput.value = '';
        });
    }
    
    if (clearBtn && commentInput) {
        clearBtn.addEventListener('click', function() {
            commentInput.value = '';
            commentInput.focus();
        });
    }
}

/**
 * 이미지 섹션 Sticky 기능 초기화
 */
function initStickyImageSection() {
    const imageSection = document.querySelector('.artwork-image-section');
    const headerHeight = document.querySelector('header')?.offsetHeight || 0;
    
    if (imageSection) {
        function updateStickyPosition() {
            const windowHeight = window.innerHeight;
            const imageSectionHeight = imageSection.offsetHeight;
            
            // 이미지 섹션이 화면보다 크면 sticky 기능을 비활성화
            if (imageSectionHeight > windowHeight - headerHeight - 40) {
                imageSection.style.position = 'relative';
            } else {
                imageSection.style.position = 'sticky';
                imageSection.style.top = `${headerHeight + 20}px`;
            }
        }
        
        // 초기 로드 및 리사이즈 시 실행
        updateStickyPosition();
        window.addEventListener('resize', updateStickyPosition);
    }
} 