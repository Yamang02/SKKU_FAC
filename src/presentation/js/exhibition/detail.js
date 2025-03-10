/**
 * 전시회 상세 페이지 JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    // 이미지 지연 로딩 처리
    const lazyImages = document.querySelectorAll('.artwork-image');

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const image = entry.target;
                    image.src = image.dataset.src;
                    imageObserver.unobserve(image);
                }
            });
        });

        lazyImages.forEach(image => {
            imageObserver.observe(image);
        });
    } else {
        // IntersectionObserver를 지원하지 않는 브라우저를 위한 폴백
        lazyImages.forEach(image => {
            image.src = image.dataset.src;
        });
    }

    // 작품 필터링 기능 (있는 경우)
    const filterButtons = document.querySelectorAll('.filter-button');
    const artworkCards = document.querySelectorAll('.artwork-card');

    if (filterButtons.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // 활성 버튼 스타일 변경
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                const category = button.dataset.category;

                // 모든 작품 표시 또는 필터링
                if (category === 'all') {
                    artworkCards.forEach(card => {
                        card.style.display = 'block';
                    });
                } else {
                    artworkCards.forEach(card => {
                        if (card.dataset.category === category) {
                            card.style.display = 'block';
                        } else {
                            card.style.display = 'none';
                        }
                    });
                }
            });
        });
    }

    // 작품 이미지 클릭 시 확대 보기 (옵션)
    const artworkLinks = document.querySelectorAll('.artwork-link');

    artworkLinks.forEach(link => {
        link.addEventListener('click', () => {
            // 작품 상세 페이지로 이동하는 기본 동작 유지
            // 필요한 경우 여기에 이미지 확대 보기 기능 추가
        });
    });

    // 전시회 설명 더보기/접기 기능 (긴 설명이 있는 경우)
    const descriptionContent = document.querySelector('.exhibition-description-content');
    const expandButton = document.querySelector('.expand-description');

    if (expandButton && descriptionContent) {
        const originalHeight = descriptionContent.scrollHeight;
        const collapsedHeight = 200; // 접힌 상태의 높이 (px)

        if (originalHeight > collapsedHeight) {
            descriptionContent.style.maxHeight = `${collapsedHeight}px`;
            descriptionContent.style.overflow = 'hidden';
            expandButton.style.display = 'block';

            let isExpanded = false;

            expandButton.addEventListener('click', () => {
                if (isExpanded) {
                    descriptionContent.style.maxHeight = `${collapsedHeight}px`;
                    expandButton.textContent = '더보기';
                } else {
                    descriptionContent.style.maxHeight = `${originalHeight}px`;
                    expandButton.textContent = '접기';
                }

                isExpanded = !isExpanded;
            });
        } else {
            expandButton.style.display = 'none';
        }
    }
});
